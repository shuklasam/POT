import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine
import models
from auth import hash_password
import pandas as pd
from decimal import Decimal

models.Base.metadata.create_all(bind=engine)
db = SessionLocal()


DEFAULT_PERMISSIONS = [
    # admin bypasses all permissions
    # supplier
    (models.UserRole.supplier, models.PermissionAction.product_read),
    (models.UserRole.supplier, models.PermissionAction.product_create),
    (models.UserRole.supplier, models.PermissionAction.product_update),
    (models.UserRole.supplier, models.PermissionAction.forecast_view),
    (models.UserRole.supplier, models.PermissionAction.optimize_view),
    # buyer
    (models.UserRole.buyer, models.PermissionAction.product_read),
    (models.UserRole.buyer, models.PermissionAction.forecast_view),
    (models.UserRole.buyer, models.PermissionAction.optimize_view),
    # custom - minimal by default, admin expands as needed
    (models.UserRole.custom, models.PermissionAction.product_read),
]

existing_perms = db.query(models.RolePermission).count()
if existing_perms == 0:
    for role, action in DEFAULT_PERMISSIONS:
        db.add(models.RolePermission(role=role, action=action))
    db.commit()
    print(f"Seeded {len(DEFAULT_PERMISSIONS)} role permissions")
else:
    print(f"Role permissions already seeded ({existing_perms} rows)")

# Admin user
existing_admin = db.query(models.User).filter(models.User.email == "admin@demo.com").first()
if not existing_admin:
    admin = models.User(
        username="Admin",
        email="admin@demo.com",
        hashed_password=hash_password("admin123"),
        role=models.UserRole.admin,
        is_verified=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    admin_id = admin.id
    print("Admin user created: admin@demo.com / admin123")
else:
    admin_id = existing_admin.id
    print("Admin user already exists")

# Product data = from CSV
csv_path = os.path.join(os.path.dirname(__file__), "product_data.csv")
if not os.path.exists(csv_path):
    csv_path = "product_data.csv"

try:
    df = pd.read_csv(csv_path)
    if db.query(models.Product).count() == 0:
        for _, row in df.iterrows():
            db.add(models.Product(
                name=row["name"],
                description=row.get("description"),
                cost_price=Decimal(str(row["cost_price"])),
                selling_price=Decimal(str(row["selling_price"])),
                category=row.get("category"),
                stock_available=int(row.get("stock_available", 0)),
                units_sold=int(row.get("units_sold", 0)),
                customer_rating=Decimal(str(row["customer_rating"])) if pd.notna(row.get("customer_rating")) else None,
                demand_forecast=Decimal(str(row["demand_forecast"])) if pd.notna(row.get("demand_forecast")) else None,
                optimized_price=Decimal(str(row["optimized_price"])) if pd.notna(row.get("optimized_price")) else None,
                created_by=admin_id,
            ))
        db.commit()
        print(f"Seeded {len(df)} products")
    else:
        print("Products already seeded")
except FileNotFoundError:
    print(f"CSV not found, skipping product seed")

db.close()
print("Done")