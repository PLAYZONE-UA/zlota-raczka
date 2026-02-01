from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.core.database import get_db
from app.models.models import AvailableDate
from app.schemas.schemas import AvailableDateResponse, AvailableDateCreate, MessageResponse
from app.utils.validators import validate_date_format
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/available", response_model=list[AvailableDateResponse])
async def get_available_dates(db: AsyncSession = Depends(get_db)):
    """Get all available dates from today onwards"""
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        
        stmt = select(AvailableDate).where(
            and_(AvailableDate.date >= today, AvailableDate.is_available == True)
        ).order_by(AvailableDate.date)
        
        result = await db.execute(stmt)
        dates = result.scalars().all()
        return dates
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all", response_model=list[AvailableDateResponse])
async def get_all_dates(db: AsyncSession = Depends(get_db)):
    """Get all dates (admin view)"""
    try:
        stmt = select(AvailableDate).order_by(AvailableDate.date)
        result = await db.execute(stmt)
        dates = result.scalars().all()
        return dates
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=AvailableDateResponse)
async def create_date(
    date_data: AvailableDateCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new available date"""
    try:
        # Validate date format
        if not validate_date_format(date_data.date):
            raise HTTPException(status_code=400, detail="Невалідний формат дати (YYYY-MM-DD)")
        
        # Check if date already exists
        stmt = select(AvailableDate).where(AvailableDate.date == date_data.date)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Дата вже існує")
        
        date = AvailableDate(
            date=date_data.date,
            is_available=date_data.is_available
        )
        
        db.add(date)
        await db.commit()
        await db.refresh(date)
        
        return date
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{date_id}", response_model=AvailableDateResponse)
async def update_date(
    date_id: int,
    date_data: AvailableDateCreate,
    db: AsyncSession = Depends(get_db)
):
    """Update date availability"""
    try:
        stmt = select(AvailableDate).where(AvailableDate.id == date_id)
        result = await db.execute(stmt)
        date = result.scalar_one_or_none()
        
        if not date:
            raise HTTPException(status_code=404, detail="Дата не знайдена")
        
        date.is_available = date_data.is_available
        
        await db.commit()
        await db.refresh(date)
        
        return date
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{date_id}", response_model=MessageResponse)
async def delete_date(date_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a date"""
    try:
        stmt = select(AvailableDate).where(AvailableDate.id == date_id)
        result = await db.execute(stmt)
        date = result.scalar_one_or_none()
        
        if not date:
            raise HTTPException(status_code=404, detail="Дата не знайдена")
        
        await db.delete(date)
        await db.commit()
        
        return MessageResponse(message="Дата видалена")
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bulk", response_model=MessageResponse)
async def bulk_create_dates(
    start_date: str,
    end_date: str,
    db: AsyncSession = Depends(get_db)
):
    """Bulk create dates from range (excluding weekends)"""
    try:
        if not validate_date_format(start_date) or not validate_date_format(end_date):
            raise HTTPException(status_code=400, detail="Невалідний формат дати")
        
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        
        created_count = 0
        current = start
        
        while current <= end:
            # Skip weekends
            if current.weekday() < 5:
                date_str = current.strftime("%Y-%m-%d")
                
                # Check if exists
                stmt = select(AvailableDate).where(AvailableDate.date == date_str)
                result = await db.execute(stmt)
                if not result.scalar_one_or_none():
                    date = AvailableDate(date=date_str, is_available=True)
                    db.add(date)
                    created_count += 1
            
            current += timedelta(days=1)
        
        await db.commit()
        
        return MessageResponse(message=f"Створено {created_count} дат")
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
