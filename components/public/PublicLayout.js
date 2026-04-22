import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const links = [
  { href: "/", label: "HOME" },
  { href: "/kereta", label: "DATA KERETA" },
  { href: "/jadwal", label: "JADWAL" },
  { href: "/status", label: "STATUS" },
];

export default function PublicLayout({ title, children }) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{title ? `${title} - TiketKAI` : "TiketKAI"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="public-shell">
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
                    <Link href={link.href} className={router.pathname === link.href ? "public-nav-link active" : "public-nav-link"}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>
        <main className="public-container">{children}</main>
      </div>
    </>
  );
}
