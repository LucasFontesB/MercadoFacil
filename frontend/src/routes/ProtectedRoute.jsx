import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, user, tipo }) {
  const { loading } = useAuth();

  if (loading) return <div>Carregando...</div>;

  const token = localStorage.getItem("token");

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (tipo && (!user.tipo || user.tipo !== tipo)) {
    return <Navigate to="/sem-acesso" replace />;
  }

  return children;
}