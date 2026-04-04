export default function Cupom({
  venda,
  empresa,
  logo,
  cnpj,
  contato,
  operador
}) {
  if (!venda) return null;

  const formatarMoeda = (valor) =>
    Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const desconto = Number(venda.desconto || 0);
  const totalBruto = Number(venda.total || 0) + desconto;

  return (
    <div id="cupom" style={{ textAlign: "center" }}>

      {/* 🔥 LOGO */}
      {logo && (
        <img
          src={`http://127.0.0.1:8000${logo}`}
          alt="Logo"
          style={{ width: "120px", marginBottom: "5px" }}
        />
      )}

      {/* 🔥 EMPRESA */}
      <h3 style={{ margin: 0 }}>
        {empresa || "MINHA LOJA"}
      </h3>

      {/* 🔥 CNPJ */}
      {cnpj && (
        <p style={{ margin: 0, fontSize: "12px" }}>
          CNPJ: {cnpj}
        </p>
      )}

      {/* 🔥 CONTATO */}
      {contato && (
        <p style={{ margin: 0, fontSize: "12px" }}>
          Contato: {contato}
        </p>
      )}

      <hr />

      {/* 🔥 ITENS */}
      {venda.itens.map((item, i) => (
        <div key={i} style={{ fontSize: "12px" }}>
          <div style={{ textAlign: "left" }}>
            {item.quantidade}x {item.nome}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{formatarMoeda(item.preco)}</span>
            <span>{formatarMoeda(item.subtotal)}</span>
          </div>
        </div>
      ))}

      <hr />

      {/* 🔥 SUBTOTAL */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Subtotal</span>
        <span>{formatarMoeda(totalBruto)}</span>
      </div>

      {/* 🔥 DESCONTO */}
      {desconto > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Desconto</span>
          <span>- {formatarMoeda(desconto)}</span>
        </div>
      )}

      {/* 🔥 TOTAL FINAL */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: "bold",
          fontSize: "14px"
        }}
      >
        <span>Total</span>
        <span>{formatarMoeda(venda.total)}</span>
      </div>

      <hr />

      {/* 🔥 PAGAMENTO */}
      <p style={{ margin: 0 }}>
        Pagamento: {venda.pagamento}
      </p>

      {/* 🔥 OPERADOR */}
      {operador && (
        <p style={{ margin: 0, fontSize: "12px" }}>
          Operador: {operador}
        </p>
      )}

      {/* 🔥 DATA */}
      <p style={{ fontSize: "12px" }}>
        {new Date().toLocaleString()}
      </p>

      <hr />

      <p style={{ fontSize: "12px" }}>
        Obrigado pela preferência!
      </p>
    </div>
  );
}