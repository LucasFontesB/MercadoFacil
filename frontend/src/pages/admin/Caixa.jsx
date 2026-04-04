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

const FORMAS = {
  dinheiro:        { label: "Dinheiro",      cor: "#1D9E75", bg: "#E1F5EE" },
  credito:         { label: "Crédito",       cor: "#534AB7", bg: "#EEEDFE" },
  debito:          { label: "Débito",        cor: "#185FA5", bg: "#E6F1FB" },
  pix:             { label: "PIX",           cor: "#085041", bg: "#E1F5EE" },
  "Não informado": { label: "Não informado", cor: "#64748b", bg: "#f1f5f9" },
};

// ─── Componentes auxiliares ───────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={s.field}>
      <label style={s.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, warn, success }) {
  return (
    <div style={{ ...s.statCard, ...(warn ? s.statWarn : {}), ...(success ? s.statSuccess : {}) }}>
      <div style={s.statLabel}>{label}</div>
      <div style={{ ...s.statValue, ...(warn ? s.statValueWarn : {}), ...(success ? s.statValueSuccess : {}) }}>
        {value}
      </div>
      {sub && <div style={s.statSub}>{sub}</div>}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Caixa() {
  const [aba, setAba]             = useState("dia");
  const [status, setStatus]       = useState(null);
  const [resumo, setResumo]       = useState(null);
  const [relatorio, setRelatorio] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [filtroHistorico, setFiltroHistorico] = useState({ inicio: hoje(), fim: hoje() });

  const [saldoAbertura,    setSaldoAbertura]    = useState("");
  const [saldoFechamento,  setSaldoFechamento]  = useState("");
  const [dataRelatorio,    setDataRelatorio]    = useState({ inicio: hoje(), fim: hoje() });

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro]         = useState("");
  const [sucesso, setSucesso]   = useState("");

  // ── Carregamentos ───────────────────────────────────────────────────────────
  const carregarStatus = useCallback(async () => {
    try { const r = await api.get("/caixa/status"); setStatus(r.data); }
    catch (e) { setErro(tratarErroApi(e)); }
  }, []);

  const carregarResumoDia = useCallback(async () => {
    try { const r = await api.get("/caixa/resumo-dia"); setResumo(r.data); }
    catch (e) { setErro(tratarErroApi(e)); }
  }, []);

  const carregarHistorico = useCallback(async (inicio, fim) => {
    try {
      const params = new URLSearchParams();
      if (inicio) params.append("data_inicio", inicio);
      if (fim)    params.append("data_fim",    fim);
      const r = await api.get(`/caixa/historico?${params.toString()}`);
      setHistorico(r.data);
    } catch (e) { setErro(tratarErroApi(e)); }
  }, []);

  const carregarRelatorio = async () => {
    if (!dataRelatorio.inicio || !dataRelatorio.fim) return;
    setErro("");
    try {
      const r = await api.get(`/caixa/relatorio?data_inicio=${dataRelatorio.inicio}&data_fim=${dataRelatorio.fim}`);
      setRelatorio(r.data);
    } catch (e) { setErro(tratarErroApi(e)); }
  };

  useEffect(() => {
    carregarStatus();
    carregarResumoDia();
    carregarHistorico(hoje(), hoje());
  }, [carregarStatus, carregarResumoDia, carregarHistorico]);

  const mostrarSucesso = (msg) => { setSucesso(msg); setTimeout(() => setSucesso(""), 3000); };

  // ── Abrir / Fechar caixa ────────────────────────────────────────────────────
  const abrirCaixa = async () => {
    setSalvando(true); setErro("");
    try {
      await api.post(`/caixa/abrir?saldo_inicial=${saldoAbertura || 0}`);
      setSaldoAbertura("");
      await carregarStatus();
      mostrarSucesso("Caixa aberto com sucesso!");
    } catch (e) { setErro(tratarErroApi(e)); }
    finally { setSalvando(false); }
  };

  const fecharCaixa = async () => {
    if (!confirm("Confirma o fechamento do caixa?")) return;
    setSalvando(true); setErro("");
    try {
      await api.post(`/caixa/fechar?saldo_final=${saldoFechamento || 0}`);
      setSaldoFechamento("");
      await Promise.all([carregarStatus(), carregarResumoDia()]);
      mostrarSucesso("Caixa fechado com sucesso!");
    } catch (e) { setErro(tratarErroApi(e)); }
    finally { setSalvando(false); }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>

      {/* Cabeçalho */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Financeiro</h1>
          <p style={s.pageSub}>Caixa, movimentações e relatórios</p>
        </div>
        {status && (
          <div style={{ ...s.statusBadge, ...(status.aberto ? s.statusAberto : s.statusFechado) }}>
            {status.aberto ? "● Caixa aberto" : "● Caixa fechado"}
          </div>
        )}
      </div>

      {/* Feedback */}
      {erro && (
        <div style={s.alertDanger} role="alert">
          {erro}
          <button style={s.alertClose} onClick={() => setErro("")}>✕</button>
        </div>
      )}
      {sucesso && <div style={s.alertSuccess}>{sucesso}</div>}

      {/* Abas */}
      <div style={s.abas}>
        {[
          { key: "dia",       label: "Resumo do dia" },
          { key: "relatorio", label: "Relatórios"    },
          { key: "caixa",     label: "Caixa"         },
          { key: "historico", label: "Histórico"     },
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

      {/* ── ABA: Resumo do dia ── */}
      {aba === "dia" && resumo && (
        <div>
          <div style={s.statsGrid}>
            <StatCard label="Faturamento"   value={brl(resumo.faturamento)}   sub={`${resumo.num_vendas} vendas`} success />
            <StatCard label="Lucro bruto"   value={brl(resumo.lucro_bruto)}   sub="receita − custo" />
            <StatCard label="Despesas"      value={brl(resumo.despesas)}      warn={resumo.despesas > 0} />
            <StatCard label="Lucro líquido" value={brl(resumo.lucro_liquido)} sub="lucro − despesas"
              success={resumo.lucro_liquido > 0} warn={resumo.lucro_liquido < 0}
            />
          </div>

          <div style={s.card}>
            <div style={s.cardHeader}><span style={s.cardTitle}>Por forma de pagamento</span></div>
            <div style={s.cardBody}>
              {resumo.por_forma_pagamento.length === 0 ? (
                <p style={s.empty}>Nenhuma venda registrada hoje</p>
              ) : (
                <div style={s.formasGrid}>
                  {resumo.por_forma_pagamento.map((f) => {
                    const meta = FORMAS[f.forma] ?? FORMAS["Não informado"];
                    return (
                      <div key={f.forma} style={{ ...s.formaCard, background: meta.bg }}>
                        <div style={{ ...s.formaLabel, color: meta.cor }}>{meta.label}</div>
                        <div style={{ ...s.formaValor, color: meta.cor }}>{brl(f.total)}</div>
                        <div style={{ ...s.formaSub,   color: meta.cor }}>{f.quantidade} {f.quantidade === 1 ? "venda" : "vendas"}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ABA: Relatórios ── */}
      {aba === "relatorio" && (
        <div>
          <div style={s.card}>
            <div style={s.cardHeader}><span style={s.cardTitle}>Período</span></div>
            <div style={{ ...s.cardBody, flexDirection: "row", alignItems: "flex-end", gap: "12px" }}>
              <Field label="Data início">
                <input style={s.input} type="date" value={dataRelatorio.inicio}
                  onChange={(e) => setDataRelatorio((p) => ({ ...p, inicio: e.target.value }))} />
              </Field>
              <Field label="Data fim">
                <input style={s.input} type="date" value={dataRelatorio.fim}
                  onChange={(e) => setDataRelatorio((p) => ({ ...p, fim: e.target.value }))} />
              </Field>
              <button style={s.btnPrimary} onClick={carregarRelatorio}>Gerar relatório</button>
            </div>
          </div>

          {relatorio && (
            <>
              <div style={s.statsGrid}>
                <StatCard label="Faturamento total" value={brl(relatorio.totais.faturamento)} sub={`${relatorio.totais.num_vendas} vendas`} success />
                <StatCard label="Lucro bruto"       value={brl(relatorio.totais.lucro_bruto)} />
                <StatCard label="Despesas"          value={brl(relatorio.totais.despesas)}    warn={relatorio.totais.despesas > 0} />
                <StatCard label="Lucro líquido"     value={brl(relatorio.totais.lucro_liquido)}
                  success={relatorio.totais.lucro_liquido > 0} warn={relatorio.totais.lucro_liquido < 0}
                />
              </div>

              <div style={s.card}>
                <div style={s.cardHeader}>
                  <span style={s.cardTitle}>Detalhamento por dia</span>
                  <span style={s.cardSub}>{relatorio.por_dia.length} dias com movimento</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={s.table}>
                    <thead><tr>
                      <th style={s.th}>Data</th><th style={s.th}>Vendas</th>
                      <th style={s.th}>Faturamento</th><th style={s.th}>Descontos</th>
                      <th style={s.th}>Lucro bruto</th><th style={s.th}>Despesas</th>
                      <th style={s.th}>Lucro líquido</th>
                    </tr></thead>
                    <tbody>
                      {relatorio.por_dia.length === 0 ? (
                        <tr><td colSpan={7} style={s.emptyRow}>Nenhum dado no período</td></tr>
                      ) : relatorio.por_dia.map((dia) => (
                        <tr key={dia.dia}>
                          <td style={{ ...s.td, ...s.tdNome }}>{new Date(dia.dia).toLocaleDateString("pt-BR")}</td>
                          <td style={s.td}>{dia.num_vendas}</td>
                          <td style={s.td}>{brl(dia.faturamento)}</td>
                          <td style={{ ...s.td, color: "#D85A30" }}>{brl(dia.descontos)}</td>
                          <td style={s.td}>{brl(dia.lucro_bruto)}</td>
                          <td style={{ ...s.td, color: "#D85A30" }}>{brl(dia.despesas)}</td>
                          <td style={{ ...s.td, fontWeight: "600", color: dia.lucro_liquido >= 0 ? "#1D9E75" : "#D85A30" }}>
                            {brl(dia.lucro_liquido)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ABA: Caixa ── */}
      {aba === "caixa" && (
        <div style={s.cols}>
          <div style={s.card}>
            <div style={s.cardHeader}><span style={s.cardTitle}>Controle do caixa</span></div>
            <div style={s.cardBody}>
              {status && (
                <div style={s.caixaStatus}>
                  <div style={s.caixaStatusRow}>
                    <span style={s.caixaStatusLabel}>Status</span>
                    <span style={{ ...s.badge, ...(status.aberto ? s.badgeAtivo : s.badgeInativo) }}>
                      {status.aberto ? "Aberto" : "Fechado"}
                    </span>
                  </div>
                  {status.hora_abertura && (
                    <div style={s.caixaStatusRow}>
                      <span style={s.caixaStatusLabel}>Aberto em</span>
                      <span style={s.caixaStatusValor}>{fmtData(status.hora_abertura)}</span>
                    </div>
                  )}
                  {status.saldo_abertura !== null && (
                    <div style={s.caixaStatusRow}>
                      <span style={s.caixaStatusLabel}>Saldo inicial</span>
                      <span style={s.caixaStatusValor}>{brl(status.saldo_abertura)}</span>
                    </div>
                  )}
                  {status.hora_fechamento && (
                    <div style={s.caixaStatusRow}>
                      <span style={s.caixaStatusLabel}>Fechado em</span>
                      <span style={s.caixaStatusValor}>{fmtData(status.hora_fechamento)}</span>
                    </div>
                  )}
                </div>
              )}

              {status && !status.aberto && (
                <>
                  <Field label="Saldo inicial (troco)">
                    <input style={s.input} type="number" min="0" step="0.01" placeholder="0,00"
                      value={saldoAbertura} onChange={(e) => setSaldoAbertura(e.target.value)} />
                  </Field>
                  <button style={{ ...s.btnSuccess, ...(salvando ? s.btnDisabled : {}) }}
                    onClick={abrirCaixa} disabled={salvando}>
                    {salvando ? "Abrindo..." : "Abrir caixa"}
                  </button>
                </>
              )}

              {status && status.aberto && (
                <>
                  <Field label="Saldo final em caixa">
                    <input style={s.input} type="number" min="0" step="0.01" placeholder="0,00"
                      value={saldoFechamento} onChange={(e) => setSaldoFechamento(e.target.value)} />
                  </Field>
                  <button style={{ ...s.btnDanger, ...(salvando ? s.btnDisabled : {}) }}
                    onClick={fecharCaixa} disabled={salvando}>
                    {salvando ? "Fechando..." : "Fechar caixa"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ABA: Histórico unificado ── */}
      {aba === "historico" && (
        <div>
          {/* Filtro de datas */}
          <div style={s.card}>
            <div style={s.cardHeader}><span style={s.cardTitle}>Filtrar período</span></div>
            <div style={{ ...s.cardBody, flexDirection: "row", alignItems: "flex-end", gap: "12px" }}>
              <Field label="De">
                <input style={s.input} type="date" value={filtroHistorico.inicio}
                  onChange={(e) => setFiltroHistorico((p) => ({ ...p, inicio: e.target.value }))} />
              </Field>
              <Field label="Até">
                <input style={s.input} type="date" value={filtroHistorico.fim}
                  onChange={(e) => setFiltroHistorico((p) => ({ ...p, fim: e.target.value }))} />
              </Field>
              <button style={s.btnPrimary}
                onClick={() => carregarHistorico(filtroHistorico.inicio, filtroHistorico.fim)}>
                Filtrar
              </button>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Movimentações e despesas</span>
              <span style={s.cardSub}>{historico.length} registros</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead><tr>
                  <th style={s.th}>Tipo</th>
                  <th style={s.th}>Origem</th>
                  <th style={s.th}>Valor</th>
                  <th style={s.th}>Categoria / Forma</th>
                  <th style={s.th}>Descrição</th>
                  <th style={s.th}>Data</th>
                </tr></thead>
                <tbody>
                  {historico.length === 0 ? (
                    <tr><td colSpan={6} style={s.emptyRow}>Nenhuma movimentação no período</td></tr>
                  ) : (
                    historico.map((m) => (
                      <tr key={m.id}>
                        <td style={s.td}>
                          <span style={{ ...s.badge, ...(m.tipo === "entrada" ? s.badgeEntrada : s.badgeSaida) }}>
                            {m.tipo === "entrada" ? "↑ Entrada" : "↓ Saída"}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, ...(m.origem === "despesa" ? s.badgeDespesa : s.badgeCaixa) }}>
                            {m.origem === "despesa" ? "Despesa" : "Caixa"}
                          </span>
                        </td>
                        <td style={{ ...s.td, fontWeight: "600", color: m.tipo === "entrada" ? "#1D9E75" : "#D85A30" }}>
                          {m.tipo === "entrada" ? "+" : "−"}{brl(m.valor)}
                        </td>
                        <td style={{ ...s.td, ...s.tdMuted }}>
                          {m.categoria ?? m.forma ?? "—"}
                        </td>
                        <td style={{ ...s.td, ...s.tdMuted }}>{m.descricao ?? "—"}</td>
                        <td style={{ ...s.td, ...s.tdMuted }}>{fmtData(m.data)}</td>
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
  page:       { padding: "24px", background: "#f1f5f9", minHeight: "100vh" },
  pageHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" },
  pageTitle:  { fontSize: "18px", fontWeight: "600", color: "#0f172a", margin: 0 },
  pageSub:    { fontSize: "13px", color: "#94a3b8", marginTop: "2px" },

  statusBadge:  { fontSize: "12px", fontWeight: "600", padding: "6px 14px", borderRadius: "999px" },
  statusAberto: { background: "#E1F5EE", color: "#085041" },
  statusFechado:{ background: "#f1f5f9", color: "#64748b" },

  alertDanger: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#dc2626", marginBottom: "16px",
  },
  alertSuccess: {
    background: "#EAF3DE", border: "1px solid #C0DD97",
    borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#3B6D11", marginBottom: "16px",
  },
  alertClose: { background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "14px", padding: 0 },

  abas: { display: "flex", gap: "4px", marginBottom: "16px", background: "#ffffff", padding: "4px", borderRadius: "10px", border: "1px solid #f1f5f9", width: "fit-content" },
  aba:  { padding: "7px 16px", borderRadius: "7px", border: "none", background: "none", fontSize: "13px", fontWeight: "500", color: "#64748b", cursor: "pointer", fontFamily: "inherit" },
  abaAtiva: { background: "#534AB7", color: "#ffffff" },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" },
  statCard:  { background: "#ffffff", borderRadius: "10px", padding: "14px 16px", border: "1px solid #f1f5f9" },
  statWarn:    { border: "1px solid #FAC775", background: "#FAEEDA" },
  statSuccess: { border: "1px solid #C0DD97", background: "#EAF3DE" },
  statLabel: { fontSize: "11px", color: "#94a3b8", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" },
  statValue:        { fontSize: "20px", fontWeight: "600", color: "#0f172a" },
  statValueWarn:    { color: "#854F0B" },
  statValueSuccess: { color: "#1D9E75" },
  statSub: { fontSize: "11px", color: "#94a3b8", marginTop: "2px" },

  card:       { background: "#ffffff", borderRadius: "12px", border: "1px solid #f1f5f9", overflow: "hidden", marginBottom: "16px" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #f8fafc" },
  cardTitle:  { fontSize: "13px", fontWeight: "600", color: "#0f172a" },
  cardSub:    { fontSize: "12px", color: "#94a3b8" },
  cardBody:   { padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" },

  cols: { display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "16px", alignItems: "start" },

  formasGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" },
  formaCard:  { borderRadius: "8px", padding: "12px 14px" },
  formaLabel: { fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px" },
  formaValor: { fontSize: "18px", fontWeight: "700", margin: "4px 0 2px" },
  formaSub:   { fontSize: "11px" },

  caixaStatus:      { background: "#f8fafc", borderRadius: "8px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #f1f5f9" },
  caixaStatusRow:   { display: "flex", justifyContent: "space-between", alignItems: "center" },
  caixaStatusLabel: { fontSize: "12px", color: "#64748b" },
  caixaStatusValor: { fontSize: "13px", fontWeight: "500", color: "#0f172a" },

  field:      { display: "flex", flexDirection: "column", gap: "5px" },
  fieldLabel: { fontSize: "11px", color: "#64748b", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.4px" },
  input: { padding: "8px 10px", borderRadius: "7px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "13px", color: "#0f172a", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },

  btnPrimary: { padding: "9px 16px", background: "#534AB7", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" },
  btnSuccess: { width: "100%", padding: "10px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" },
  btnDanger:  { width: "100%", padding: "10px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" },
  btnDisabled:{ opacity: 0.6, cursor: "not-allowed" },

  table:   { width: "100%", borderCollapse: "collapse" },
  th:      { textAlign: "left", padding: "10px 16px", fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "1px solid #f1f5f9" },
  td:      { padding: "11px 16px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc" },
  tdNome:  { fontWeight: "500", color: "#0f172a" },
  tdMuted: { color: "#94a3b8", fontSize: "12px" },
  emptyRow:{ textAlign: "center", padding: "32px", color: "#94a3b8", fontSize: "13px" },

  badge:        { fontSize: "11px", padding: "3px 8px", borderRadius: "999px", fontWeight: "500" },
  badgeAtivo:   { background: "#EAF3DE", color: "#3B6D11" },
  badgeInativo: { background: "#f1f5f9", color: "#94a3b8" },
  badgeEntrada: { background: "#E1F5EE", color: "#085041" },
  badgeSaida:   { background: "#FAECE7", color: "#4A1B0C" },
  badgeDespesa: { background: "#FAEEDA", color: "#633806" },
  badgeCaixa:   { background: "#EEEDFE", color: "#26215C" },

  empty: { fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "20px 0" },
};