from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from app.core.database import get_db
from app.models.models import Order, SMSVerification
from app.schemas.schemas import OrderResponse, OrderCreate, OrderUpdate, MessageResponse
from app.services.file_service import save_multiple_files, delete_multiple_files, validate_file
from app.services.telegram_service import notify_new_order, notify_status_change
from app.utils.validators import validate_phone_number, validate_text_length
from datetime import datetime
from typing import List

router = APIRouter()


@router.post("/orders", response_model=OrderResponse)
async def create_order(
    phone: str = Form(...),
    address: str = Form(...),
    description: str = Form(...),
    selected_date: str = Form(...),
    files: List[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_db)
):
    """Create a new order"""
    try:
        # Validate phone
        if not validate_phone_number(phone):
            raise HTTPException(status_code=400, detail="Неправильний номер телефону")
        
        # Check SMS verification
        stmt = select(SMSVerification).where(
            and_(SMSVerification.phone == phone, SMSVerification.is_verified == True)
        )
        result = await db.execute(stmt)
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Номер телефону не верифіковано")
        
        # Check max 2 orders per phone number
        count_stmt = select(func.count()).select_from(Order).where(Order.phone == phone)
        count_result = await db.execute(count_stmt)
        order_count = count_result.scalar()
        if order_count >= 2:
            raise HTTPException(status_code=400, detail="Już masz maksymalnie 2 zamówienia. Skontaktuj się bezpośrednio, aby uzyskać więcej szczegółów.")
        
        # Validate text fields
        if not validate_text_length(address, 5, 255):
            raise HTTPException(status_code=400, detail="Адреса повинна бути від 5 до 255 символів")
        if not validate_text_length(description, 10, 1000):
            raise HTTPException(status_code=400, detail="Опис повинен бути від 10 до 1000 символів")
        
        # Save files
        photo_filenames = []
        if files and len(files) > 0:
            result = await save_multiple_files(files)
            if result.get("success"):
                # Витягуємо тільки імена файлів
                photo_filenames = [f["filename"] for f in result.get("saved_files", [])]
        
        # Create order
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
            await notify_new_order(
                order_id=order.id,
                phone=order.phone,
                address=order.address,
                description=order.description,
                selected_date=order.selected_date,
                photo_paths=order.photos
            )
        except Exception as e:
            print(f"Telegram notification error: {e}")
        
        return order
    
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orders", response_model=List[OrderResponse])
async def get_orders(
    status: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all orders with optional status filter"""
    try:
        query = select(Order)
        if status:
            query = query.where(Order.status == status)
        query = query.order_by(Order.created_at.desc())
        
        result = await db.execute(query)
        orders = result.scalars().all()
        return orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific order"""
    try:
        stmt = select(Order).where(Order.id == order_id)
        result = await db.execute(stmt)
        order = result.scalar_one_or_none()
        
        if not order:
            raise HTTPException(status_code=404, detail="Замовлення не знайдено")
        
        return order
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    update: OrderUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update order status"""
    try:
        stmt = select(Order).where(Order.id == order_id)
        result = await db.execute(stmt)
        order = result.scalar_one_or_none()
        
        if not order:
            raise HTTPException(status_code=404, detail="Замовлення не знайдено")
        
        valid_statuses = ["new", "in_progress", "completed", "cancelled"]
        if update.status not in valid_statuses:
            raise HTTPException(status_code=400, detail="Невалідний статус")
        
        old_status = order.status
        order.status = update.status
        order.updated_at = datetime.now()
        
        await db.commit()
        await db.refresh(order)
        
        # Send Telegram notification
        try:
            await notify_status_change(
                order_id=order.id,
                old_status=old_status,
                new_status=order.status
            )
        except Exception as e:
            print(f"Telegram notification error: {e}")
        
        return order
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/orders/{order_id}", response_model=MessageResponse)
async def delete_order(order_id: int, db: AsyncSession = Depends(get_db)):
    """Delete an order"""
    try:
        stmt = select(Order).where(Order.id == order_id)
        result = await db.execute(stmt)
        order = result.scalar_one_or_none()
        
        if not order:
            raise HTTPException(status_code=404, detail="Замовлення не знайдено")
        
        # Delete files
        if order.photos:
            await delete_multiple_files(order.photos)
        
        # Delete order
        await db.delete(order)
        await db.commit()
        
        return MessageResponse(message="Замовлення видалено")
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/availability/check-dates")
async def get_occupied_dates(db: AsyncSession = Depends(get_db)):
    """Get list of dates with orders (occupied dates)"""
    try:
        # Get count of orders per date
        stmt = select(
            Order.selected_date,
            func.count(Order.id).label('count')
        ).where(
            Order.status != 'cancelled'
        ).group_by(
            Order.selected_date
        )
        
        result = await db.execute(stmt)
        dates_data = result.all()
        
        # Get settings (defaults to 2 orders per day)
        max_orders_per_day = 2
        
        occupied_dates = []
        for date_str, count in dates_data:
            if count >= max_orders_per_day:
                occupied_dates.append(date_str)
        
        return {
            "occupied_dates": occupied_dates,
            "max_orders_per_day": max_orders_per_day
        }
    except Exception as e:
        print(f"Error getting occupied dates: {e}")
        raise HTTPException(status_code=500, detail=str(e))