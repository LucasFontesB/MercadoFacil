import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000"
});

// 🔐 envia token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🚨 captura erro 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Token expirado 🚨");

      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;