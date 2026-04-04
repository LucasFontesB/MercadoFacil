import { useState, useEffect, useRef, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import Cupom from "../components/Cupom";

// ─── Formatação de moeda ────────────────────────────────────────────────────
const brl = (valor) =>
  Number(valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ─── Ícones SVG inline ──────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="7" cy="7" r="5" stroke="#94a3b8" strokeWidth="1.4" />
    <path d="M11 11l3 3" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
    <path d="M5 7h8M9 4l3 3-3 3M8 2H2a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h6"
      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconClose = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M3 8h10M8 3l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Modal de abertura de turno ─────────────────────────────────────────────
function ModalAberturaTurno({ operador, onAbrir, salvando }) {
  const [saldo, setSaldo] = useState("");

  return (
    <div style={ms.overlay}>
      <div style={ms.modal}>
        <div style={ms.header}>
          <div style={ms.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="14" rx="1.5" fill="white" />
              <rect x="9" y="4" width="6" height="11" rx="1.5" fill="white" opacity="0.7" />
            </svg>
          </div>
          <span style={ms.headerTitle}>Caixify PDV</span>
        </div>

        <div style={ms.body}>
          <div style={ms.icon}>🕐</div>
          <h2 style={ms.title}>Abrir turno</h2>
          <p style={ms.sub}>
            Olá, <strong>{operador}</strong>! Informe o saldo inicial do caixa para começar.
          </p>

          <div style={ms.field}>
            <label style={ms.label}>Troco inicial em caixa</label>
            <div style={ms.inputPrefix}>
              <span style={ms.prefix}>R$</span>
              <input
                style={ms.inputInner}
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={saldo}
                onChange={(e) => setSaldo(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <button
            style={{ ...ms.btn, ...(salvando ? ms.btnDisabled : {}) }}
            onClick={() => onAbrir(saldo || "0")}
            disabled={salvando}
          >
            {salvando ? "Abrindo..." : "Abrir turno e entrar no PDV"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de fechamento de turno ───────────────────────────────────────────
function ModalFechamentoTurno({ turno, operador, onFechar, onCancelar, salvando }) {
  const [saldo, setSaldo] = useState("");

  return (
    <div style={ms.overlay}>
      <div style={ms.modal}>
        <div style={ms.header}>
          <div style={ms.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="14" rx="1.5" fill="white" />
              <rect x="9" y="4" width="6" height="11" rx="1.5" fill="white" opacity="0.7" />
            </svg>
          </div>
          <span style={ms.headerTitle}>Caixify PDV</span>
        </div>

        <div style={ms.body}>
          <div style={ms.icon}>🔒</div>
          <h2 style={ms.title}>Fechar turno</h2>
          <p style={ms.sub}>Confira o resumo do seu turno antes de fechar.</p>

          {/* Resumo do turno */}
          <div style={ms.resumo}>
            <div style={ms.resumoRow}>
              <span style={ms.resumoLabel}>Operador</span>
              <span style={ms.resumoValor}>{operador}</span>
            </div>
            <div style={ms.resumoRow}>
              <span style={ms.resumoLabel}>Vendas realizadas</span>
              <span style={ms.resumoValor}>{turno.num_vendas} {turno.num_vendas === 1 ? "venda" : "vendas"}</span>
            </div>
            <div style={ms.resumoRow}>
              <span style={ms.resumoLabel}>Total vendido</span>
              <span style={{ ...ms.resumoValor, color: "#1D9E75", fontWeight: "600" }}>
                {brl(turno.total_vendas)}
              </span>
            </div>
            <div style={ms.resumoRow}>
              <span style={ms.resumoLabel}>Saldo de abertura</span>
              <span style={ms.resumoValor}>{brl(turno.saldo_abertura)}</span>
            </div>
          </div>

          <div style={ms.field}>
            <label style={ms.label}>Saldo final em caixa</label>
            <div style={ms.inputPrefix}>
              <span style={ms.prefix}>R$</span>
              <input
                style={ms.inputInner}
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={saldo}
                onChange={(e) => setSaldo(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <button
            style={{ ...ms.btnDanger, ...(salvando ? ms.btnDisabled : {}) }}
            onClick={() => onFechar(saldo || "0")}
            disabled={salvando}
          >
            {salvando ? "Fechando..." : "Confirmar fechamento"}
          </button>

          <button style={ms.btnCancelar} onClick={onCancelar}>
            Cancelar — voltar ao PDV
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ───────────────────────────────────────────────────
export default function PDV() {
  const [itens, setItens]                     = useState([]);
  const [erro, setErro]                       = useState("");
  const [busca, setBusca]                     = useState("");
  const [sugestoes, setSugestoes]             = useState([]);
  const [showSugestoes, setShowSugestoes]     = useState(false);
  const [produtos, setProdutos]               = useState([]);
  const [vendaFinalizada, setVendaFinalizada] = useState(null);

  // ── Turno ──────────────────────────────────────────────────────────────────
  const [turno, setTurno]                   = useState(null);    // turno aberto atual
  const [turnoCarregado, setTurnoCarregado] = useState(false);   // evita flash de tela
  const [showFecharTurno, setShowFecharTurno] = useState(false);
  const [salvandoTurno, setSalvandoTurno]   = useState(false);

  const { usuario, setUsuario } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const empresa  = usuario?.empresa_nome;
  const logo     = usuario?.empresa_logo;
  const operador = usuario?.nome
    ?? JSON.parse(localStorage.getItem("usuario") || "{}")?.nome
    ?? null;
  const total = itens.reduce((acc, item) => acc + item.subtotal, 0);

  usePageTitle("PDV");

  // ── Verifica turno ao carregar ─────────────────────────────────────────────
  const verificarTurno = useCallback(async () => {
    try {
      const res = await api.get("/turnos/meu-turno");
      setTurno(res.data.aberto ? res.data.turno : null);
    } catch {
      setTurno(null);
    } finally {
      setTurnoCarregado(true);
    }
  }, []);

  useEffect(() => {
    verificarTurno();
  }, [verificarTurno]);

  // Foco automático ao montar (só quando turno estiver aberto)
  useEffect(() => {
    if (turno) inputRef.current?.focus();
  }, [turno]);

  // Carrega catálogo de produtos
  useEffect(() => {
    async function carregarProdutos() {
      try {
        const response = await api.get("/produtos");
        setProdutos(response.data);
      } catch (error) {
        console.error("Erro ao carregar produtos", error);
      }
    }
    carregarProdutos();
  }, []);

  // Filtra sugestões conforme busca
  useEffect(() => {
    if (!busca) { setSugestoes([]); return; }
    const filtrados = produtos.filter((p) =>
      p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigo_barras?.includes(busca)
    );
    setSugestoes(filtrados.slice(0, 5));
  }, [busca, produtos]);

  // Dispara impressão após finalizar venda
  useEffect(() => {
    if (vendaFinalizada) {
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [vendaFinalizada]);

  // ── Turno: abrir ───────────────────────────────────────────────────────────
  const abrirTurno = async (saldoAbertura) => {
    setSalvandoTurno(true);
    try {
      const res = await api.post("/turnos/abrir", {
        saldo_abertura: Number(saldoAbertura) || 0,
      });
      setTurno({
        id:             res.data.turno_id,
        saldo_abertura: res.data.saldo_abertura,
        aberto_em:      res.data.aberto_em,
        num_vendas:     0,
        total_vendas:   0,
      });
    } catch (e) {
      setErro("Erro ao abrir turno");
    } finally {
      setSalvandoTurno(false);
    }
  };

  // ── Turno: fechar ──────────────────────────────────────────────────────────
  const fecharTurno = async (saldoFechamento) => {
    setSalvandoTurno(true);
    try {
      await api.post("/turnos/fechar", {
        saldo_fechamento: Number(saldoFechamento) || 0,
      });
      setTurno(null);
      setShowFecharTurno(false);
      // Redireciona para login após fechar turno
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      setUsuario(null);
      navigate("/login");
    } catch {
      setErro("Erro ao fechar turno");
      setSalvandoTurno(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  function processarEntrada(valor) {
    if (valor.includes("*")) {
      const [qtdStr, cod] = valor.split("*");
      return { quantidade: Number(qtdStr) || 1, codigo: cod };
    }
    return { quantidade: 1, codigo: valor };
  }

  // ── Ações ──────────────────────────────────────────────────────────────────
  const logout = () => {
    // Se tem turno aberto, pede para fechar antes
    if (turno) {
      setShowFecharTurno(true);
      return;
    }
    if (!confirm("Deseja sair do sistema?")) return;
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setUsuario(null);
    navigate("/login");
  };

  const adicionarProduto = async (input, quantidade = 1) => {
    try {
      let data = null;
      if (typeof input === "object") {
        data = input;
      } else {
        const response = await api.get(`/produtos/buscar?q=${input}`);
        data = response.data[0];
      }

      if (!data) throw new Error("Produto não encontrado");

      const produto = {
        id:     data.id,
        nome:   data.nome,
        codigo: data.codigo_barras,
        preco:  data.preco_venda,
      };

      setItens((prev) => {
        const existente = prev.find((i) => i.produto_id === produto.id);
        if (existente) {
          return prev.map((i) =>
            i.produto_id === produto.id
              ? { ...i, quantidade: i.quantidade + quantidade, subtotal: (i.quantidade + quantidade) * i.preco }
              : i
          );
        }
        return [...prev, { produto_id: produto.id, nome: produto.nome, preco: produto.preco, quantidade, subtotal: produto.preco * quantidade }];
      });

      setBusca("");
      setErro("");
      inputRef.current?.focus();
    } catch {
      setErro("Produto não encontrado");
    }
  };

  const alterarQuantidade = (index, quantidade) => {
    setItens((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantidade, subtotal: quantidade * item.preco } : item
      )
    );
  };

  const removerItem = (index) => {
    setItens((prev) => prev.filter((_, i) => i !== index));
  };

  const finalizarVenda = async () => {
    try {
      const venda = { itens, total, pagamento: "dinheiro" };

      // 1. Cria a venda vinculada ao turno atual
      const response = await api.post("/vendas", {
        total,
        desconto:        0,
        forma_pagamento: "dinheiro",
        turno_id:        turno?.id ?? null,
      });

      const vendaId = response.data.id;

      // 2. Registra cada item
      await Promise.all(
        itens.map((item) =>
          api.post(`/venda-itens/${vendaId}`, {
            produto_id: item.produto_id,
            quantidade: item.quantidade,
          })
        )
      );

      // 3. Atualiza contadores do turno localmente
      if (turno) {
        setTurno((t) => ({
          ...t,
          num_vendas:   (t.num_vendas   ?? 0) + 1,
          total_vendas: (t.total_vendas ?? 0) + total,
        }));
      }

      setVendaFinalizada(venda);
      setItens([]);
      setErro("");
      inputRef.current?.focus();
    } catch {
      setErro("Erro ao finalizar venda");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (sugestoes.length > 0) {
      adicionarProduto(sugestoes[0]);
    } else {
      const { quantidade, codigo } = processarEntrada(busca);
      adicionarProduto(codigo, quantidade);
    }
    setBusca("");
    setShowSugestoes(false);
  };

  // ── Aguarda verificação do turno ───────────────────────────────────────────
  if (!turnoCarregado) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f1f5f9", fontSize: "14px", color: "#94a3b8" }}>
        Carregando...
      </div>
    );
  }

  // ── Modal de abertura de turno ─────────────────────────────────────────────
  if (!turno) {
    return (
      <ModalAberturaTurno
        operador={operador}
        onAbrir={abrirTurno}
        salvando={salvandoTurno}
      />
    );
  }

  // ── Modal de fechamento de turno ───────────────────────────────────────────
  if (showFecharTurno) {
    return (
      <ModalFechamentoTurno
        turno={turno}
        operador={operador}
        onFechar={fecharTurno}
        onCancelar={() => setShowFecharTurno(false)}
        salvando={salvandoTurno}
      />
    );
  }

  // ── Render principal ────────────────────────────────────────────────────────
  return (
    <div>
      <div style={s.container}>

        {/* ── Painel esquerdo ── */}
        <div style={s.left}>

          {/* Topbar */}
          <div style={s.topbar}>
            <div style={s.topbarLeft}>
              <div style={s.logoIcon}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="14" rx="1.5" fill="white" />
                  <rect x="9" y="4" width="6" height="11" rx="1.5" fill="white" opacity="0.7" />
                </svg>
              </div>
              <span style={s.appName}>Caixify</span>
              <span style={s.pdvBadge}>PDV</span>

              {/* Badge do turno */}
              <span style={s.turnoBadge}>
                Turno #{turno.id} · {turno.num_vendas} {turno.num_vendas === 1 ? "venda" : "vendas"}
              </span>

              {/* Botão admin */}
              {usuario?.tipo === "admin" && (
                <button style={s.adminBtn} onClick={() => navigate("/admin/produtos")}>
                  Painel ADM
                </button>
              )}
            </div>

            <button style={s.logoutBtn} onClick={logout}>
              <IconLogout />
              Fechar turno
            </button>
          </div>

          {/* Campo de busca */}
          <div style={s.searchArea}>
            <div style={{ position: "relative" }}>
              <div style={s.searchIcon}><IconSearch /></div>
              <input
                ref={inputRef}
                placeholder="Digite código de barras ou nome do produto..."
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setShowSugestoes(true); }}
                onKeyDown={handleKeyDown}
                style={s.searchInput}
                aria-label="Buscar produto"
                autoComplete="off"
              />

              {showSugestoes && sugestoes.length > 0 && (
                <div style={s.dropdown}>
                  {sugestoes.map((item, i) => (
                    <div
                      key={i}
                      style={s.dropdownItem}
                      onClick={() => { adicionarProduto(item); setShowSugestoes(false); }}
                    >
                      <span style={s.dropdownNome}>{item.nome}</span>
                      <span style={s.dropdownPreco}>{brl(item.preco_venda ?? 0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p style={s.searchHint}>
              Pressione <kbd style={s.kbd}>Enter</kbd> para adicionar &nbsp;·&nbsp;
              Use <kbd style={s.kbd}>2*código</kbd> para adicionar 2 unidades
            </p>
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div style={s.errorBar} role="alert">{erro}</div>
          )}

          {/* Tabela de itens */}
          <div style={s.tableArea}>
            <div style={s.tableHead}>
              <span style={s.thNome}>Produto</span>
              <span style={s.thQtd}>Qtd</span>
              <span style={s.thPreco}>Preço</span>
              <span style={s.thSubtotal}>Subtotal</span>
              <span style={s.thAcao} />
            </div>

            {itens.length === 0 ? (
              <div style={s.emptyState}>Nenhum item adicionado ainda</div>
            ) : (
              itens.map((item, index) => (
                <div key={index} style={s.itemRow}>
                  <span style={s.itemNome}>{item.nome}</span>
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => alterarQuantidade(index, Number(e.target.value))}
                      style={s.qtdInput}
                      aria-label={`Quantidade de ${item.nome}`}
                    />
                  </div>
                  <span style={s.itemCell}>{brl(item.preco)}</span>
                  <span style={{ ...s.itemCell, ...s.itemSubtotal }}>{brl(item.subtotal)}</span>
                  <button
                    onClick={() => removerItem(index)}
                    style={s.removeBtn}
                    aria-label={`Remover ${item.nome}`}
                  >
                    <IconClose />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Painel direito (resumo) ── */}
        <div style={s.right}>

          {/* Empresa */}
          <div style={s.empresaBox}>
            {logo ? (
              <img src={`http://127.0.0.1:8000${logo}`} alt={`Logo ${empresa}`} style={s.logoImg} />
            ) : (
              <div style={s.empresaAvatar}>
                {empresa?.charAt(0)?.toUpperCase() ?? "E"}
              </div>
            )}
            <span style={s.empresaNome}>{empresa}</span>
            {operador && <span style={s.operadorNome}>Operador: {operador}</span>}
          </div>

          {/* Contador de itens */}
          <div style={s.itemsCount}>
            <span style={s.itemsCountLabel}>Itens na venda</span>
            <span style={s.itemsCountValue}>{itens.length} {itens.length === 1 ? "item" : "itens"}</span>
          </div>

          {/* Total */}
          <div style={s.totalBox}>
            <span style={s.totalLabel}>TOTAL</span>
            <h1 style={s.totalValue}>{brl(total)}</h1>
            <span style={s.totalHint}>Forma: Dinheiro</span>
          </div>

          {/* Botão finalizar */}
          <button style={s.finalizarBtn} onClick={finalizarVenda}>
            <IconArrow />
            Finalizar Venda
          </button>
        </div>

      </div>

      {/* Área de impressão */}
      <div id="print-area" className="no-screen">
        {vendaFinalizada && (
          <Cupom
            venda={vendaFinalizada}
            empresa={empresa}
            logo={logo}
            cnpj={usuario?.empresa_cnpj}
            contato={usuario?.empresa_contato}
            operador={operador}
          />
        )}
      </div>
    </div>
  );
}

// ─── Estilos dos modais ──────────────────────────────────────────────────────
const ms = {
  overlay: {
    position: "fixed", inset: 0,
    background: "#0f172a",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#ffffff",
    borderRadius: "16px",
    width: "380px",
    overflow: "hidden",
    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
  },
  header: {
    background: "#534AB7",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    width: "28px", height: "28px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "6px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: "15px", fontWeight: "600", color: "#fff" },
  body: {
    padding: "28px 28px 24px",
    display: "flex", flexDirection: "column", gap: "16px",
    alignItems: "center", textAlign: "center",
  },
  icon:  { fontSize: "36px", lineHeight: 1 },
  title: { fontSize: "18px", fontWeight: "600", color: "#0f172a", margin: 0 },
  sub:   { fontSize: "14px", color: "#64748b", lineHeight: "1.5", margin: 0 },
  resumo: {
    width: "100%",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #f1f5f9",
    overflow: "hidden",
  },
  resumoRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "9px 14px", borderBottom: "1px solid #f1f5f9",
    fontSize: "13px",
  },
  resumoLabel: { color: "#64748b" },
  resumoValor: { fontWeight: "500", color: "#0f172a" },
  field: { display: "flex", flexDirection: "column", gap: "6px", width: "100%", textAlign: "left" },
  label: { fontSize: "12px", color: "#64748b", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.4px" },
  inputPrefix: {
    display: "flex", alignItems: "center",
    border: "1px solid #e2e8f0", borderRadius: "8px",
    background: "#f8fafc", overflow: "hidden",
  },
  prefix: {
    padding: "10px 12px", fontSize: "14px", color: "#94a3b8",
    background: "#f1f5f9", borderRight: "1px solid #e2e8f0", flexShrink: 0,
  },
  inputInner: {
    flex: 1, padding: "10px 12px", border: "none",
    background: "transparent", fontSize: "14px",
    color: "#0f172a", outline: "none", fontFamily: "inherit",
  },
  btn: {
    width: "100%", padding: "12px",
    background: "#534AB7", color: "#fff",
    border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "600",
    cursor: "pointer", fontFamily: "inherit",
  },
  btnDanger: {
    width: "100%", padding: "12px",
    background: "#dc2626", color: "#fff",
    border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "600",
    cursor: "pointer", fontFamily: "inherit",
  },
  btnCancelar: {
    width: "100%", padding: "10px",
    background: "none", color: "#64748b",
    border: "1px solid #e2e8f0", borderRadius: "8px",
    fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
};

// ─── Estilos do PDV ──────────────────────────────────────────────────────────
const DARK = "#0f172a";

const s = {
  container: {
    display: "flex", height: "100vh",
    background: "#f1f5f9", overflow: "hidden",
    zoom: 1.1,
  },
  left: { flex: 3, display: "flex", flexDirection: "column", overflow: "hidden" },

  topbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 20px", background: "#ffffff",
    borderBottom: "1px solid #e2e8f0", flexShrink: 0,
  },
  topbarLeft: { display: "flex", alignItems: "center", gap: "10px" },

  logoIcon: {
    width: "28px", height: "28px", background: "#534AB7",
    borderRadius: "6px", display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  },
  appName:  { fontSize: "15px", fontWeight: "600", color: "#0f172a" },
  pdvBadge: { background: "#EEEDFE", color: "#534AB7", fontSize: "11px", padding: "2px 8px", borderRadius: "999px", fontWeight: "500" },

  turnoBadge: {
    background: "#f1f5f9", color: "#64748b",
    fontSize: "11px", padding: "2px 8px",
    borderRadius: "999px", fontWeight: "500",
  },

  adminBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    background: "none", border: "1px solid #e2e8f0",
    color: "#534AB7", padding: "5px 12px",
    borderRadius: "8px", cursor: "pointer",
    fontSize: "13px", fontWeight: "500", fontFamily: "inherit",
  },

  logoutBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    background: "none", border: "1px solid #e2e8f0",
    color: "#64748b", padding: "6px 12px",
    borderRadius: "8px", cursor: "pointer",
    fontSize: "13px", fontFamily: "inherit",
  },

  searchArea: {
    padding: "14px 20px", background: "#ffffff",
    borderBottom: "1px solid #e2e8f0", flexShrink: 0,
  },
  searchIcon: {
    position: "absolute", left: "12px", top: "50%",
    transform: "translateY(-50%)", display: "flex",
    alignItems: "center", pointerEvents: "none",
  },
  searchInput: {
    width: "100%", padding: "10px 12px 10px 38px",
    borderRadius: "8px", border: "1px solid #e2e8f0",
    background: "#f8fafc", fontSize: "15px",
    color: "#0f172a", outline: "none", fontFamily: "inherit",
  },
  searchHint: { fontSize: "12px", color: "#94a3b8", marginTop: "7px" },
  kbd: {
    background: "#f1f5f9", border: "1px solid #e2e8f0",
    borderRadius: "4px", padding: "1px 5px",
    fontSize: "11px", color: "#64748b", fontFamily: "inherit",
  },

  dropdown: {
    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
    background: "#ffffff", border: "1px solid #e2e8f0",
    borderRadius: "8px", zIndex: 20, overflow: "hidden",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
  dropdownItem: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 14px", cursor: "pointer",
    borderBottom: "1px solid #f1f5f9", fontSize: "14px",
  },
  dropdownNome:  { color: "#0f172a" },
  dropdownPreco: { color: "#534AB7", fontWeight: "500" },

  errorBar: {
    margin: "8px 20px 0",
    background: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: "8px", padding: "8px 14px",
    fontSize: "13px", color: "#dc2626", flexShrink: 0,
  },

  tableArea: { flex: 1, overflowY: "auto", padding: "14px 20px" },

  tableHead: {
    display: "grid",
    gridTemplateColumns: "1fr 90px 110px 110px 36px",
    alignItems: "center", gap: "8px", padding: "0 12px 8px",
  },
  thNome:    { fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  thQtd:     { width: 90,  fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  thPreco:   { width: 110, fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  thSubtotal:{ width: 110, fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  thAcao:    { width: 36 },

  itemRow: {
    display: "grid",
    gridTemplateColumns: "1fr 90px 110px 110px 36px",
    alignItems: "center", gap: "8px",
    background: "#ffffff", border: "1px solid #f1f5f9",
    borderRadius: "10px", padding: "10px 12px", marginBottom: "6px",
  },
  itemNome:    { flex: 1, fontSize: "14px", fontWeight: "600", color: "#0f172a" },
  itemCell:    { fontSize: "14px", color: "#64748b" },
  itemSubtotal:{ color: "#0f172a", fontWeight: "500" },

  qtdInput: {
    width: "60px", padding: "6px 8px",
    borderRadius: "6px", border: "1px solid #e2e8f0",
    background: "#f8fafc", fontSize: "13px",
    textAlign: "center", fontFamily: "inherit", color: "#0f172a",
  },
  removeBtn: {
    width: "28px", height: "28px",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "none", border: "none", borderRadius: "6px",
    cursor: "pointer", color: "#94a3b8", flexShrink: 0,
  },
  emptyState: {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "120px", fontSize: "14px", color: "#94a3b8",
  },

  // Painel direito
  right: {
    width: "280px", flexShrink: 0,
    background: DARK, color: "#fff",
    display: "flex", flexDirection: "column",
    padding: "20px 16px", gap: "16px",
  },
  empresaBox: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
    paddingBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  logoImg: {
    width: "100%", maxWidth: "120px", maxHeight: "60px",
    objectFit: "contain", borderRadius: "8px",
    background: "#1e293b", padding: "6px",
  },
  empresaAvatar: {
    width: "44px", height: "44px", borderRadius: "10px",
    background: "#1e293b", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "18px", fontWeight: "600", color: "#7F77DD",
  },
  empresaNome: { fontSize: "13px", fontWeight: "500", color: "#f1f5f9", textAlign: "center", wordBreak: "break-word" },
  operadorNome:{ fontSize: "12px", color: "#64748b" },

  itemsCount: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  itemsCountLabel: { fontSize: "12px", color: "#475569" },
  itemsCountValue: { fontSize: "12px", color: "#94a3b8", fontWeight: "500" },

  totalBox: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px" },
  totalLabel: { fontSize: "11px", color: "#334155", letterSpacing: "2px", fontWeight: "600" },
  totalValue: { fontSize: "38px", fontWeight: "700", color: "#f8fafc", lineHeight: 1.1 },
  totalHint:  { fontSize: "11px", color: "#334155" },

  finalizarBtn: {
    width: "100%", padding: "14px", border: "none",
    borderRadius: "10px", background: "#16a34a",
    color: "#fff", fontSize: "15px", fontWeight: "600",
    cursor: "pointer", fontFamily: "inherit",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
  },
};