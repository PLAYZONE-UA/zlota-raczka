from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.api.routes import sms, orders, dates, availability

# Create app
app = FastAPI(
    title="Handyman Booking API",
    description="API для сервісу замовлення послуг дизайнера",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешить все origins для отладки
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(sms.router, prefix="/api", tags=["SMS"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(dates.router, prefix="/api/dates", tags=["Dates"])
app.include_router(availability.router, prefix="/api/availability", tags=["Availability"])

# Create uploads directory if it doesn't exist
os.makedirs("uploads/photos", exist_ok=True)
os.makedirs("uploads/temp", exist_ok=True)

# Mount static files
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
async def root():
    return {"message": "Handyman Booking API", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
