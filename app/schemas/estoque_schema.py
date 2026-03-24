from pydantic import BaseModel
from decimal import Decimal

class MovimentacaoCreate(BaseModel):
    produto_id: int
    tipo: str  # entrada | saida | ajuste
    quantidade: Decimal
    referencia: str | None = None


class MovimentacaoResponse(BaseModel):
    id: int
    produto_id: int
    tipo: str
    quantidade: Decimal
    referencia: str | None

    class Config:
        from_attributes = True