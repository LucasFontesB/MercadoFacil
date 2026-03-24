from sqlalchemy import Column, Integer, String, Numeric, Boolean, ForeignKey, TIMESTAMP, func
from app.database import Base

class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)

    codigo_barras = Column(String(50))
    nome = Column(String(200), nullable=False)

    preco_venda = Column(Numeric(10, 2), nullable=False)
    preco_custo = Column(Numeric(10, 2))

    estoque = Column(Numeric(10, 3), default=0)
    estoque_minimo = Column(Numeric(10, 3), default=0)

    ativo = Column(Boolean, default=True)
    data_criacao = Column(TIMESTAMP, server_default=func.now())