from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional


class TurnoAbertura(BaseModel):
    saldo_abertura: Decimal = Decimal("0")


class TurnoFechamento(BaseModel):
    saldo_fechamento: Decimal = Decimal("0")


class TurnoResponse(BaseModel):
    id:               int
    usuario_id:       int
    usuario_nome:     Optional[str] = None
    saldo_abertura:   Decimal
    saldo_fechamento: Optional[Decimal]
    aberto_em:        datetime
    fechado_em:       Optional[datetime]
    status:           str
    total_vendas:     Optional[float] = None
    num_vendas:       Optional[int]   = None

    class Config:
        from_attributes = True