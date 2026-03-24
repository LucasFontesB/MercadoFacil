from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, TIMESTAMP, func
from app.database import Base

class EstoqueMovimentacao(Base):
    __tablename__ = "estoque_movimentacoes"

    id = Column(Integer, primary_key=True, index=True)

    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)

    tipo = Column(String(20), nullable=False)  # entrada / saida / ajuste
    quantidade = Column(Numeric(10, 3), nullable=False)

    referencia = Column(String(100))
    data_movimentacao = Column(TIMESTAMP, server_default=func.now())