from sqlalchemy import Column, Integer, Numeric, ForeignKey
from app.database import Base


class VendaItem(Base):
    __tablename__ = "venda_itens"

    id = Column(Integer, primary_key=True, index=True)

    venda_id = Column(Integer, ForeignKey("vendas.id", ondelete="CASCADE"), nullable=False)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)

    quantidade = Column(Numeric(10, 3), nullable=False)
    preco_unitario = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)

    preco_custo = Column(Numeric(10, 2), nullable=True)