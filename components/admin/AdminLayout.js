import Head from "next/head";
import Link from "next/link";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/admin/kereta", label: "Data Kereta", key: "kereta" },
  { href: "/admin/jadwal", label: "Jadwal", key: "jadwal" },
  { href: "/admin/status", label: "Status", key: "status" },
  { href: "/admin/laporan", label: "Laporan Operasional", key: "laporan" },
  { href: "/admin/laporan-keuangan", label: "Laporan Keuangan", key: "laporan-keuangan" },
];

export default function AdminLayout({ title, description, activePage, topbarAction, children }) {
  return (
    <>
      <Head>
        <title>{title ? `${title} | KERETA.ID` : "KERETA.ID"}</title>
      </Head>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-panel">
            <div className="admin-side-header">
              <span className="page-kicker">Control Center</span>
              <h2>KERETA.ID</h2>
              <p>Pusat kendali data kereta, jadwal, dan status operasional.</p>
            </div>

            <ul className="admin-sidebar-list">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={activePage === item.key ? "admin-sidebar-link active" : "admin-sidebar-link"}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-topbar">
            <div className="admin-topbar-copy">
              <span className="page-kicker">Admin Workspace</span>
              <h1>{title}</h1>
              {description ? <p className="page-description">{description}</p> : null}
            </div>
            <div className="topbar-actions">
              {topbarAction}
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="btn btn-muted">
                  Logout
                </button>
              </form>
            </div>
          </header>
          <div className="admin-content">{children}</div>
        </main>
      </div>
    </>
  );
}
