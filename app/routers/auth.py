from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.empresa import Empresa
from app.models.usuarios import Usuario
from app.schemas.auth_schema import LoginRequest

from app.core.security import verificar_senha
from app.core.auth import criar_token, get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login")
def login(dados: LoginRequest, db: Session = Depends(get_db)):

    usuario = db.query(Usuario).filter(Usuario.login == dados.login).first()

    if not usuario:
        raise HTTPException(status_code=401, detail="Login inválido")

    # ← verifica se está ativo
    if not usuario.ativo:
        raise HTTPException(status_code=403, detail="Usuário inativo")

    if not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Senha inválida")

    empresa = db.query(Empresa).filter(Empresa.id == usuario.empresa_id).first()

    token = criar_token({
        "user_id":    usuario.id,
        "empresa_id": usuario.empresa_id,
        "tipo":       usuario.tipo
    })

    return {
        "access_token": token,
        "token_type":   "bearer",
        "usuario": {
            "id":           usuario.id,
            "nome":         usuario.nome,
            "login":        usuario.login,
            "tipo":         usuario.tipo,
            "empresa_id":   usuario.empresa_id,
            "empresa_nome": empresa.nome if empresa else None,
            "empresa_logo": empresa.logo_url if empresa else None,  # ← corrigido
        }
    }

@router.get("/me")
def me(user=Depends(get_current_user), db: Session = Depends(get_db)):
    empresa = db.query(Empresa).filter(Empresa.id == user["empresa_id"]).first()

    return {
        "user_id": user["user_id"],
        "empresa_id": user["empresa_id"],
        "tipo": user["tipo"],
        "empresa_nome": empresa.nome,
        "empresa_logo": empresa.logo_url
    }