"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <style>{`
        .admin-sidebar {
          width: 228px;
          min-height: 100vh;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .admin-bottom-nav {
          display: none;
        }
        @media (max-width: 767px) {
          .admin-sidebar {
            display: none;
          }
          .admin-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 50;
            background: var(--surface);
            border-top: 1px solid var(--border);
            height: 60px;
            align-items: stretch;
          }
        }
      `}</style>

      {/* Desktop sidebar */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border)" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <ApertureSmall />
            <span style={{
              fontFamily: "var(--font-playfair)",
              fontSize: 17,
              fontWeight: 300,
              letterSpacing: "0.18em",
              color: "var(--text)",
            }}>
              Folio
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          <SectionLabel>Verwaltung</SectionLabel>
          <NavItem href="/admin" active={pathname === "/admin"} icon={<GalleryIcon />} label="Galerien" />
          <NavItem href="/admin/galleries/new" active={pathname === "/admin/galleries/new"} icon={<PlusIcon />} label="Neue Galerie" />
        </nav>

        {/* Bottom */}
        <div style={{ padding: "12px", borderTop: "1px solid var(--border)" }}>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="admin-bottom-nav">
        <BottomNavItem
          href="/admin"
          active={pathname === "/admin"}
          icon={<GalleryIcon />}
          label="Galerien"
        />
        <BottomNavItem
          href="/admin/galleries/new"
          active={pathname === "/admin/galleries/new"}
          icon={<PlusIcon />}
          label="Neu"
        />
        <BottomLogoutButton />
      </nav>
    </>
  );
}

function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "9px 12px",
        borderRadius: 8,
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--text-3)",
        fontSize: 13,
        fontFamily: "var(--font-inter)",
        transition: "all 0.15s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,63,94,0.08)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--red)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "none";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)";
      }}
    >
      <LogoutIcon />
      Abmelden
    </button>
  );
}

function BottomNavItem({ href, active, icon, label }: {
  href: string; active: boolean; icon: React.ReactNode; label: string;
}) {
  return (
    <Link
      href={href}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        textDecoration: "none",
        fontSize: 10,
        fontFamily: "var(--font-inter)",
        fontWeight: active ? 600 : 400,
        color: active ? "var(--accent-lt)" : "var(--text-3)",
        borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
        transition: "all 0.15s",
      }}
    >
      <span style={{ lineHeight: 1 }}>{icon}</span>
      {label}
    </Link>
  );
}

function BottomLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        background: "none",
        border: "none",
        borderBottom: "2px solid transparent",
        cursor: "pointer",
        fontSize: 10,
        fontFamily: "var(--font-inter)",
        color: "var(--text-3)",
        transition: "all 0.15s",
      }}
    >
      <LogoutIcon />
      Abmelden
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--text-3)",
      padding: "6px 12px 4px",
      fontFamily: "var(--font-inter)",
      marginBottom: 2,
    }}>
      {children}
    </div>
  );
}

function NavItem({ href, active, icon, label }: {
  href: string; active: boolean; icon: React.ReactNode; label: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 12px",
        borderRadius: 8,
        textDecoration: "none",
        fontSize: 13,
        fontFamily: "var(--font-inter)",
        fontWeight: active ? 500 : 400,
        color: active ? "#fff" : "var(--text-2)",
        background: active ? "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(99,102,241,0.2))" : "transparent",
        border: active ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent",
        boxShadow: active ? "0 2px 12px rgba(124,58,237,0.12)" : "none",
        transition: "all 0.15s",
      }}
    >
      <span style={{ color: active ? "var(--accent-lt)" : "var(--text-3)", lineHeight: 1 }}>{icon}</span>
      {label}
    </Link>
  );
}

function ApertureSmall() {
  return (
    <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="10" stroke="#7C3AED" strokeWidth="0.9" strokeOpacity="0.45" />
      <circle cx="11" cy="11" r="3.5" stroke="#A78BFA" strokeWidth="1.2" />
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return <line key={i}
          x1={11 + 4.5 * Math.cos(rad)} y1={11 + 4.5 * Math.sin(rad)}
          x2={11 + 9.5 * Math.cos(rad + 0.4)} y2={11 + 9.5 * Math.sin(rad + 0.4)}
          stroke="#7C3AED" strokeWidth="0.85" strokeOpacity="0.65" />;
      })}
    </svg>
  );
}
function GalleryIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1.5" y="3.5" width="13" height="10" rx="1.5"/><path d="M1.5 10l3-3 2.5 2.5 3-4 4 4.5"/><circle cx="5" cy="6.5" r="1"/></svg>;
}
function PlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>;
}
function LogoutIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8h8M11 5.5l2.5 2.5L11 10.5"/><path d="M6 2.5H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3"/></svg>;
}
