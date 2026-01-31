from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.schemas import SMSSendRequest, SMSVerifyRequest, SMSResponse
from app.services.sms_service import sms_service

router = APIRouter()


@router.post("/sms/send", response_model=SMSResponse)
async def send_sms(request: SMSSendRequest, db: AsyncSession = Depends(get_db)):
    """Send SMS verification code to phone number"""
    try:
        result = await sms_service.send_verification_code(request.phone, db)
        if result.get("success"):
            return SMSResponse(success=True, message="Код верифікації надіслано")
        else:
            raise HTTPException(status_code=400, detail=result.get("message", "Помилка"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/sms/verify", response_model=SMSResponse)
async def verify_sms(request: SMSVerifyRequest, db: AsyncSession = Depends(get_db)):
    """Verify SMS code"""
    try:
        result = await sms_service.verify_code(request.phone, request.code, db)
        if result.get("success"):
            return SMSResponse(success=True, message="Номер верифіковано успішно")
        else:
            raise HTTPException(status_code=400, detail=result.get("message", "Помилка"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Aliasy для frontend
@router.post("/sms/send-code", response_model=SMSResponse)
async def send_code(request: SMSSendRequest, db: AsyncSession = Depends(get_db)):
    """Send SMS verification code (alias)"""
    try:
        result = await sms_service.send_verification_code(request.phone, db)
        if result.get("success"):
            return SMSResponse(success=True, message="Код верифікації надіслано")
        else:
            raise HTTPException(status_code=400, detail=result.get("message", "Помилка"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/sms/verify-code", response_model=SMSResponse)
async def verify_code(request: SMSVerifyRequest, db: AsyncSession = Depends(get_db)):
    """Verify SMS code (alias)"""
    try:
        result = await sms_service.verify_code(request.phone, request.code, db)
        if result.get("success"):
            return SMSResponse(success=True, message="Номер верифіковано успішно")
        else:
            raise HTTPException(status_code=400, detail=result.get("message", "Помилка"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
