import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import pickle
import os

# Path to save trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "demand_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "demand_scaler.pkl")

def prepare_features(products):
    # Converting product list to feature matrix
    # Features: cost_price, selling_price, stock_available, units_sold, customer_rating
    X = []
    for p in products:
        X.append([
            float(p.cost_price),
            float(p.selling_price),
            float(p.stock_available),
            float(p.units_sold),
            float(p.customer_rating) if p.customer_rating else 3.0,
        ])
    return np.array(X)


def train_model(db):
    # Now we Train Linear Regression on existing product data 
    from models import Product

    products = db.query(Product).all()

    if len(products) < 3:
        print("Not enough data to train model")
        return None, None

    X = prepare_features(products)

    y = np.array([
        float(p.demand_forecast) if p.demand_forecast else float(p.units_sold)
        for p in products
    ])

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train model
    model = LinearRegression()
    model.fit(X_scaled, y)

    # Save model and scaler
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    with open(SCALER_PATH, 'wb') as f:
        pickle.dump(scaler, f)

    print(f"ML model trained on {len(products)} products")
    print(f"  R² score: {model.score(X_scaled, y):.4f}")
    return model, scaler


def load_model():
    #Load trained model from disk 
    if not os.path.exists(MODEL_PATH):
        return None, None
    with open(MODEL_PATH, 'rb') as f: #= basically saving the model in disk using pickle library
        model = pickle.load(f)
    with open(SCALER_PATH, 'rb') as f:
        scaler = pickle.load(f)
    return model, scaler


def predict_demand(product, model, scaler):
    # Now we Predict demand for a single product - 
    if model is None or scaler is None:
        return None

    features = np.array([[
        float(product.cost_price),
        float(product.selling_price),
        float(product.stock_available),
        float(product.units_sold),
        float(product.customer_rating) if product.customer_rating else 3.0,
    ]])

    features_scaled = scaler.transform(features)
    prediction = model.predict(features_scaled)[0]

    # here we make sure prediction is +ve 
    return max(0, round(prediction, 2))