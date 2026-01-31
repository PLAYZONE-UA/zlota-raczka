import re
from datetime import datetime


def validate_phone_number(phone: str) -> bool:
    """Validate Polish phone number format"""
    # Accept formats: +48xxx..., +48 xxx xxx xxx, xxx...
    pattern = r'^(\+48\s?)?[0-9\s]{7,15}$'
    return bool(re.match(pattern, phone.strip()))


def validate_date_format(date_str: str) -> bool:
    """Validate date format YYYY-MM-DD and check if it's in the future"""
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        return date_obj.date() > datetime.now().date()
    except ValueError:
        return False


def validate_text_length(text: str, min_length: int = 1, max_length: int = 1000) -> bool:
    """Validate text length"""
    return min_length <= len(text.strip()) <= max_length


def validate_sms_code(code: str) -> bool:
    """Validate SMS code format (4-10 digits)"""
    return bool(re.match(r'^\d{4,10}$', code))


def validate_order_status(status: str) -> bool:
    """Validate order status"""
    valid_statuses = ["new", "in_progress", "completed", "cancelled"]
    return status in valid_statuses


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal"""
    # Remove path characters
    filename = filename.replace("\\", "").replace("/", "").replace("..", "")
    # Limit length
    return filename[:255]


def validate_file_size(size_bytes: int, max_size_mb: int = 5) -> bool:
    """Validate file size"""
    max_bytes = max_size_mb * 1024 * 1024
    return size_bytes <= max_bytes


def validate_file_extension(filename: str, allowed_extensions: list = None) -> bool:
    """Validate file extension"""
    if allowed_extensions is None:
        allowed_extensions = ["jpg", "jpeg", "png", "gif", "webp"]
    
    if "." not in filename:
        return False
    
    ext = filename.rsplit(".", 1)[-1].lower()
    return ext in allowed_extensions
