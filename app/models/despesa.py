from sqlalchemy import Column, Integer, String, Numeric, Text, Boolean, ForeignKey, TIMESTAMP, func
from app.database import Base


class DespesaCategoria(Base):
    __tablename__ = "despesa_categorias"

    id         = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    nome       = Column(String(100), nullable=False)
    ativo      = Column(Boolean, default=True)


class Despesa(Base):
    __tablename__ = "despesas"

    id           = Column(Integer, primary_key=True, index=True)
    empresa_id   = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    usuario_id   = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    categoria_id = Column(Integer, ForeignKey("despesa_categorias.id"), nullable=True)
    descricao    = Column(Text, nullable=True)
    valor        = Column(Numeric(10, 2), nullable=False)
    data_despesa = Column(TIMESTAMP, server_default=func.now())
