from pydantic import BaseModel
from typing import List, Optional, Union, Any
from datetime import datetime


class OrderResponse(BaseModel):
    id: int
    phone: str
    address: str
    description: str
    selected_date: str
    photos: Union[List[str], dict, Any] = []
    status: str
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    phone: str
    address: str
    description: str
    selected_date: str


class OrderUpdate(BaseModel):
    status: str


class SMSResponse(BaseModel):
    success: bool
    message: str


class SMSSendRequest(BaseModel):
    phone: str


class SMSVerifyRequest(BaseModel):
    phone: str
    code: str


class AvailableDateResponse(BaseModel):
    id: int
    date: str
    is_available: bool
    
    class Config:
        from_attributes = True


class AvailableDateCreate(BaseModel):
    date: str
    is_available: bool = True


class MessageResponse(BaseModel):
    message: str
