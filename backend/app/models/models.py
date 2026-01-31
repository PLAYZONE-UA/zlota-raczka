from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from datetime import datetime
from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), index=True)
    address = Column(String(255))
    description = Column(String(1000))
    selected_date = Column(String(10))
    photos = Column(JSON, default=[])
    status = Column(String(20), default="new")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class SMSVerification(Base):
    __tablename__ = "sms_verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), unique=True, index=True)
    code = Column(String(6))
    is_verified = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AvailableDate(Base):
    __tablename__ = "available_dates"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), unique=True, index=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
