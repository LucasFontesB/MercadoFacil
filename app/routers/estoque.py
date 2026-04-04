from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional

from app.core.security import require_admin
from app.database import get_db
from app.models.produto import Produto
from app.models.estoque import EstoqueMovimentacao
from app.models.despesa import Despesa
from app.models.caixa import CaixaMovimentacao
from app.schemas.estoque_schema import MovimentacaoCreate, MovimentacaoResponse
from app.core.auth import get_current_user

router = APIRouter(prefix="/estoque", tags=["Estoque"])


@router.post("/movimentar", response_model=MovimentacaoResponse)
def movimentar_estoque(
    dados: MovimentacaoCreate,
    db: Session = Depends(get_db),
    user=Depends(require_admin)
):
    produto = db.query(Produto).filter(
        Produto.id == dados.produto_id,
        Produto.empresa_id == user["empresa_id"]
    ).first()

    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    # ── Regras de movimentação ────────────────────────────────────────────────
    if dados.tipo == "entrada":
        produto.estoque += dados.quantidade

    elif dados.tipo == "saida":
        if produto.estoque < dados.quantidade:
            raise HTTPException(status_code=400, detail="Estoque insuficiente")
        produto.estoque -= dados.quantidade

    elif dados.tipo == "ajuste":
        produto.estoque = dados.quantidade

    else:
        raise HTTPException(status_code=400, detail="Tipo inválido")

    # ── Registra a movimentação ───────────────────────────────────────────────
    movimentacao = EstoqueMovimentacao(
        empresa_id=user["empresa_id"],
        produto_id=produto.id,
        tipo=dados.tipo,
        quantidade=dados.quantidade,
        referencia=dados.referencia
    )
    db.add(movimentacao)

    # ── Entrada com valor → cria despesa ─────────────────────────────────────
    if (
        dados.tipo == "entrada"
        and dados.registrar_despesa
        and dados.valor_unitario
        and dados.valor_unitario > 0
    ):
        valor_total = dados.valor_unitario * dados.quantidade
        despesa = Despesa(
            empresa_id=user["empresa_id"],
            usuario_id=user["user_id"],
            categoria_id=None,
            descricao=f"Compra de estoque: {produto.nome} ({int(dados.quantidade)} un. × R$ {dados.valor_unitario:.2f})",
            valor=valor_total,
        )
        db.add(despesa)

    # ── Saída → cria receita no caixa ─────────────────────────────────────────
    if dados.tipo == "saida" and dados.registrar_receita:
        valor_receita = (produto.preco_venda or Decimal("0")) * dados.quantidade
        if valor_receita > 0:
            receita = CaixaMovimentacao(
                empresa_id=user["empresa_id"],
                usuario_id=user["user_id"],
                tipo="entrada",
                valor=valor_receita,
                forma_pagamento=None,
                descricao=f"Saída de estoque: {produto.nome} ({int(dados.quantidade)} un.)",
            )
            db.add(receita)

    db.commit()
    db.refresh(movimentacao)
    return movimentacao


@router.get("/movimentacoes")
def listar_movimentacoes(
    limite:     int           = Query(default=20, le=100),
    produto_id: Optional[int] = Query(default=None),
    tipo:       Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    user=Depends(require_admin)
):
    query = (
        db.query(EstoqueMovimentacao, Produto.nome.label("produto_nome"))
        .join(Produto, Produto.id == EstoqueMovimentacao.produto_id)
        .filter(EstoqueMovimentacao.empresa_id == user["empresa_id"])
    )

    if produto_id:
        query = query.filter(EstoqueMovimentacao.produto_id == produto_id)
    if tipo:
        query = query.filter(EstoqueMovimentacao.tipo == tipo)

    resultados = (
        query
        .order_by(desc(EstoqueMovimentacao.data_movimentacao))
        .limit(limite)
        .all()
    )

    return [
        {
            "id":           mov.id,
            "produto_id":   mov.produto_id,
            "produto_nome": produto_nome,
            "tipo":         mov.tipo,
            "quantidade":   float(mov.quantidade),
            "referencia":   mov.referencia,
            "created_at":   mov.data_movimentacao,
        }
        for mov, produto_nome in resultados
    ]