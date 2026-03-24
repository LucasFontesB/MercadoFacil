from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user

router = APIRouter(prefix="/teste", tags=["Teste"])

@router.get("/protegido")
def rota_protegida(user=Depends(get_current_user)):
    return {
        "msg": "Acesso liberado 🚀",
        "usuario": user
    }