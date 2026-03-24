from pydantic import BaseModel
from decimal import Decimal
from typing import Optional

class ProdutoCreate(BaseModel):
    codigo_barras: str | None = None
    nome: str
    preco_venda: Decimal
    preco_custo: Decimal | None = None
    estoque: Decimal = 0
    estoque_minimo: Decimal = 0


class ProdutoResponse(BaseModel):
    id: int
    codigo_barras: str | None
    nome: str
    preco_venda: Decimal
    preco_custo: Decimal | None
    estoque: Decimal
    estoque_minimo: Decimal
    ativo: bool

    class Config:
        from_attributes = True

class ProdutoUpdate(BaseModel):
    nome: Optional[str] = None
    codigo_barras: Optional[str] = None
    preco_venda: Optional[float] = None
    preco_custo: Optional[float] = None
    estoque_minimo: Optional[float] = None
    ativo: Optional[bool] = None