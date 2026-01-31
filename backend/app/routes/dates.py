from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.schemas.schemas import AvailableDateResponse, AvailableDateCreate, MessageResponse
from app.models.models import AvailableDate

router = APIRouter()


@router.get("/available", response_model=List[AvailableDateResponse])
async def get_available_dates(
    db: AsyncSession = Depends(get_db)
):
    """
    Get all available dates
    
    Returns only dates that are:
    - available (is_available = 1)
    - in the future
    """
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        
        stmt = select(AvailableDate).where(
            AvailableDate.is_available == 1,
            AvailableDate.date >= today
        ).order_by(AvailableDate.date)
        
        result = await db.execute(stmt)
        dates = result.scalars().all()
        
        # Convert to response format
        response = []
        for date in dates:
            response.append(AvailableDateResponse(
                id=date.id,
                date=date.date,
                is_available=bool(date.is_available)
            ))
        
        return response
        
    except Exception as e:
        print(f"Error fetching available dates: {e}")
        raise HTTPException(status_code=500, detail="Error fetching dates")


@router.get("/all", response_model=List[AvailableDateResponse])
async def get_all_dates(
    db: AsyncSession = Depends(get_db)
):
    """
    Get all dates (for admin)
    
    Returns all dates regardless of availability
    """
    try:
        stmt = select(AvailableDate).order_by(AvailableDate.date.desc())
        result = await db.execute(stmt)
        dates = result.scalars().all()
        
        response = []
        for date in dates:
            response.append(AvailableDateResponse(
                id=date.id,
                date=date.date,
                is_available=bool(date.is_available)
            ))
        
        return response
        
    except Exception as e:
        print(f"Error fetching all dates: {e}")
        raise HTTPException(status_code=500, detail="Error fetching dates")


@router.post("", response_model=AvailableDateResponse, status_code=201)
async def create_available_date(
    date_data: AvailableDateCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create available date (for admin)
    
    - **date**: Date in format YYYY-MM-DD
    - **is_available**: Is date available (default: true)
    """
    try:
        # Check if date already exists
        stmt = select(AvailableDate).where(AvailableDate.date == date_data.date)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Date already exists. Use PATCH to update."
            )
        
        # Validate date format and that it's in the future
        try:
            date_obj = datetime.strptime(date_data.date, "%Y-%m-%d")
            if date_obj.date() < datetime.now().date():
                raise HTTPException(
                    status_code=400,
                    detail="Cannot add dates from the past"
                )
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid date format. Use YYYY-MM-DD"
            )
        
        # Create new date
        new_date = AvailableDate(
            date=date_data.date,
            is_available=1 if date_data.is_available else 0
        )
        
        db.add(new_date)
        await db.commit()
        await db.refresh(new_date)
        
        return AvailableDateResponse(
            id=new_date.id,
            date=new_date.date,
            is_available=bool(new_date.is_available)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating date: {e}")
        raise HTTPException(status_code=500, detail="Error creating date")


@router.patch("/{date_id}", response_model=AvailableDateResponse)
async def update_available_date(
    date_id: int,
    is_available: bool,
    db: AsyncSession = Depends(get_db)
):
    """
    Update date availability
    
    - **date_id**: Date ID
    - **is_available**: New availability value
    """
    try:
        stmt = select(AvailableDate).where(AvailableDate.id == date_id)
        result = await db.execute(stmt)
        date = result.scalar_one_or_none()
        
        if not date:
            raise HTTPException(status_code=404, detail="Date not found")
        
        date.is_available = 1 if is_available else 0
        await db.commit()
        await db.refresh(date)
        
        return AvailableDateResponse(
            id=date.id,
            date=date.date,
            is_available=bool(date.is_available)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating date: {e}")
        raise HTTPException(status_code=500, detail="Error updating date")


@router.delete("/{date_id}", response_model=MessageResponse)
async def delete_available_date(
    date_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete available date (for admin)
    """
    try:
        stmt = select(AvailableDate).where(AvailableDate.id == date_id)
        result = await db.execute(stmt)
        date = result.scalar_one_or_none()
        
        if not date:
            raise HTTPException(status_code=404, detail="Date not found")
        
        await db.delete(date)
        await db.commit()
        
        return MessageResponse(
            message="Date has been deleted",
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting date: {e}")
        raise HTTPException(status_code=500, detail="Error deleting date")


@router.post("/bulk", response_model=MessageResponse)
async def create_bulk_dates(
    start_date: str,
    end_date: str,
    skip_weekends: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """
    Create bulk dates (for admin)
    
    - **start_date**: Start date (YYYY-MM-DD)
    - **end_date**: End date (YYYY-MM-DD)
    - **skip_weekends**: Skip weekends (default: true)
    """
    try:
        from datetime import timedelta
        
        # Parse dates
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        
        if start > end:
            raise HTTPException(
                status_code=400,
                detail="Start date must be before end date"
            )
        
        # Generate dates
        created = 0
        skipped = 0
        current = start
        
        while current <= end:
            # Skip weekends if requested
            if skip_weekends and current.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
                skipped += 1
                current += timedelta(days=1)
                continue
            
            date_str = current.strftime("%Y-%m-%d")
            
            # Check if date already exists
            stmt = select(AvailableDate).where(AvailableDate.date == date_str)
            result = await db.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if not existing:
                new_date = AvailableDate(
                    date=date_str,
                    is_available=1
                )
                db.add(new_date)
                created += 1
            else:
                skipped += 1
            
            current += timedelta(days=1)
        
        await db.commit()
        
        return MessageResponse(
            message=f"Created {created} dates, skipped {skipped}",
            success=True
        )
        
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    except Exception as e:
        print(f"Error creating bulk dates: {e}")
        raise HTTPException(status_code=500, detail="Error creating dates")
