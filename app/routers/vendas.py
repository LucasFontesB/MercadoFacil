from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.caixa import CaixaMovimentacao
from app.models.venda import Venda
from app.schemas.venda_schema import VendaCreate, VendaResponse
from app.core.auth import get_current_user

router = APIRouter(prefix="/vendas", tags=["Vendas"])


# 🟢 Criar venda
@router.post("/", response_model=VendaResponse)
def criar_venda(
    dados: VendaCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    venda = Venda(
        empresa_id=user["empresa_id"],
        usuario_id=user["user_id"],
        total=dados.total,
        desconto=dados.desconto,
        forma_pagamento=dados.forma_pagamento
    )

    db.add(venda)
    db.flush()  # 🔥 pega o ID sem commit

    # 💰 registra no caixa
    caixa = CaixaMovimentacao(
        empresa_id=user["empresa_id"],
        usuario_id=user["user_id"],
        tipo="entrada",
        valor=venda.total,
        forma_pagamento=venda.forma_pagamento,
        descricao=f"Venda {venda.id}"
    )

    db.add(caixa)

    # 🔥 commit único (tudo junto)
    db.commit()
    db.refresh(venda)

    return venda


# 🔵 Listar vendas (por empresa)
@router.get("/", response_model=list[VendaResponse])
def listar_vendas(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(Venda).filter(
        Venda.empresa_id == user["empresa_id"]
    ).all()