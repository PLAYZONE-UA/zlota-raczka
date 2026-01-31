"""
Initialize database with sample data

Run this script after first deployment to populate available dates
"""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import Base
from app.models.models import AvailableDate


async def create_tables():
    """Create all database tables"""
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    await engine.dispose()
    print("✅ Database tables created")


async def populate_available_dates():
    """Populate available dates for the next 60 days (excluding weekends)"""
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session_maker() as session:
        today = datetime.now()
        dates_created = 0
        
        for i in range(1, 60):  # Next 60 days
            current_date = today + timedelta(days=i)
            
            # Skip weekends (Saturday = 5, Sunday = 6)
            if current_date.weekday() >= 5:
                continue
            
            date_str = current_date.strftime("%Y-%m-%d")
            
            # Check if date already exists
            stmt = select(AvailableDate).where(AvailableDate.date == date_str)
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if not existing:
                new_date = AvailableDate(
                    date=date_str,
                    is_available=1
                )
                session.add(new_date)
                dates_created += 1
        
        await session.commit()
        print(f"✅ Created {dates_created} available dates")
    
    await engine.dispose()


async def init_database():
    """Initialize database with tables and sample data"""
    print("🚀 Initializing database...")
    
    # Create tables
    await create_tables()
    
    # Populate available dates
    await populate_available_dates()
    
    print("✅ Database initialization complete!")


if __name__ == "__main__":
    asyncio.run(init_database())
