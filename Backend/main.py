from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
import os
from dotenv import load_dotenv
from routes import auth_routes, product_routes, user_routes

load_dotenv()

models.Base.metadata.create_all(bind=engine)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app = FastAPI(title="Price Optimization Tool", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(product_routes.router)
app.include_router(user_routes.router)

@app.get("/", include_in_schema=False)
def root():
    return {"message": "Price Optimization Tool API", "docs": "/docs"}