from pydantic import BaseModel
from decimal import Decimal


class VendaItemCreate(BaseModel):
    produto_id: int
    quantidade: Decimal


class VendaItemResponse(BaseModel):
    id: int
    produto_id: int
    quantidade: Decimal
    preco_unitario: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True