from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routes import auth_routes, product_routes, user_routes

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Price Optimization Tool", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(product_routes.router)
app.include_router(user_routes.router)

@app.get("/")
def root():
    return {"message": "Price Optimization Tool API", "docs": "/docs"}