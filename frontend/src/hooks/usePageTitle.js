import { useEffect } from "react";

export function usePageTitle(page) {
  useEffect(() => {
    console.log("🧠 usePageTitle executado");
    console.log("📄 Página:", page);

    const empresa = localStorage.getItem("empresa_nome");

    console.log("🏢 Empresa (localStorage):", empresa);

    const titulo = empresa
      ? `Caixify • ${page} • ${empresa}`
      : `Caixify • ${page}`;

    console.log("🏷️ Título final:", titulo);

    document.title = titulo;
  }, [page]);
}