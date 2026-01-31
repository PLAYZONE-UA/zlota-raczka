from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import json
import os

from app.core.database import get_db
from app.core.config import settings
from app.schemas.schemas import OrderResponse, OrderUpdate, MessageResponse
from app.models.models import Order
from app.services.sms_service import sms_service
from app.services.file_service import file_service
from app.services.telegram_service import telegram_service

router = APIRouter()


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    phone: str = Form(...),
    address: str = Form(...),
    description: str = Form(...),
    selected_date: str = Form(...),
    sms_code: str = Form(...),
    photos: List[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Create new order
    
    - **phone**: Phone number (verified through SMS)
    - **address**: Address (min. 5 characters)
    - **description**: Problem description (min. 10 characters)
    - **selected_date**: Selected date (YYYY-MM-DD)
    - **sms_code**: SMS verification code
    - **photos**: Photos (optional, max 5)
    """
    # Validate SMS verification
    is_verified = await sms_service.check_verification_status(phone, db)
    if not is_verified:
        raise HTTPException(
            status_code=400,
            detail="Phone number is not verified. Please verify through SMS first."
        )
    
    # Validate input lengths
    if len(address) < 5:
        raise HTTPException(status_code=400, detail="Address is too short (min. 5 characters)")
    
    if len(description) < 10:
        raise HTTPException(status_code=400, detail="Description is too short (min. 10 characters)")
    
    # Handle photo uploads
    photo_filenames = []
    photo_paths = []
    
    if photos and len(photos) > 0:
        # Check max photos limit
        if len(photos) > settings.MAX_PHOTOS_PER_ORDER:
            raise HTTPException(
                status_code=400,
                detail=f"Too many photos. Maximum: {settings.MAX_PHOTOS_PER_ORDER}"
            )
        
        # Save photos
        upload_result = await file_service.save_multiple_files(photos, settings.MAX_PHOTOS_PER_ORDER)
        
        if not upload_result["success"]:
            raise HTTPException(status_code=400, detail=upload_result.get("error", "Error saving photos"))
        
        for saved_file in upload_result["saved_files"]:
            photo_filenames.append(saved_file["filename"])
            photo_paths.append(saved_file["filepath"])
            
            # Optimize images
            file_service.optimize_image(saved_file["filepath"])
    
    # Create order in database
    order = Order(
        phone=phone,
        address=address,
        description=description,
        selected_date=selected_date,
        photos=photo_filenames,
        status="new"
    )
    
    db.add(order)
    await db.commit()
    await db.refresh(order)
    
    # Send Telegram notification
    try:
        await telegram_service.notify_new_order(
            order_id=order.id,
            phone=phone,
            address=address,
            description=description,
            selected_date=selected_date,
            photo_paths=photo_paths
        )
    except Exception as e:
        print(f"Failed to send Telegram notification: {e}")
        # Don't fail the order creation if Telegram fails
    
    return order


@router.get("", response_model=List[OrderResponse])
async def get_all_orders(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all orders (for admin)
    
    - **status**: Filter by status (optional)
    """
    try:
        if status:
            stmt = select(Order).where(Order.status == status).order_by(Order.created_at.desc())
        else:
            stmt = select(Order).order_by(Order.created_at.desc())
        
        result = await db.execute(stmt)
        orders = result.scalars().all()
        
        return orders
        
    except Exception as e:
        print(f"Error fetching orders: {e}")
        raise HTTPException(status_code=500, detail="Error fetching orders")


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get order by ID
    """
    stmt = select(Order).where(Order.id == order_id)
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order


@router.patch("/{order_id}/status", response_model=MessageResponse)
async def update_order_status(
    order_id: int,
    order_update: OrderUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update order status
    
    - **status**: new | in_progress | completed | cancelled
    """
    # Get order
    stmt = select(Order).where(Order.id == order_id)
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    old_status = order.status
    new_status = order_update.status
    
    # Update status
    order.status = new_status
    await db.commit()
    
    # Send Telegram notification about status change
    try:
        await telegram_service.notify_status_change(
            order_id=order_id,
            old_status=old_status,
            new_status=new_status
        )
    except Exception as e:
        print(f"Failed to send Telegram notification: {e}")
    
    return MessageResponse(
        message=f"Order status updated to: {new_status}",
        success=True
    )


@router.delete("/{order_id}", response_model=MessageResponse)
async def delete_order(
    order_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete order (optional)
    """
    # Get order
    stmt = select(Order).where(Order.id == order_id)
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Delete photos from disk
    if order.photos:
        photo_paths = [os.path.join(settings.UPLOAD_DIR, "photos", filename) for filename in order.photos]
        file_service.delete_multiple_files(photo_paths)
    
    # Delete order from database
    await db.delete(order)
    await db.commit()
    
    return MessageResponse(
        message="Order has been deleted",
        success=True
    )
