from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
import random
import string
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.models import SMSVerification


class SMSService:
    def __init__(self):
        self.has_twilio = bool(settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_PHONE_NUMBER)
        if self.has_twilio:
            self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            self.from_number = settings.TWILIO_PHONE_NUMBER
        else:
            self.client = None
            self.from_number = None
    
    def generate_code(self, length: int = 6) -> str:
        """Generate random numeric code"""
        return ''.join(random.choices(string.digits, k=length))
    
    async def send_verification_code(self, phone: str, db: AsyncSession) -> dict:
        """Send SMS verification code to phone number"""
        try:
            # Generate code
            code = self.generate_code(settings.SMS_CODE_LENGTH)
            
            # Calculate expiry time
            expires_at = datetime.utcnow() + timedelta(minutes=settings.SMS_CODE_EXPIRY_MINUTES)
            
            # Check if there's already a verification for this phone
            stmt = select(SMSVerification).where(
                SMSVerification.phone == phone
            )
            
            result = await db.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if existing:
                # Update existing verification record
                existing.code = code
                existing.expires_at = expires_at
                existing.is_verified = False
                await db.commit()
            else:
                # Create new verification record
                verification = SMSVerification(
                    phone=phone,
                    code=code,
                    expires_at=expires_at
                )
                db.add(verification)
                await db.commit()
            
            # Send SMS via Twilio (if configured)
            message_body = f"Twój kod weryfikacyjny: {code}\nKod wygasa za {settings.SMS_CODE_EXPIRY_MINUTES} minut."
            
            if self.has_twilio:
                try:
                    message = self.client.messages.create(
                        body=message_body,
                        from_=self.from_number,
                        to=phone
                    )
                    return {
                        "success": True,
                        "message": "Kod SMS został wysłany",
                        "sid": message.sid
                    }
                except TwilioRestException as e:
                    print(f"Twilio error: {e}")
                    return {
                        "success": False,
                        "message": f"Błąd wysyłania SMS: {str(e)}"
                    }
            else:
                # Development mode - print code to console
                print(f"\n📱 SMS CODE FOR {phone}: {code}\n")
                return {
                    "success": True,
                    "message": f"Kod SMS: {code} (test mode)"
                }
            
        except Exception as e:
            print(f"Error sending SMS: {e}")
            return {
                "success": False,
                "message": "Wystąpił błąd podczas wysyłania SMS"
            }
    
    async def verify_code(self, phone: str, code: str, db: AsyncSession) -> dict:
        """Verify SMS code"""
        try:
            # Find verification record
            stmt = select(SMSVerification).where(
                SMSVerification.phone == phone,
                SMSVerification.code == code,
                SMSVerification.expires_at > datetime.utcnow()
            ).order_by(SMSVerification.created_at.desc())
            
            result = await db.execute(stmt)
            verification = result.scalar_one_or_none()
            
            if not verification:
                return {
                    "success": False,
                    "message": "Nieprawidłowy kod lub kod wygasł"
                }
            
            if verification.is_verified:
                return {
                    "success": True,
                    "message": "Kod już został zweryfikowany"
                }
            
            # Mark as verified
            verification.is_verified = True
            await db.commit()
            
            return {
                "success": True,
                "message": "Kod poprawnie zweryfikowany"
            }
            
        except Exception as e:
            print(f"Error verifying code: {e}")
            return {
                "success": False,
                "message": "Wystąpił błąd podczas weryfikacji kodu"
            }
    
    async def check_verification_status(self, phone: str, db: AsyncSession) -> bool:
        """Check if phone number is verified"""
        try:
            stmt = select(SMSVerification).where(
                SMSVerification.phone == phone,
                SMSVerification.is_verified == True,
                SMSVerification.expires_at > datetime.utcnow()
            ).order_by(SMSVerification.created_at.desc())
            
            result = await db.execute(stmt)
            verification = result.scalar_one_or_none()
            
            return verification is not None
            
        except Exception as e:
            print(f"Error checking verification status: {e}")
            return False


# Singleton instance - DISABLED (SMS removed)
# sms_service = SMSService()
sms_service = None
