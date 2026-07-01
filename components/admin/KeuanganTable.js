import { useState, useMemo, useCallback, Fragment } from "react";
import {
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatCurrency } from "../../lib/train-utils";

const STATUS_CONFIG = {
  paid: { label: "Lunas", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: CheckCircle },
  pending: { label: "Menunggu Pembayaran", badge: "bg-amber-50 text-amber-700 border border-amber-200", icon: ClockIcon },
  cancelled: { label: "Dibatalkan", badge: "bg-red-50 text-red-700 border border-red-200", icon: XCircle },
};

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const text = String(value);
  const date = text.includes("T") || text.includes(" ")
    ? new Date(text.replace(" ", "T"))
    : new Date(`${text}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(tanggal_pembelian) {
  const d = toDate(tanggal_pembelian);
  if (!d) return "-";
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(tanggal_pembelian) {
  const d = toDate(tanggal_pembelian);
  if (!d) return "-";
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });
}

function SortIcon({ column, sortKey, sortDir }) {
  if (column !== sortKey) return <ArrowUpDown size={11} className="text-slate-300" />;
  return sortDir === "asc" ? <ArrowUp size={11} className="text-indigo-600" /> : <ArrowDown size={11} className="text-indigo-600" />;
}

function ExpandedRow({ p }) {
  const st = p.status_pembayaran || "paid";
  const cfg = STATUS_CONFIG[st] || STATUS_CONFIG.paid;
  const Icon = cfg.icon;
  return (
    <tr className="expanded-row">
      <td colSpan={10}>
        <div className="expandable-content">
          <div className="expandable-grid">
            <div>
              <span className="expandable-label">Kode Booking</span>
              <span className="expandable-value font-mono">{p.kode_booking || "-"}</span>
            </div>
            <div>
              <span className="expandable-label">Email</span>
              <span className="expandable-value">{p.email_pembeli || "-"}</span>
            </div>
            <div>
              <span className="expandable-label">No. Telepon</span>
              <span className="expandable-value">{p.no_telepon || "-"}</span>
            </div>
            <div>
              <span className="expandable-label">Tanggal Keberangkatan</span>
              <span className="expandable-value">{p.tanggal_keberangkatan || "-"}</span>
            </div>
            <div>
              <span className="expandable-label">Status Pembayaran</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
                <Icon size={10} /> {cfg.label}
              </span>
            </div>
            <div>
              <span className="expandable-label">Pembayaran</span>
              <span className="expandable-value">{p.metode_pembayaran?.replace(/_/g, " ") || "-"}</span>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function KeuanganTable({
  data,
  total,
  page,
  perPage,
  status,
  searchQuery,
  onSearchChange,
  pagination,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("desc");

  const handleSort = useCallback((key) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDir("asc");
      return key;
    });
  }, []);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (sortKey === "total_harga" || sortKey === "jumlah_tiket" || sortKey === "id") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      aVal = String(aVal || "").toLowerCase();
      bVal = String(bVal || "").toLowerCase();
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  const handleExportCSV = useCallback(() => {
    const headers = [
      "ID",
      "Tanggal",
      "Pembeli",
      "Email",
      "Telepon",
      "Kereta",
      "Rute",
      "Kelas",
      "Tiket",
      "Total",
      "Status",
      "Pembayaran",
      "Kode Booking",
      "Tanggal Keberangkatan",
    ];
    const rows = data.map((p) => [
      p.id,
      formatDateShort(p.tanggal_pembelian),
      p.nama_pembeli,
      p.email_pembeli || "",
      p.no_telepon || "",
      p.nama_kereta,
      `${p.asal || ""} -> ${p.tujuan || ""}`,
      p.kelas || "",
      p.jumlah_tiket,
      p.total_harga,
      p.status_pembayaran || "paid",
      (p.metode_pembayaran || "").replace(/_/g, " "),
      p.kode_booking || "",
      p.tanggal_keberangkatan || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-keuangan-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const sortColumns = [
    { key: "id", label: "ID" },
    { key: "tanggal_pembelian", label: "Tanggal" },
    { key: "nama_pembeli", label: "Pembeli" },
    { key: "nama_kereta", label: "Kereta" },
    { key: null, label: "Rute" },
    { key: "kelas", label: "Kelas" },
    { key: "jumlah_tiket", label: "Tiket" },
    { key: "total_harga", label: "Total" },
    { key: "status_pembayaran", label: "Status" },
    { key: null, label: "Pembayaran" },
  ];

  return (
    <>
      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-copy">
            <h2>Daftar Transaksi</h2>
            <p>
              {total > 0
                ? `Menampilkan ${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} dari ${total} transaksi`
                : `${data.length} transaksi ditemukan`}
            </p>
          </div>
          <div className="table-toolbar-actions">
            <div className="search-wrapper">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                className="input-control search-input"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <button className="btn btn-outline" onClick={handleExportCSV} title="Export CSV">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {data.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 28 }}></th>
                  {sortColumns.map((col) => (
                    <th
                      key={col.key || col.label}
                      className={col.key ? "sortable" : ""}
                      onClick={() => col.key && handleSort(col.key)}
                    >
                      <div className="th-content">
                        {col.label}
                        {col.key && <SortIcon column={col.key} sortKey={sortKey} sortDir={sortDir} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((p) => {
                  const st = p.status_pembayaran || "paid";
                  const cfg = STATUS_CONFIG[st] || STATUS_CONFIG.paid;
                  const Icon = cfg.icon;
                  const isExpanded = expandedId === p.id;
                  return (
                    <Fragment key={p.id}>
                      <tr
                        className={isExpanded ? "row-expanded" : ""}
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      >
                        <td style={{ cursor: "pointer" }}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </td>
                        <td>
                          <span className="table-title">#{p.id}</span>
                        </td>
                        <td>
                          <span className="table-subtitle">{formatDate(p.tanggal_pembelian)}</span>
                        </td>
                        <td>
                          <span className="table-title">{p.nama_pembeli}</span>
                          {p.email_pembeli && <span className="table-subtitle">{p.email_pembeli}</span>}
                        </td>
                        <td>{p.nama_kereta}</td>
                        <td>
                          {p.asal} &rarr; {p.tujuan}
                        </td>
                        <td>
                          <span className="badge-status kelas-badge">{p.kelas}</span>
                        </td>
                        <td style={{ textAlign: "center" }}>{p.jumlah_tiket}</td>
                        <td>
                          <strong>{formatCurrency(p.total_harga)}</strong>
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
                            <Icon size={10} /> {cfg.label}
                          </span>
                        </td>
                        <td>
                          <span className="payment-badge">{p.metode_pembayaran?.replace(/_/g, " ") || "-"}</span>
                        </td>
                      </tr>
                      {isExpanded && <ExpandedRow p={p} />}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: "40px 20px" }}>
            <h2 className="empty-title">Belum ada transaksi</h2>
            <p className="empty-copy">
              {searchQuery
                ? `Tidak ditemukan transaksi untuk pencarian "${searchQuery}".`
                : status !== "all"
                  ? `Belum ditemukan transaksi dengan status "${STATUS_CONFIG[status]?.label || status}".`
                  : "Belum ada transaksi untuk periode ini."}
            </p>
          </div>
        )}

        {data.length > 0 && pagination}
      </div>
    </>
  );
}
