import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { tratarErroApi } from "../../services/errorHandler";

// ─── Formatação ───────────────────────────────────────────────────────────────
const brl = (v) =>
  Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtData = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const hoje = () => new Date().toISOString().split("T")[0];

// ─── Constantes ───────────────────────────────────────────────────────────────
const FORM_VAZIO = {
  categoria_id: "",
  descricao:    "",
  valor:        "",
};

// ─── Ícones ──────────────────────────────────────────────────────────────────
const IconTrash = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 3h8M5 3V2h2v1M4 3v7h4V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

// ─── Componente Field ─────────────────────────────────────────────────────────
function Field({ label, children, hint }) {
  return (
    <div style={s.field}>
      <label style={s.fieldLabel}>{label}</label>
      {children}
      {hint && <span style={s.fieldHint}>{hint}</span>}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Despesas() {
  const [aba, setAba]               = useState("despesas");
  const [despesas, setDespesas]     = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm]             = useState(FORM_VAZIO);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [filtros, setFiltros]       = useState({ inicio: hoje(), fim: hoje(), categoria_id: "" });
  const [salvando, setSalvando]     = useState(false);
  const [erro, setErro]             = useState("");
  const [sucesso, setSucesso]       = useState("");

  // ── Carregamentos ───────────────────────────────────────────────────────────
  const carregarCategorias = useCallback(async () => {
    try {
      const res = await api.get("/despesas/categorias");
      setCategorias(res.data);
    } catch (error) {
      setErro(tratarErroApi(error));
    }
  }, []);

  const carregarDespesas = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.inicio)      params.append("data_inicio",   filtros.inicio);
      if (filtros.fim)         params.append("data_fim",      filtros.fim);
      if (filtros.categoria_id) params.append("categoria_id", filtros.categoria_id);

      const res = await api.get(`/despesas/?${params.toString()}`);
      setDespesas(res.data);
    } catch (error) {
      setErro(tratarErroApi(error));
    }
  }, [filtros]);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  useEffect(() => {
    carregarDespesas();
  }, [carregarDespesas]);

  // ── Feedback helper ─────────────────────────────────────────────────────────
  const mostrarSucesso = (msg) => {
    setSucesso(msg);
    setTimeout(() => setSucesso(""), 3000);
  };

  // ── Métricas derivadas ──────────────────────────────────────────────────────
  const totalDespesas = despesas.reduce((acc, d) => acc + Number(d.valor), 0);

  const porCategoria = despesas.reduce((acc, d) => {
    const nome = d.categoria_nome ?? "Sem categoria";
    acc[nome] = (acc[nome] ?? 0) + Number(d.valor);
    return acc;
  }, {});

  // ── Criar despesa ─────────────────────────────────────────────────────────
  const criarDespesa = async () => {
    if (!form.valor || Number(form.valor) <= 0) {
      setErro("Informe um valor válido.");
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      await api.post("/despesas/", {
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
        descricao:    form.descricao || null,
        valor:        Number(form.valor),
      });

      setForm(FORM_VAZIO);
      await carregarDespesas();
      mostrarSucesso("Despesa registrada com sucesso!");
    } catch (error) {
      setErro(tratarErroApi(error));
    } finally {
      setSalvando(false);
    }
  };

  // ── Deletar despesa ───────────────────────────────────────────────────────
  const deletarDespesa = async (id) => {
    if (!confirm("Remover esta despesa?")) return;
    setErro("");

    try {
      await api.delete(`/despesas/${id}`);
      await carregarDespesas();
      mostrarSucesso("Despesa removida.");
    } catch (error) {
      setErro(tratarErroApi(error));
    }
  };

  // ── Criar categoria ───────────────────────────────────────────────────────
  const criarCategoria = async () => {
    if (!novaCategoria.trim()) { setErro("Nome é obrigatório."); return; }

    setSalvando(true);
    setErro("");

    try {
      await api.post("/despesas/categorias", { nome: novaCategoria.trim() });
      setNovaCategoria("");
      await carregarCategorias();
      mostrarSucesso("Categoria criada!");
    } catch (error) {
      setErro(tratarErroApi(error));
    } finally {
      setSalvando(false);
    }
  };

  // ── Desativar categoria ───────────────────────────────────────────────────
  const desativarCategoria = async (id, nome) => {
    if (!confirm(`Remover a categoria "${nome}"?`)) return;
    setErro("");

    try {
      await api.delete(`/despesas/categorias/${id}`);
      await carregarCategorias();
      mostrarSucesso("Categoria removida.");
    } catch (error) {
      setErro(tratarErroApi(error));
    }
  };

  const setField       = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const setFiltro      = (f, v) => setFiltros((p) => ({ ...p, [f]: v }));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>

      {/* Cabeçalho */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Despesas</h1>
          <p style={s.pageSub}>Registre e acompanhe os gastos da empresa</p>
        </div>
      </div>

      {/* Feedback */}
      {erro && (
        <div style={s.alertDanger} role="alert">
          {erro}
          <button style={s.alertClose} onClick={() => setErro("")}><IconClose /></button>
        </div>
      )}
      {sucesso && <div style={s.alertSuccess}>{sucesso}</div>}

      {/* Abas */}
      <div style={s.abas}>
        {[
          { key: "despesas",   label: "Despesas"   },
          { key: "categorias", label: "Categorias" },
        ].map(({ key, label }) => (
          <button
            key={key}
            style={{ ...s.aba, ...(aba === key ? s.abaAtiva : {}) }}
            onClick={() => setAba(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── ABA: Despesas ── */}
      {aba === "despesas" && (
        <div>
          <div style={s.cols}>

            {/* Formulário */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>Nova despesa</span>
              </div>
              <div style={s.cardBody}>
                <Field label="Categoria">
                  <select
                    style={s.input}
                    value={form.categoria_id}
                    onChange={(e) => setField("categoria_id", e.target.value)}
                  >
                    <option value="">Sem categoria</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Valor">
                  <div style={s.inputPrefix}>
                    <span style={s.prefix}>R$</span>
                    <input
                      style={{ ...s.input, ...s.inputWithPrefix }}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={form.valor}
                      onChange={(e) => setField("valor", e.target.value)}
                    />
                  </div>
                </Field>

                <Field label="Descrição (opcional)" hint="Ex: Conta de água de março">
                  <input
                    style={s.input}
                    placeholder="Detalhes da despesa..."
                    value={form.descricao}
                    onChange={(e) => setField("descricao", e.target.value)}
                  />
                </Field>

                <button
                  style={{ ...s.btnDanger, ...(salvando ? s.btnDisabled : {}) }}
                  onClick={criarDespesa}
                  disabled={salvando}
                >
                  {salvando ? "Registrando..." : "− Registrar despesa"}
                </button>
              </div>
            </div>

            {/* Resumo por categoria */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>Resumo do período</span>
                <span style={s.cardSub}>{brl(totalDespesas)} total</span>
              </div>
              <div style={s.cardBody}>
                {/* Filtros */}
                <div style={s.filtrosGrid}>
                  <Field label="De">
                    <input
                      style={s.input}
                      type="date"
                      value={filtros.inicio}
                      onChange={(e) => setFiltro("inicio", e.target.value)}
                    />
                  </Field>
                  <Field label="Até">
                    <input
                      style={s.input}
                      type="date"
                      value={filtros.fim}
                      onChange={(e) => setFiltro("fim", e.target.value)}
                    />
                  </Field>
                  <Field label="Categoria">
                    <select
                      style={s.input}
                      value={filtros.categoria_id}
                      onChange={(e) => setFiltro("categoria_id", e.target.value)}
                    >
                      <option value="">Todas</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Por categoria */}
                {Object.keys(porCategoria).length > 0 && (
                  <div style={s.categoriasResumo}>
                    {Object.entries(porCategoria)
                      .sort((a, b) => b[1] - a[1])
                      .map(([nome, total]) => (
                        <div key={nome} style={s.categoriaResumoRow}>
                          <span style={s.categoriaResumoNome}>{nome}</span>
                          <span style={s.categoriaResumoValor}>{brl(total)}</span>
                        </div>
                      ))
                    }
                    <div style={s.categoriaResumoTotal}>
                      <span>Total</span>
                      <span>{brl(totalDespesas)}</span>
                    </div>
                  </div>
                )}

                {Object.keys(porCategoria).length === 0 && (
                  <p style={s.empty}>Nenhuma despesa no período</p>
                )}
              </div>
            </div>
          </div>

          {/* Tabela de despesas */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Despesas registradas</span>
              <span style={s.cardSub}>{despesas.length} registros</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Categoria</th>
                    <th style={s.th}>Descrição</th>
                    <th style={s.th}>Valor</th>
                    <th style={s.th}>Data</th>
                    <th style={s.th} />
                  </tr>
                </thead>
                <tbody>
                  {despesas.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={s.emptyRow}>
                        Nenhuma despesa no período selecionado
                      </td>
                    </tr>
                  ) : (
                    despesas.map((d) => (
                      <tr key={d.id}>
                        <td style={s.td}>
                          {d.categoria_nome ? (
                            <span style={s.categoriaBadge}>{d.categoria_nome}</span>
                          ) : (
                            <span style={s.semCategoria}>Sem categoria</span>
                          )}
                        </td>
                        <td style={{ ...s.td, ...s.tdMuted }}>{d.descricao ?? "—"}</td>
                        <td style={{ ...s.td, color: "#D85A30", fontWeight: "600" }}>
                          {brl(d.valor)}
                        </td>
                        <td style={{ ...s.td, ...s.tdMuted }}>{fmtData(d.data_despesa)}</td>
                        <td style={s.td}>
                          <button
                            style={s.btnRemover}
                            onClick={() => deletarDespesa(d.id)}
                            title="Remover despesa"
                          >
                            <IconTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ABA: Categorias ── */}
      {aba === "categorias" && (
        <div style={s.cols}>

          {/* Formulário nova categoria */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Nova categoria</span>
            </div>
            <div style={s.cardBody}>
              <Field label="Nome da categoria">
                <input
                  style={s.input}
                  placeholder="Ex: Aluguel, Energia, Fornecedor..."
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && criarCategoria()}
                />
              </Field>
              <button
                style={{ ...s.btnPrimary, ...(salvando ? s.btnDisabled : {}) }}
                onClick={criarCategoria}
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "+ Criar categoria"}
              </button>
            </div>
          </div>

          {/* Lista de categorias */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Categorias cadastradas</span>
              <span style={s.cardSub}>{categorias.length} categorias</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Nome</th>
                    <th style={s.th} />
                  </tr>
                </thead>
                <tbody>
                  {categorias.length === 0 ? (
                    <tr>
                      <td colSpan={2} style={s.emptyRow}>
                        Nenhuma categoria cadastrada
                      </td>
                    </tr>
                  ) : (
                    categorias.map((c) => (
                      <tr key={c.id}>
                        <td style={{ ...s.td, fontWeight: "500", color: "#0f172a" }}>
                          {c.nome}
                        </td>
                        <td style={s.td}>
                          <button
                            style={s.btnRemover}
                            onClick={() => desativarCategoria(c.id, c.nome)}
                            title="Remover categoria"
                          >
                            <IconTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = {
  page:      { padding: "24px", background: "#f1f5f9", minHeight: "100vh" },
  pageHeader: { marginBottom: "20px" },
  pageTitle: { fontSize: "18px", fontWeight: "600", color: "#0f172a", margin: 0 },
  pageSub:   { fontSize: "13px", color: "#94a3b8", marginTop: "2px" },

  alertDanger: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: "8px", padding: "10px 14px",
    fontSize: "13px", color: "#dc2626", marginBottom: "16px",
  },
  alertSuccess: {
    background: "#EAF3DE", border: "1px solid #C0DD97",
    borderRadius: "8px", padding: "10px 14px",
    fontSize: "13px", color: "#3B6D11", marginBottom: "16px",
  },
  alertClose: {
    background: "none", border: "none",
    cursor: "pointer", color: "#dc2626",
    display: "flex", alignItems: "center", padding: 0,
  },

  abas: {
    display: "flex", gap: "4px", marginBottom: "16px",
    background: "#ffffff", padding: "4px",
    borderRadius: "10px", border: "1px solid #f1f5f9",
    width: "fit-content",
  },
  aba: {
    padding: "7px 16px", borderRadius: "7px",
    border: "none", background: "none",
    fontSize: "13px", fontWeight: "500",
    color: "#64748b", cursor: "pointer", fontFamily: "inherit",
  },
  abaAtiva: { background: "#534AB7", color: "#ffffff" },

  cols: {
    display: "grid", gridTemplateColumns: "1fr 1.4fr",
    gap: "16px", alignItems: "start", marginBottom: "16px",
  },

  card: {
    background: "#ffffff", borderRadius: "12px",
    border: "1px solid #f1f5f9", overflow: "hidden", marginBottom: "0",
  },
  cardHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px", borderBottom: "1px solid #f8fafc",
  },
  cardTitle: { fontSize: "13px", fontWeight: "600", color: "#0f172a" },
  cardSub:   { fontSize: "12px", color: "#94a3b8" },
  cardBody: {
    padding: "16px 20px", display: "flex",
    flexDirection: "column", gap: "12px",
  },

  filtrosGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px",
  },

  field:      { display: "flex", flexDirection: "column", gap: "5px" },
  fieldLabel: {
    fontSize: "11px", color: "#64748b", fontWeight: "500",
    textTransform: "uppercase", letterSpacing: "0.4px",
  },
  fieldHint:  { fontSize: "11px", color: "#94a3b8" },

  input: {
    padding: "8px 10px", borderRadius: "7px",
    border: "1px solid #e2e8f0", background: "#f8fafc",
    fontSize: "13px", color: "#0f172a", outline: "none",
    fontFamily: "inherit", width: "100%", boxSizing: "border-box",
  },

  inputPrefix: {
    display: "flex", alignItems: "center",
    border: "1px solid #e2e8f0", borderRadius: "7px",
    background: "#f8fafc", overflow: "hidden",
  },
  prefix: {
    padding: "8px 10px", fontSize: "13px", color: "#94a3b8",
    background: "#f1f5f9", borderRight: "1px solid #e2e8f0", flexShrink: 0,
  },
  inputWithPrefix: { border: "none", background: "transparent", borderRadius: 0, width: "100%" },

  btnPrimary: {
    width: "100%", padding: "9px 16px",
    background: "#534AB7", color: "#fff",
    border: "none", borderRadius: "8px",
    fontSize: "13px", fontWeight: "600",
    cursor: "pointer", fontFamily: "inherit",
  },
  btnDanger: {
    width: "100%", padding: "9px 16px",
    background: "#dc2626", color: "#fff",
    border: "none", borderRadius: "8px",
    fontSize: "13px", fontWeight: "600",
    cursor: "pointer", fontFamily: "inherit",
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },

  btnRemover: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "28px", height: "28px",
    background: "none", border: "1px solid #fecaca",
    borderRadius: "6px", cursor: "pointer",
    color: "#dc2626", padding: 0,
  },

  // Resumo categorias
  categoriasResumo: {
    display: "flex", flexDirection: "column", gap: "0",
    border: "1px solid #f1f5f9", borderRadius: "8px", overflow: "hidden",
  },
  categoriaResumoRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "9px 14px", borderBottom: "1px solid #f8fafc",
    fontSize: "13px",
  },
  categoriaResumoNome:  { color: "#334155" },
  categoriaResumoValor: { color: "#D85A30", fontWeight: "600" },
  categoriaResumoTotal: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 14px", fontSize: "13px",
    fontWeight: "600", color: "#0f172a",
    background: "#f8fafc",
  },

  // Tabela
  table:   { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", padding: "10px 16px",
    fontSize: "11px", color: "#94a3b8", fontWeight: "600",
    textTransform: "uppercase", letterSpacing: "0.4px",
    borderBottom: "1px solid #f1f5f9",
  },
  td:      { padding: "11px 16px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc" },
  tdMuted: { color: "#94a3b8", fontSize: "12px" },
  emptyRow: { textAlign: "center", padding: "32px", color: "#94a3b8", fontSize: "13px" },

  categoriaBadge: {
    background: "#EEEDFE", color: "#26215C",
    fontSize: "11px", padding: "3px 8px",
    borderRadius: "999px", fontWeight: "500",
  },
  semCategoria: { fontSize: "12px", color: "#94a3b8" },

  empty: { fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "12px 0" },
};
