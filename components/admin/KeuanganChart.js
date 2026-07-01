import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../lib/train-utils";

function normalizeDateKey(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const text = String(value);
  const match = text.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function formatDateLabel(tanggal) {
  const dateKey = normalizeDateKey(tanggal);
  if (!dateKey) return "-";
  const d = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>{formatCurrency(data.pendapatan)}</strong>
      <br />
      <span>{data.transaksi} transaksi</span>
      <br />
      <span className="text-[10px] text-slate-400">{formatDateLabel(data.tanggal)}</span>
    </div>
  );
}

export default function KeuanganChart({ data }) {
  if (!data || data.length === 0) return null;

  const sorted = data
    .map((item) => ({ ...item, tanggal: normalizeDateKey(item.tanggal) }))
    .filter((item) => item.tanggal)
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  if (sorted.length === 0) return null;

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <div className="table-toolbar-copy">
          <h2>Ringkasan Harian</h2>
          <p>Pendapatan dan transaksi per hari</p>
        </div>
      </div>
      <div style={{ padding: "12px 16px 4px" }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sorted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="tanggal"
              tickFormatter={formatDateLabel}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
            <Bar
              dataKey="pendapatan"
              fill="url(#keuanganGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
            <defs>
              <linearGradient id="keuanganGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
