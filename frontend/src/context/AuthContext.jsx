import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api"; // ajuste o caminho

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true); // 🔥 importante

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.get("/auth/me");

        setUsuario(response.data);

      } catch (error) {
        console.error("Erro ao buscar usuário", error);
        localStorage.removeItem("token");
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    }

    carregarUsuario();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);