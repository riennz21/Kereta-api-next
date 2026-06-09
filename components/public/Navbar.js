import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const links = [
  { href: "/", label: "BERANDA" },
  { href: "/jadwal", label: "JADWAL" },
  { href: "/cek-pesanan", label: "CEK PESANAN" },
  { href: "/status", label: "STATUS" },
];

const USER_NAME = "Sena";

export default function Navbar() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
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

        <nav className="public-nav">
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
              <Link href="/jadwal" className="public-nav-link util-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Cek Pesanan
              </Link>
            </li>
            <li>
              <Link href="/status" className="public-nav-link util-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Bantuan
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
                      <small>sena@example.com</small>
                    </div>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <Link href="/jadwal" className="profile-dropdown-item">
                    Akun Saya
                  </Link>
                  <button className="profile-dropdown-item logout-item">
                    Logout
                  </button>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
