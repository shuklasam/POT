from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth
from models import PermissionAction

router = APIRouter(prefix="/api/products", tags=["Products"])


# ── Helper: Demand Forecast & Optimized Price Formula ────────

def compute_demand_forecast(units_sold: int, stock_available: int) -> float:
    """
    Demand Forecast Formula:
    seasonal_factor = min(1.5, max(0.8, stock_available / units_sold))
    demand_forecast = units_sold * seasonal_factor

    Logic:
    - High stock relative to sales → strong demand trajectory → factor trends up
    - Low stock relative to sales  → weak demand             → factor trends down
    - Clamped between 0.8 and 1.5 to prevent extreme values
    """
    units = units_sold or 1
    stock = stock_available or 1
    seasonal_factor = min(1.5, max(0.8, stock / units))
    return round(units * seasonal_factor, 2)


def compute_optimized_price(cost_price: float, selling_price: float,
                             demand_forecast: float, avg_demand: float) -> float:
    """
    Optimized Price Formula:
    demand_factor = min(1.5, max(0.8, demand_forecast / avg_demand))
    optimized_price = cost_price + (selling_price - cost_price) * demand_factor

    Logic:
    - demand_factor > 1 → above avg demand → push price UP toward/above selling price
    - demand_factor < 1 → below avg demand → pull price DOWN toward cost price
    - Clamped between 0.8 and 1.5 to stay within a safe margin
    """
    avg = avg_demand or 1
    demand_factor = min(1.5, max(0.8, demand_forecast / avg))
    optimized = cost_price + (selling_price - cost_price) * demand_factor
    return round(optimized, 2)


# ── Public Reads ──────────────────────────────────────────────

@router.get("", response_model=List[schemas.ProductOut])
def list_products(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.Product)
    if search:
        q = q.filter(models.Product.name.ilike(f"%{search}%"))
    if category:
        q = q.filter(models.Product.category == category)
    return q.order_by(models.Product.product_id).all()


@router.get("/forecast", response_model=List[schemas.ForecastItem])
def get_forecast(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_permission(PermissionAction.forecast_view)),
):
    """
    Returns demand_forecast + selling_price for each product.
    Used by frontend to plot demand trajectory line chart.
    Recomputes demand_forecast live using the formula.
    """
    products = db.query(models.Product).order_by(models.Product.product_id).all()

    for p in products:
        p.demand_forecast = compute_demand_forecast(p.units_sold, p.stock_available)

    return products


@router.get("/optimized", response_model=List[schemas.OptimizedItem])
def get_optimized(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_permission(PermissionAction.optimize_view)),
):
    """
    Returns products with optimized_price computed using demand factor.
    demand_factor is relative to avg demand across ALL products.
    High demand products → price pushed up.
    Low demand products  → price pulled toward cost.
    """
    all_products = db.query(models.Product).all()

    # Step 1: compute demand forecast for every product
    forecasts = {
        p.product_id: compute_demand_forecast(p.units_sold, p.stock_available)
        for p in all_products
    }

    # Step 2: compute average demand across all products
    avg_demand = sum(forecasts.values()) / len(forecasts) if forecasts else 1

    # Step 3: apply category filter for response
    q = db.query(models.Product)
    if category:
        q = q.filter(models.Product.category == category)
    products = q.order_by(models.Product.product_id).all()

    # Step 4: compute optimized price per product
    for p in products:
        forecast = forecasts[p.product_id]
        p.demand_forecast = forecast
        p.optimized_price = compute_optimized_price(
            float(p.cost_price),
            float(p.selling_price),
            forecast,
            avg_demand,
        )

    return products


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# ── Writes (auth + permission required) ──────────────────────

@router.post("", response_model=schemas.ProductOut, status_code=201)
def create_product(
    payload: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_permission(PermissionAction.product_create)),
):
    demand_forecast = compute_demand_forecast(payload.units_sold, payload.stock_available)

    # For new product, avg_demand = its own forecast (no context yet)
    optimized_price = compute_optimized_price(
        float(payload.cost_price),
        float(payload.selling_price),
        demand_forecast,
        demand_forecast,  # avg = self, so demand_factor = 1.0 → fair starting price
    )

    product = models.Product(
        **payload.model_dump(),
        demand_forecast=demand_forecast,
        optimized_price=optimized_price,
        created_by=current_user.id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    payload: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_permission(PermissionAction.product_update)),
):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Suppliers can only edit their own products
    if current_user.role == models.UserRole.supplier and product.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Suppliers can only edit their own products")

    for key, val in payload.model_dump(exclude_unset=True).items():
        setattr(product, key, val)

    # Recompute with updated values
    product.demand_forecast = compute_demand_forecast(product.units_sold, product.stock_available)

    all_products = db.query(models.Product).all()
    forecasts = [compute_demand_forecast(p.units_sold, p.stock_available) for p in all_products]
    avg_demand = sum(forecasts) / len(forecasts) if forecasts else 1

    product.optimized_price = compute_optimized_price(
        float(product.cost_price),
        float(product.selling_price),
        float(product.demand_forecast),
        avg_demand,
    )

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_permission(PermissionAction.product_delete)),
):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()