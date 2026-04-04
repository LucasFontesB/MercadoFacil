from sqlalchemy import Column, Integer, Numeric, String, ForeignKey, TIMESTAMP, func
from app.database import Base


class Venda(Base):
    __tablename__ = "vendas"

    id              = Column(Integer, primary_key=True, index=True)
    empresa_id      = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    usuario_id      = Column(Integer, ForeignKey("usuarios.id"))
    turno_id        = Column(Integer, ForeignKey("turnos.id"), nullable=True)  # ← adiciona
    data_venda      = Column(TIMESTAMP, server_default=func.now())
    total           = Column(Numeric(10, 2), nullable=False)
    desconto        = Column(Numeric(10, 2), default=0)
    forma_pagamento = Column(String(30))