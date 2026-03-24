import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  // 🔐 Auto login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/pdv");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    setErro("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        login,
        senha
      });

      const token = response.data.access_token;

      localStorage.setItem("token", token);

      navigate("/pdv");
    } catch (error) {
      setErro("Usuário ou senha inválidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Mercado Fácil</h1>
        <p style={styles.subtitle}>Acesse sua conta</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="Usuário"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={styles.input}
          />

          {erro && <span style={styles.error}>{erro}</span>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #2563eb)"
  },

  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "16px",
    width: "320px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },

  title: {
    margin: 0,
    color: "#0f172a"
  },

  subtitle: {
    marginBottom: "20px",
    color: "#64748b",
    fontSize: "14px"
  },

  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: "14px"
  },

  button: {
    marginTop: "10px",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.2s"
  },

  error: {
    color: "#dc2626",
    fontSize: "13px"
  }
};