from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.schemas import SMSSendRequest, SMSVerifyRequest, SMSResponse
from app.services.sms_service import sms_service

router = APIRouter()


@router.post("/send", response_model=SMSResponse)
async def send_sms_code(
    request: SMSSendRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Send SMS verification code to phone number
    
    - **phone**: Phone number (format: +48xxxxxxxxx)
    """
    result = await sms_service.send_verification_code(request.phone, db)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return SMSResponse(
        success=True,
        message=result["message"]
    )


@router.post("/verify", response_model=SMSResponse)
async def verify_sms_code(
    request: SMSVerifyRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify SMS verification code
    
    - **phone**: Phone number
    - **code**: Verification code (6 digits)
    """
    result = await sms_service.verify_code(request.phone, request.code, db)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return SMSResponse(
        success=True,
        message=result["message"]
    )
