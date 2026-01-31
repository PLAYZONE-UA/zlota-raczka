import re
from datetime import datetime
from typing import Optional


def validate_phone_number(phone: str) -> dict:
    """
    Validate phone number format
    
    Accepts formats:
    - +48123456789
    - +48 123 456 789
    - 123456789
    """
    # Remove spaces and dashes
    cleaned = re.sub(r'[\s-]', '', phone)
    
    # Check format
    pattern = r'^\+?[0-9]{9,15}$'
    
    if not re.match(pattern, cleaned):
        return {
            "valid": False,
            "error": "Invalid phone number format"
        }
    
    return {
        "valid": True,
        "cleaned": cleaned
    }


def validate_date_format(date_str: str) -> dict:
    """
    Validate date format (YYYY-MM-DD)
    """
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        
        # Check if date is in the future
        if date_obj.date() < datetime.now().date():
            return {
                "valid": False,
                "error": "Date must be in the future"
            }
        
        return {
            "valid": True,
            "date": date_obj
        }
        
    except ValueError:
        return {
            "valid": False,
            "error": "Invalid date format. Use YYYY-MM-DD"
        }


def validate_text_length(text: str, min_length: int, max_length: int, field_name: str = "Field") -> dict:
    """
    Validate text length
    """
    text_length = len(text.strip())
    
    if text_length < min_length:
        return {
            "valid": False,
            "error": f"{field_name} is too short (min. {min_length} characters)"
        }
    
    if text_length > max_length:
        return {
            "valid": False,
            "error": f"{field_name} is too long (max. {max_length} characters)"
        }
    
    return {"valid": True}


def validate_sms_code(code: str) -> dict:
    """
    Validate SMS code format
    """
    # Remove spaces
    cleaned = code.replace(' ', '')
    
    # Check if numeric and correct length
    if not cleaned.isdigit():
        return {
            "valid": False,
            "error": "Code must consist only of digits"
        }
    
    if len(cleaned) < 4 or len(cleaned) > 10:
        return {
            "valid": False,
            "error": "Code must be between 4 and 10 digits"
        }
    
    return {
        "valid": True,
        "cleaned": cleaned
    }


def validate_order_status(status: str) -> dict:
    """
    Validate order status
    """
    valid_statuses = ["new", "in_progress", "completed", "cancelled"]
    
    if status not in valid_statuses:
        return {
            "valid": False,
            "error": f"Invalid status. Allowed: {', '.join(valid_statuses)}"
        }
    
    return {"valid": True}


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent directory traversal and other issues
    """
    # Remove any path components
    filename = filename.split('/')[-1].split('\\')[-1]
    
    # Remove or replace dangerous characters
    filename = re.sub(r'[^\w\s.-]', '', filename)
    
    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:250] + ('.' + ext if ext else '')
    
    return filename


def validate_file_size(size: int, max_size: int = 5242880) -> dict:
    """
    Validate file size
    
    Default max size: 5MB (5242880 bytes)
    """
    if size > max_size:
        max_mb = max_size / 1024 / 1024
        actual_mb = size / 1024 / 1024
        
        return {
            "valid": False,
            "error": f"File is too large ({actual_mb:.2f}MB). Maximum size: {max_mb}MB"
        }
    
    return {"valid": True}


def validate_file_extension(filename: str, allowed_extensions: list) -> dict:
    """
    Validate file extension
    """
    if not filename or '.' not in filename:
        return {
            "valid": False,
            "error": "File has no extension"
        }
    
    ext = filename.rsplit('.', 1)[1].lower()
    
    if ext not in allowed_extensions:
        return {
            "valid": False,
            "error": f"File type not allowed. Allowed: {', '.join(allowed_extensions)}"
        }
    
    return {
        "valid": True,
        "extension": ext
    }
