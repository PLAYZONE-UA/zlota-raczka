from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

from app.core.config import settings

security = HTTPBasic()


def verify_admin_credentials(credentials: HTTPBasicCredentials = Depends(security)) -> bool:
    """
    Verify admin credentials using HTTP Basic Auth
    """
    correct_username = secrets.compare_digest(credentials.username, settings.ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, settings.ADMIN_PASSWORD)
    
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    return True


def get_current_admin(credentials: HTTPBasicCredentials = Depends(security)) -> dict:
    """
    Get current admin user
    """
    verify_admin_credentials(credentials)
    
    return {
        "username": credentials.username,
        "role": "admin"
    }
