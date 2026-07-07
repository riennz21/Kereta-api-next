import Link from "next/link";
import { Train } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="brand-lockup">
              <span className="brand-mark">TK</span>
              <span className="brand-copy">
                <strong className="public-logo">TiketKAI</strong>
                <small className="brand-subtitle">Reservasi Kereta Digital</small>
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-500 leading-relaxed">
              Platform pemesanan tiket kereta digital terpercaya di Indonesia. 
              Pesan tiket dengan mudah, aman, dan cepat.
            </p>
          </div>

          {[
            {
              title: "Layanan",
              links: [
                { href: "/", label: "Cari Tiket" },
                { href: "/jadwal", label: "Jadwal Kereta" },
                { href: "/status", label: "Status Kereta" },
                { href: "/cek-pesanan", label: "Cek Pesanan" },
              ],
            },
            {
              title: "Bantuan",
              links: [
                { href: "/status-pesanan", label: "Lacak Pesanan" },
                { href: "/riwayat", label: "Riwayat Pesanan" },
                { href: "#", label: "Pusat Bantuan" },
                { href: "#", label: "Kebijakan Privasi" },
              ],
            },
            {
              title: "Kontak",
              links: [
                { href: "#", label: "cs@tiketkai.com" },
                { href: "#", label: "021-1234-5678" },
                { href: "#", label: "Senin - Sabtu, 08:00 - 20:00" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-slate-900 mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition hover:text-indigo-600 font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-sm text-slate-400">
            &copy; {currentYear} TiketKAI. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">Bayar dengan</span>
            <div className="flex gap-1.5">
              {["BCA", "Mandiri", "GoPay", "OVO"].map((p) => (
                <span
                  key={p}
                  className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
