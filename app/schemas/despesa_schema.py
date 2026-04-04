from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional


# ── Categorias ────────────────────────────────────────────────────────────────

class CategoriaCreate(BaseModel):
    nome: str


class CategoriaResponse(BaseModel):
    id:    int
    nome:  str
    ativo: bool

    class Config:
        from_attributes = True


# ── Despesas ──────────────────────────────────────────────────────────────────

class DespesaCreate(BaseModel):
    categoria_id: Optional[int] = None
    descricao:    Optional[str] = None
    valor:        Decimal


class DespesaResponse(BaseModel):
    id:             int
    categoria_id:   Optional[int]
    categoria_nome: Optional[str] = None   # enriquecido no router
    descricao:      Optional[str]
    valor:          Decimal
    data_despesa:   datetime

    class Config:
        from_attributes = True
