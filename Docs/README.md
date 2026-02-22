# Price Optimization Tool

A modern full-stack implementation for product management, demand forecasting, and pricing strategy optimization.

## 🚀 Key Features
- **Product Management**: Full CRUD operations with **Fuzzy Search** (via `Fuse.js`) and categorical filtering.
- **ML-Powered Demand Forecasting**: Accurate predictions using a Linear Regression model trained on real product data.
- **Price Optimization**: Intelligent price recommendations based on ML-forecasted demand factors.
- **User Verification**: Secure account activation via SendGrid email verification.
- **Dynamic RBAC**: Table-based Role-Based Access Control allowing live permission management.
- **Premium UI**: Responsive React dashboard with role-aware interfaces and data visualizations.

## 🛠 Tech Stack
- **Frontend**: React (Vite), Axios, Chart.js, Vanilla CSS.
- **Backend**: FastAPI, SQLAlchemy (PostgreSQL), Pydantic, Scikit-learn (ML), SendGrid (Email).
- **Security**: JWT tokens, Bcrypt, Email Verification flow.

## 📁 Project Structure
- `/Backend`: FastAPI source code, database models, and API routes.
- `/frontend`: React source code, components, and pages.
- `/Docs`: Technical documentation, diagrams, and assessment details.

## ⚡ Quick Start

### Backend Setup
1. Navigate to `/Backend`.
2. Install dependencies: `pip install -r requirements.txt`.
3. Setup `.env` with `DATABASE_URL`, `SECRET_KEY`, `ALLOWED_ORIGINS`, `SENDGRID_API_KEY`, and `SENDGRID_FROM_EMAIL`.
4. Run: `uvicorn main:app --reload`.

### Frontend Setup
1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Run: `npm run dev`.

---
*For detailed implementation details, architecture diagrams, and API references, see the [Technical Documentation](./Technical_Documentation.md).*
