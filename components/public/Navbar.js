import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Train, Search, Calendar, Clock, History, HelpCircle, Menu, X, Ticket } from "lucide-react";

const links = [
  { href: "/", label: "Beranda", icon: Train },
  { href: "/dashboard", label: "Dashboard", icon: Ticket },
  { href: "/jadwal", label: "Jadwal", icon: Calendar },
  { href: "/status", label: "Status", icon: Clock },
  { href: "/cek-pesanan", label: "Cek Pesanan", icon: Search },
  { href: "/riwayat", label: "Riwayat", icon: History },
];

const USER_NAME = "riee";

export default function Navbar() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  return (
    <header className="public-header">
      <div className="public-navbar">
        <Link href="/" className="brand-lockup">
          <span className="brand-mark">TK</span>
          <span className="brand-copy">
            <strong className="public-logo">TiketKAI</strong>
            <small className="brand-subtitle">Reservasi Kereta Digital</small>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="public-nav hidden md:block">
          <ul className="public-nav-list">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={
                      router.pathname === link.href
                        ? "nav-link active"
                        : "nav-link"
                    }
                    aria-current={router.pathname === link.href ? "page" : undefined}
                  >
                    <Icon size={14} />
                    {link.label}
                  </Link>
                </li>
              );
            })}

            {/* User Profile */}
            <li className="profile-item ml-2" ref={dropdownRef}>
              <button
                className={`profile-trigger ${profileOpen ? "active" : ""}`}
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-label="Profil pengguna"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <span className="profile-avatar">{USER_NAME.charAt(0)}</span>
                <span className="profile-name">{USER_NAME}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`profile-chevron ${profileOpen ? "open" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <span className="profile-dropdown-avatar">{USER_NAME.charAt(0)}</span>
                    <div>
                      <strong>{USER_NAME}</strong>
                      <small>riee@example.com</small>
                    </div>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <Link href="/riwayat" className="profile-dropdown-item">
                    Riwayat Pesanan
                  </Link>
                  <Link href="/status-pesanan" className="profile-dropdown-item">
                    Lacak Pesanan
                  </Link>
                  <div className="profile-dropdown-divider" />
                  <button className="profile-dropdown-item logout-item">
                    Logout
                  </button>
                </div>
              )}
            </li>
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden w-10 h-10 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white/80 flex items-center justify-center text-slate-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[rgba(15,23,42,0.06)] bg-white/95 backdrop-blur-md animate-slide-in">
          <div className="py-3 px-4 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    router.pathname === link.href
                      ? "bg-brand text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
            <div className="h-px bg-[rgba(15,23,42,0.06)] my-1" />
            <Link
              href="/status-pesanan"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <HelpCircle size={16} />
              Lacak Pesanan
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
