#!/usr/bin/env python3
"""
Скрипт для видалення всіх замовлень з бази даних
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import delete
from app.core.config import settings
from app.models.models import Order, Base

async def clear_orders():
    """Видалити всі замовлення"""
    # Создаємо engine з DATABASE_URL
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        # Видаляємо всі замовлення
        await session.execute(delete(Order))
        await session.commit()
        print("✅ Всі замовлення видалені успішно!")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(clear_orders())
