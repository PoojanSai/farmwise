# 🌾 FarmWise – Smart Digital Platform for Farmers

FarmWise helps farmers make data-driven agricultural decisions using soil analysis, AI crop recommendations, expert consultation, and a digital marketplace.

## Project Structure

```
farmwise/
├── backend/          # Django + DRF backend
├── frontend/         # React + Vite + Tailwind frontend
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Edit with your DB credentials
python manage.py migrate
python manage.py seed_data   # Load demo data
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Admin Panel: http://localhost:8000/admin

### Demo Credentials
- Farmer: `farmer@farmwise.com` / `farmwise123`
- Admin: `admin@farmwise.com` / `admin123`

## Features
1. Farmer Registration & JWT Authentication
2. Soil Testing System with visualizations
3. AI Crop Recommendation (Random Forest)
4. Expert Consultation Booking
5. Farm Input Marketplace (Krishi Bhandhu Sampadha)
6. Crop Selling (Krishi Vikretha)
7. Supply & Demand Analytics
8. Company Tie-Ups
