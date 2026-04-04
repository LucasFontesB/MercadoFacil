import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const { setUsuario } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { login, senha });

      const token = response.data.access_token;
      const usuario = response.data.usuario;

      localStorage.setItem("token", token);

      if (usuario) {
        localStorage.setItem("usuario", JSON.stringify(usuario));
        setUsuario(usuario);

        if (usuario.empresa_nome) {
          localStorage.setItem("empresa_nome", usuario.empresa_nome);
        }
      } else {
        console.warn("⚠️ Usuário não veio na resposta da API");
      }

      navigate("/pdv", { replace: true });
    } catch {
      setErro("Usuário ou senha inválidos");
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (field) => ({
    ...styles.input,
    ...(focusedField === field ? styles.inputFocused : {}),
  });

  return (
    <div style={styles.container}>
      {/* Lado esquerdo — hero */}
      <div style={styles.left} aria-hidden="true">
        <div style={styles.leftContent}>
          <span style={styles.badge}>PDV & Gestão</span>

          <img
            src="/Barcode.gif"
            alt=""
            style={styles.image}
          />

          <h2 style={styles.leftTitle}>Simplifique suas vendas</h2>
          <p style={styles.leftText}>
            Controle estoque, vendas e lucros em um só lugar
          </p>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <main style={styles.right}>
        <div style={styles.card}>
          {/* Logo */}
          <div style={styles.logoRow}>
            <div style={styles.logoIcon} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="14" rx="1.5" fill="white" />
                <rect x="10" y="5" width="6" height="11" rx="1.5" fill="white" opacity="0.75" />
              </svg>
            </div>
            <span style={styles.logoText}>Caixify</span>
          </div>

          <p style={styles.subtitle}>Gestão inteligente para seu mercadinho</p>

          <h1 style={styles.title}>Entre na sua conta</h1>

          <form onSubmit={handleLogin} style={styles.form} noValidate>
            {/* Campo usuário */}
            <div style={styles.fieldGroup}>
              <label htmlFor="login" style={styles.label}>
                Usuário
              </label>
              <input
                id="login"
                type="text"
                placeholder="seu.usuario"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                onFocus={() => setFocusedField("login")}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle("login")}
                autoComplete="username"
                required
                aria-required="true"
                aria-describedby={erro ? "form-error" : undefined}
              />
            </div>

            {/* Campo senha */}
            <div style={styles.fieldGroup}>
              <div style={styles.labelRow}>
                <label htmlFor="senha" style={styles.label}>
                  Senha
                </label>
                <button
                  type="button"
                  style={styles.forgotBtn}
                  onClick={() => {/* TODO: implementar recuperação de senha */}}
                >
                  Esqueci a senha
                </button>
              </div>
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onFocus={() => setFocusedField("senha")}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle("senha")}
                autoComplete="current-password"
                required
                aria-required="true"
                aria-describedby={erro ? "form-error" : undefined}
              />
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <p id="form-error" role="alert" style={styles.error}>
                {erro}
              </p>
            )}

            {/* Botão de submit */}
            <button
              type="submit"
              style={{
                ...styles.button,
                ...(loading ? styles.buttonLoading : {}),
              }}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {/* Rodapé */}
          <p style={styles.footerText}>
            Precisa de ajuda?{" "}
            <a href="mailto:suporte@caixify.com.br" style={styles.footerLink}>
              Fale com o suporte
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

const PURPLE = {
  50:  "#EEEDFE",
  200: "#AFA9EC",
  400: "#7F77DD",
  600: "#534AB7",
  800: "#3C3489",
};

const styles = {
  /* Layout principal */
  container: {
    display: "flex",
    height: "100vh",
    background: "#f1f5f9",
  },

  /* Lado esquerdo */
  left: {
    flex: 1.3,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #eef2ff, #e0f2fe)",
  },

  leftContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },

  badge: {
    background: "white",
    borderRadius: "999px",
    padding: "5px 14px",
    fontSize: "12px",
    color: PURPLE[600],
    border: `0.5px solid ${PURPLE[200]}`,
    fontWeight: "500",
  },

  image: {
    width: "90%",
    maxWidth: "480px",
  },

  leftTitle: {
    color: "#1e293b",
    fontSize: "18px",
    fontWeight: "600",
    marginTop: "8px",
    textAlign: "center",
  },

  leftText: {
    color: "#64748b",
    fontSize: "14px",
    textAlign: "center",
    maxWidth: "280px",
    lineHeight: "1.6",
  },

  /* Lado direito */
  right: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "16px",
    width: "320px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "0",
  },

  /* Logo */
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },

  logoIcon: {
    width: "32px",
    height: "32px",
    background: PURPLE[600],
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  logoText: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#0f172a",
  },

  subtitle: {
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "24px",
    lineHeight: "1.4",
  },

  title: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#0f172a",
    marginBottom: "20px",
  },

  /* Formulário */
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "16px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    fontSize: "12px",
    color: "#475569",
    fontWeight: "500",
  },

  forgotBtn: {
    background: "none",
    border: "none",
    padding: "0",
    fontSize: "12px",
    color: PURPLE[400],
    cursor: "pointer",
    fontFamily: "inherit",
  },

  input: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: "14px",
    background: "#f8fafc",
    color: "#0f172a",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },

  inputFocused: {
    border: `1.5px solid ${PURPLE[400]}`,
    boxShadow: `0 0 0 3px ${PURPLE[50]}`,
    background: "#ffffff",
  },

  error: {
    color: "#dc2626",
    fontSize: "13px",
    textAlign: "center",
    margin: "0",
  },

  button: {
    marginTop: "4px",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: `linear-gradient(135deg, ${PURPLE[600]}, ${PURPLE[400]})`,
    color: "#fff",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "opacity 0.2s",
    fontFamily: "inherit",
  },

  buttonLoading: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  /* Rodapé */
  footerText: {
    fontSize: "12px",
    color: "#64748b",
    textAlign: "center",
    marginTop: "4px",
  },

  footerLink: {
    color: PURPLE[600],
    textDecoration: "none",
  },
};