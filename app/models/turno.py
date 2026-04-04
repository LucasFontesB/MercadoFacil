from sqlalchemy import Column, Integer, Numeric, String, ForeignKey, TIMESTAMP, func
from app.database import Base


class Turno(Base):
    __tablename__ = "turnos"

    id               = Column(Integer, primary_key=True, index=True)
    empresa_id       = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    usuario_id       = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    saldo_abertura   = Column(Numeric(10, 2), default=0)
    saldo_fechamento = Column(Numeric(10, 2), nullable=True)
    aberto_em        = Column(TIMESTAMP, server_default=func.now())
    fechado_em       = Column(TIMESTAMP, nullable=True)
    status           = Column(String(20), default="aberto")  # aberto | fechado