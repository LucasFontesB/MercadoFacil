import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

// ─── Ícones ─────────────────────────────────────────────────────────────────

const IconGrid = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const IconList = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2 4h11M2 8h11M2 12h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const IconBox = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="2" y="3" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5 3V2M10 3V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M2 7h11" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
    <path d="M2 13c0-3 2.5-4.5 5.5-4.5S13 10 13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const IconCard = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1.5" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M1.5 6.5h12" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="5" cy="10" r="0.8" fill="currentColor" />
  </svg>
);

const IconBack = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M8 3L4 7l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconTurnos = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M7.5 4.5v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDespesas = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="2" y="2" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5 7.5h5M7.5 5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

// ─── Itens de navegação ──────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Produtos",  to: "/admin/produtos",  icon: <IconList /> },
  { label: "Estoque",   to: "/admin/estoque",   icon: <IconBox />  },
  { label: "Usuários",  to: "/admin/usuarios",  icon: <IconUser /> },
  { label: "Caixa",     to: "/admin/caixa",     icon: <IconCard /> },
  { label: "Despesas", to: "/admin/despesas", icon: <IconDespesas /> },
  { label: "Turnos", to: "/admin/turnos", icon: <IconTurnos /> }
];

// ─── Componente principal ────────────────────────────────────────────────────

export default function AdminLayout() {
  const location = useLocation();
  const navigate  = useNavigate();

  return (
    <div style={s.container}>

      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>

        {/* Logo */}
        <div style={s.sidebarHeader}>
          <div style={s.logoRow}>
            <div style={s.logoIcon}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="12" rx="1" fill="white" />
                <rect x="8" y="3" width="5" height="10" rx="1" fill="white" opacity="0.7" />
              </svg>
            </div>
            <span style={s.logoName}>Caixify</span>
          </div>
          <span style={s.logoBadge}>PAINEL ADMIN</span>
        </div>

        {/* Navegação */}
        <nav style={s.nav}>
          <span style={s.navSectionLabel}>Gestão</span>

          {NAV_ITEMS.map(({ label, to, icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}
              >
                <span style={{ ...s.navIcon, ...(active ? s.navIconActive : {}) }}>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé — voltar ao PDV */}
        <div style={s.sidebarFooter}>
          <button style={s.backBtn} onClick={() => navigate("/pdv")}>
            <IconBack />
            Voltar ao PDV
          </button>
        </div>

      </aside>

      {/* ── Conteúdo ── */}
      <main style={s.content}>
        <Outlet />
      </main>

    </div>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const s = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#f1f5f9",
    overflow: "hidden",
  },

  // ── Sidebar ──
  sidebar: {
    width: "220px",
    flexShrink: 0,
    background: "#0f172a",
    display: "flex",
    flexDirection: "column",
  },

  sidebarHeader: {
    padding: "20px 16px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  },

  logoIcon: {
    width: "28px",
    height: "28px",
    background: "#534AB7",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  logoName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#f1f5f9",
  },

  logoBadge: {
    fontSize: "10px",
    color: "#334155",
    letterSpacing: "1px",
    fontWeight: "600",
  },

  nav: {
    flex: 1,
    padding: "12px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  navSectionLabel: {
    fontSize: "10px",
    color: "#334155",
    fontWeight: "600",
    letterSpacing: "1px",
    textTransform: "uppercase",
    padding: "10px 8px 4px",
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    textDecoration: "none",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "500",
  },

  navItemActive: {
    background: "#1e293b",
    color: "#f1f5f9",
  },

  navIcon: {
    display: "flex",
    alignItems: "center",
    color: "#475569",
  },

  navIconActive: {
    color: "#7F77DD",
  },

  sidebarFooter: {
    padding: "12px 10px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },

  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 10px",
    borderRadius: "8px",
    color: "#475569",
    fontSize: "13px",
    cursor: "pointer",
    width: "100%",
    background: "none",
    border: "none",
    fontFamily: "inherit",
    fontWeight: "500",
  },

  // ── Conteúdo ──
  content: {
    flex: 1,
    overflow: "auto",
  },
};