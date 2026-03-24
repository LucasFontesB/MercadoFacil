import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import PDV from "./pages/PDV";
import AdminLayout from "./pages/AdminLayout";
import Produtos from "./pages/admin/Produtos";

function Dashboard() {
  return <h1>Dashboard 🚀</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pdv" element={<PDV />} />
        <Route path="/admin" element={<AdminLayout />}>
            <Route path="produtos" element={<Produtos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;