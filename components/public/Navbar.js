import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const links = [
  { href: "/", label: "BERANDA" },
  { href: "/jadwal", label: "JADWAL" },
  { href: "/cek-pesanan", label: "CEK PESANAN" },
  { href: "/riwayat", label: "RIWAYAT" },
  { href: "/status", label: "STATUS" },
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

  // Close mobile menu on route change
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
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={
                    router.pathname === link.href
                      ? "public-nav-link active"
                      : "public-nav-link"
                  }
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Utility links */}
            <li>
              <Link href="/status-pesanan" className="public-nav-link util-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Lacak Pesanan
              </Link>
            </li>

            {/* User Profile */}
            <li className="profile-item" ref={dropdownRef}>
              <button
                className={`profile-trigger ${profileOpen ? "active" : ""}`}
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-label="Profil pengguna"
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
                      <small>rieen@example.com</small>
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
          className="md:hidden w-10 h-10 rounded-xl border border-[rgba(15,39,67,0.08)] bg-white/80 flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[rgba(15,39,67,0.06)] bg-white/95 backdrop-blur-md animate-slide-in">
          <div className="py-3 px-4">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                    router.pathname === link.href
                      ? "bg-navy text-white"
                      : "text-[#475467] hover:bg-[rgba(15,39,67,0.04)]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-[rgba(15,39,67,0.06)] my-1" />
              <Link
                href="/status-pesanan"
                className="px-4 py-3 rounded-xl text-sm font-bold text-[#475467] hover:bg-[rgba(15,39,67,0.04)] flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Lacak Pesanan
              </Link>
              <Link
                href="/riwayat"
                className="px-4 py-3 rounded-xl text-sm font-bold text-[#475467] hover:bg-[rgba(15,39,67,0.04)] flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Riwayat Pesanan
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
