from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import empresas
from app.routers import auth
from app.routers import usuarios
from app.routers import teste
from app.routers import produtos
from app.routers import estoque
from app.routers import vendas
from app.routers import venda_itens
from app.routers import caixa

app = FastAPI(title="PDV SaaS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(empresas.router)
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(teste.router)
app.include_router(produtos.router)
app.include_router(estoque.router)
app.include_router(vendas.router)
app.include_router(venda_itens.router)
app.include_router(caixa.router)
