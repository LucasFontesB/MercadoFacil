import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2>⚙️ Admin</h2>

        <Link to="/admin/produtos">Produtos</Link>
        <Link to="/admin/estoque">Estoque</Link>
        <Link to="/admin/usuarios">Usuários</Link>
        <Link to="/admin/caixa">Caixa</Link>
      </aside>

      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh"
  },

  sidebar: {
    width: "220px",
    background: "#0f172a",
    color: "#fff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  content: {
    flex: 1,
    padding: "20px",
    background: "#f1f5f9"
  }
};