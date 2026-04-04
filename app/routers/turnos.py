from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date, datetime
from typing import Optional

from app.database import get_db
from app.models.turno import Turno
from app.models.venda import Venda
from app.models.usuarios import Usuario
from app.schemas.turno_schema import TurnoAbertura, TurnoFechamento
from app.core.auth import get_current_user
from app.core.security import require_admin

router = APIRouter(prefix="/turnos", tags=["Turnos"])


# ── Status do turno atual do operador ────────────────────────────────────────
@router.get("/meu-turno")
def meu_turno(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Retorna o turno aberto do usuário logado, se existir.
    O PDV chama esse endpoint ao carregar para saber se pode operar.
    """
    turno = db.query(Turno).filter(
        Turno.empresa_id == user["empresa_id"],
        Turno.usuario_id == user["user_id"],
        Turno.status     == "aberto"
    ).first()

    if not turno:
        return {"turno": None, "aberto": False}

    # Total de vendas do turno
    vendas = db.query(
        func.count(Venda.id).label("num_vendas"),
        func.coalesce(func.sum(Venda.total), 0).label("total_vendas")
    ).filter(Venda.turno_id == turno.id).first()

    return {
        "aberto": True,
        "turno": {
            "id":             turno.id,
            "saldo_abertura": float(turno.saldo_abertura),
            "aberto_em":      turno.aberto_em.isoformat(),
            "num_vendas":     vendas.num_vendas,
            "total_vendas":   float(vendas.total_vendas),
        }
    }


# ── Abrir turno ───────────────────────────────────────────────────────────────
@router.post("/abrir")
def abrir_turno(
    dados: TurnoAbertura,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    # Verifica se já tem turno aberto
    turno_aberto = db.query(Turno).filter(
        Turno.empresa_id == user["empresa_id"],
        Turno.usuario_id == user["user_id"],
        Turno.status     == "aberto"
    ).first()

    if turno_aberto:
        raise HTTPException(status_code=400, detail="Você já possui um turno aberto")

    turno = Turno(
        empresa_id=user["empresa_id"],
        usuario_id=user["user_id"],
        saldo_abertura=dados.saldo_abertura,
        status="aberto"
    )

    db.add(turno)
    db.commit()
    db.refresh(turno)

    return {
        "mensagem":       "Turno aberto com sucesso",
        "turno_id":       turno.id,
        "saldo_abertura": float(turno.saldo_abertura),
        "aberto_em":      turno.aberto_em.isoformat(),
    }


# ── Fechar turno ──────────────────────────────────────────────────────────────
@router.post("/fechar")
def fechar_turno(
    dados: TurnoFechamento,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    turno = db.query(Turno).filter(
        Turno.empresa_id == user["empresa_id"],
        Turno.usuario_id == user["user_id"],
        Turno.status     == "aberto"
    ).first()

    if not turno:
        raise HTTPException(status_code=404, detail="Nenhum turno aberto encontrado")

    # Resumo do turno antes de fechar
    vendas = db.query(
        func.count(Venda.id).label("num_vendas"),
        func.coalesce(func.sum(Venda.total), 0).label("total_vendas")
    ).filter(Venda.turno_id == turno.id).first()

    turno.saldo_fechamento = dados.saldo_fechamento
    turno.fechado_em       = datetime.now()
    turno.status           = "fechado"

    db.commit()

    return {
        "mensagem":         "Turno fechado com sucesso",
        "turno_id":         turno.id,
        "saldo_abertura":   float(turno.saldo_abertura),
        "saldo_fechamento": float(turno.saldo_fechamento),
        "aberto_em":        turno.aberto_em.isoformat(),
        "fechado_em":       turno.fechado_em.isoformat(),
        "num_vendas":       vendas.num_vendas,
        "total_vendas":     float(vendas.total_vendas),
    }


# ── Listar turnos (admin) ─────────────────────────────────────────────────────
@router.get("/")
def listar_turnos(
    data_inicio:  Optional[date] = Query(default=None),
    data_fim:     Optional[date] = Query(default=None),
    usuario_id:   Optional[int]  = Query(default=None),
    status:       Optional[str]  = Query(default=None),
    limite:       int            = Query(default=50, le=200),
    db: Session = Depends(get_db),
    user=Depends(require_admin)
):
    query = (
        db.query(Turno, Usuario.nome.label("usuario_nome"))
        .join(Usuario, Usuario.id == Turno.usuario_id)
        .filter(Turno.empresa_id == user["empresa_id"])
    )

    if data_inicio:
        query = query.filter(Turno.aberto_em >= datetime.combine(data_inicio, datetime.min.time()))
    if data_fim:
        query = query.filter(Turno.aberto_em <= datetime.combine(data_fim, datetime.max.time()))
    if usuario_id:
        query = query.filter(Turno.usuario_id == usuario_id)
    if status:
        query = query.filter(Turno.status == status)

    resultados = query.order_by(desc(Turno.aberto_em)).limit(limite).all()

    turnos = []
    for turno, usuario_nome in resultados:
        # Vendas do turno
        vendas = db.query(
            func.count(Venda.id).label("num_vendas"),
            func.coalesce(func.sum(Venda.total), 0).label("total_vendas")
        ).filter(Venda.turno_id == turno.id).first()

        turnos.append({
            "id":               turno.id,
            "usuario_id":       turno.usuario_id,
            "usuario_nome":     usuario_nome,
            "saldo_abertura":   float(turno.saldo_abertura),
            "saldo_fechamento": float(turno.saldo_fechamento) if turno.saldo_fechamento else None,
            "aberto_em":        turno.aberto_em.isoformat(),
            "fechado_em":       turno.fechado_em.isoformat() if turno.fechado_em else None,
            "status":           turno.status,
            "num_vendas":       vendas.num_vendas,
            "total_vendas":     float(vendas.total_vendas),
        })

    return turnos