from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.caixa import CaixaMovimentacao
from app.schemas.caixa_schema import CaixaCreate, CaixaResponse
from app.core.auth import get_current_user

router = APIRouter(prefix="/caixa", tags=["Caixa"])


# 💰 Registrar movimentação
@router.post("/", response_model=CaixaResponse)
def movimentar_caixa(
    dados: CaixaCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if dados.tipo not in ["entrada", "saida"]:
        raise HTTPException(status_code=400, detail="Tipo inválido")

    movimentacao = CaixaMovimentacao(
        empresa_id=user["empresa_id"],
        usuario_id=user["user_id"],
        tipo=dados.tipo,
        valor=dados.valor,
        forma_pagamento=dados.forma_pagamento,
        descricao=dados.descricao
    )

    db.add(movimentacao)
    db.commit()
    db.refresh(movimentacao)

    return movimentacao

@router.get("/", response_model=list[CaixaResponse])
def listar_caixa(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(CaixaMovimentacao).filter(
        CaixaMovimentacao.empresa_id == user["empresa_id"]
    ).order_by(CaixaMovimentacao.data_movimentacao.desc()).all()