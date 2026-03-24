from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
from app.core.config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id = payload.get("user_id")
        empresa_id = payload.get("empresa_id")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")

        return {
            "user_id": user_id,
            "empresa_id": empresa_id
        }

    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

def criar_token(data: dict):

    dados = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    dados.update({"exp": expire})

    token = jwt.encode(dados, SECRET_KEY, algorithm=ALGORITHM)

    return token