import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Menu, X, LayoutDashboard, Train, Calendar, Activity, FileText, Wallet, LogOut } from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/admin/kereta", label: "Data Kereta", key: "kereta", icon: Train },
  { href: "/admin/jadwal", label: "Jadwal", key: "jadwal", icon: Calendar },
  { href: "/admin/status", label: "Status", key: "status", icon: Activity },
  { href: "/admin/laporan", label: "Laporan Operasional", key: "laporan", icon: FileText },
  { href: "/admin/laporan-keuangan", label: "Laporan Keuangan", key: "laporan-keuangan", icon: Wallet },
];

export default function AdminLayout({ title, description, activePage, topbarAction, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Head>
        <title>{title ? `${title} | KERETA.ID` : "KERETA.ID"}</title>
      </Head>
      <div className="admin-shell">
        {/* Mobile overlay */}
        {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

        <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="admin-sidebar-panel">
            <div className="admin-side-header">
              <button className="admin-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Tutup sidebar">
                <X size={18} />
              </button>
              <span className="page-kicker">Control Center</span>
              <h2>KERETA.ID</h2>
              <p>Pusat kendali data kereta, jadwal, dan status operasional.</p>
            </div>

            <nav>
              <ul className="admin-sidebar-list">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className={activePage === item.key ? "sidebar-link active" : "sidebar-link"}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="admin-sidebar-footer">
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="sidebar-link logout-link">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-topbar">
            <div className="admin-topbar-left">
              <button className="admin-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Buka sidebar">
                <Menu size={20} />
              </button>
              <div className="admin-topbar-copy">
                <span className="page-kicker">Admin Workspace</span>
                <h1>{title}</h1>
                {description ? <p className="page-description">{description}</p> : null}
              </div>
            </div>
            <div className="topbar-actions">
              {topbarAction}
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="btn btn-muted btn-logout">
                  <LogOut size={14} />
                  <span>Logout</span>
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
