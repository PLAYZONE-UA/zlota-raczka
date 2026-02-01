from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.schemas.schemas import AvailableDateResponse
from app.models.models import AvailableDate

router = APIRouter()


@router.get("/check-dates", response_model=List[AvailableDateResponse])
async def check_dates(
    db: AsyncSession = Depends(get_db)
):
    """
    Check available dates
    
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
        print(f"Error checking dates: {e}")
        raise HTTPException(status_code=500, detail="Error checking dates")
