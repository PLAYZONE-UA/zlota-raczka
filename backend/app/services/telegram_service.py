import httpx
from typing import List, Optional
from app.core.config import settings


class TelegramService:
    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.chat_id = settings.TELEGRAM_CHAT_ID
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"
    
    async def send_message(self, text: str, parse_mode: str = "HTML") -> dict:
        """Send text message to Telegram"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/sendMessage",
                    json={
                        "chat_id": self.chat_id,
                        "text": text,
                        "parse_mode": parse_mode
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return {"success": True, "data": response.json()}
                else:
                    print(f"Telegram API error: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            print(f"Error sending Telegram message: {e}")
            return {"success": False, "error": str(e)}
    
    async def send_photo(self, photo_path: str, caption: Optional[str] = None) -> dict:
        """Send photo to Telegram"""
        try:
            async with httpx.AsyncClient() as client:
                with open(photo_path, 'rb') as photo:
                    files = {'photo': photo}
                    data = {'chat_id': self.chat_id}
                    
                    if caption:
                        data['caption'] = caption
                        data['parse_mode'] = 'HTML'
                    
                    response = await client.post(
                        f"{self.base_url}/sendPhoto",
                        files=files,
                        data=data,
                        timeout=30.0
                    )
                    
                    if response.status_code == 200:
                        return {"success": True, "data": response.json()}
                    else:
                        print(f"Telegram API error: {response.text}")
                        return {"success": False, "error": response.text}
                        
        except Exception as e:
            print(f"Error sending Telegram photo: {e}")
            return {"success": False, "error": str(e)}
    
    def format_order_message(
        self,
        order_id: int,
        phone: str,
        address: str,
        description: str,
        selected_date: str,
        photo_count: int = 0
    ) -> str:
        """Format order notification message"""
        message = f"""
🔔 <b>Nowe zamówienie #{order_id}</b>

📱 <b>Telefon:</b> {phone}
📍 <b>Adres:</b> {address}
📅 <b>Data:</b> {selected_date}

📝 <b>Opis problemu:</b>
{description}

📸 <b>Zdjęcia:</b> {photo_count} {'zdjęcie' if photo_count == 1 else 'zdjęć' if photo_count in [2,3,4] else 'zdjęć'}

⏰ <b>Czas zgłoszenia:</b> {self._get_current_time()}
        """
        
        return message.strip()
    
    def _get_current_time(self) -> str:
        """Get current time formatted for display"""
        from datetime import datetime
        now = datetime.now()
        return now.strftime("%Y-%m-%d %H:%M:%S")
    
    async def notify_new_order(
        self,
        order_id: int,
        phone: str,
        address: str,
        description: str,
        selected_date: str,
        photo_paths: List[str] = None
    ) -> dict:
        """Send notification about new order"""
        try:
            import os
            
            # Send text message
            photo_count = len(photo_paths) if photo_paths else 0
            message = self.format_order_message(
                order_id=order_id,
                phone=phone,
                address=address,
                description=description,
                selected_date=selected_date,
                photo_count=photo_count
            )
            
            result = await self.send_message(message)
            
            if not result["success"]:
                return result
            
            # Send photos if available
            if photo_paths:
                for idx, photo_filename in enumerate(photo_paths, 1):
                    # Побудовуємо повний шлях до файлу
                    photo_path = os.path.join("uploads", "photos", photo_filename)
                    
                    if os.path.exists(photo_path):
                        caption = f"Zdjęcie {idx}/{photo_count} - Zamówienie #{order_id}"
                        photo_result = await self.send_photo(photo_path, caption)
                        
                        if not photo_result["success"]:
                            print(f"Failed to send photo {idx}: {photo_result.get('error')}")
                    else:
                        print(f"Photo file not found: {photo_path}")
            
            return {
                "success": True,
                "message": "Powiadomienie wysłane na Telegram"
            }
            
        except Exception as e:
            print(f"Error notifying about new order: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def notify_status_change(
        self,
        order_id: int,
        old_status: str,
        new_status: str
    ) -> dict:
        """Send notification about order status change"""
        try:
            status_labels = {
                "new": "Nowe",
                "in_progress": "W trakcie",
                "completed": "Zakończone",
                "cancelled": "Anulowane"
            }
            
            message = f"""
🔄 <b>Zmiana statusu zamówienia #{order_id}</b>

<b>Poprzedni status:</b> {status_labels.get(old_status, old_status)}
<b>Nowy status:</b> {status_labels.get(new_status, new_status)}

⏰ <b>Czas zmiany:</b> {self._get_current_time()}
            """
            
            result = await self.send_message(message.strip())
            return result
            
        except Exception as e:
            print(f"Error notifying about status change: {e}")
            return {
                "success": False,
                "error": str(e)
            }


# Singleton instance
telegram_service = TelegramService()


# Wrapper functions for imports
async def notify_new_order(
    order_id: int,
    phone: str,
    address: str,
    description: str,
    selected_date: str,
    photo_paths: List[str] = None
) -> dict:
    """Wrapper for notifying about new order"""
    return await telegram_service.notify_new_order(
        order_id=order_id,
        phone=phone,
        address=address,
        description=description,
        selected_date=selected_date,
        photo_paths=photo_paths
    )


async def notify_status_change(
    order_id: int,
    old_status: str,
    new_status: str
) -> dict:
    """Wrapper for notifying about status change"""
    return await telegram_service.notify_status_change(
        order_id=order_id,
        old_status=old_status,
        new_status=new_status
    )
