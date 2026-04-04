from decimal import Decimal
from pydantic import BaseModel
from typing import Optional


class MovimentacaoCreate(BaseModel):
    produto_id:          int
    tipo:                str
    quantidade:          Decimal
    referencia:          Optional[str]   = None
    valor_unitario:      Optional[Decimal] = None  # usado para calcular despesa na entrada
    registrar_despesa:   Optional[bool]  = False  # entrada → cria despesa
    registrar_receita:   Optional[bool]  = False  # saída → cria receita no caixa


class MovimentacaoResponse(BaseModel):
    id:          int
    produto_id:  int
    tipo:        str
    quantidade:  float
    referencia:  Optional[str]

    class Config:
        from_attributes = True