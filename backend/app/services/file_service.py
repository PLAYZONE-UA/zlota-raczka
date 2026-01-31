import os
import uuid
from typing import List, Optional
from fastapi import UploadFile
from PIL import Image
import aiofiles

from app.core.config import settings


class FileService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.photos_dir = os.path.join(self.upload_dir, "photos")
        self.temp_dir = os.path.join(self.upload_dir, "temp")
        self.max_size = settings.MAX_FILE_SIZE
        self.allowed_extensions = settings.ALLOWED_EXTENSIONS
        
        # Ensure directories exist
        os.makedirs(self.photos_dir, exist_ok=True)
        os.makedirs(self.temp_dir, exist_ok=True)
    
    def validate_file(self, file: UploadFile) -> dict:
        """Validate uploaded file"""
        # Check if file exists
        if not file:
            return {"valid": False, "error": "Brak pliku"}
        
        # Get file extension
        filename = file.filename
        if not filename:
            return {"valid": False, "error": "Brak nazwy pliku"}
        
        ext = filename.split('.')[-1].lower()
        
        # Check extension
        if ext not in self.allowed_extensions:
            return {
                "valid": False,
                "error": f"Niedozwolony typ pliku. Dozwolone: {', '.join(self.allowed_extensions)}"
            }
        
        # Check file size (this is approximate, actual check happens during read)
        if hasattr(file, 'size') and file.size and file.size > self.max_size:
            max_mb = self.max_size / 1024 / 1024
            return {
                "valid": False,
                "error": f"Plik jest za duży. Maksymalny rozmiar: {max_mb}MB"
            }
        
        return {"valid": True}
    
    def generate_unique_filename(self, original_filename: str) -> str:
        """Generate unique filename"""
        ext = original_filename.split('.')[-1].lower()
        unique_id = uuid.uuid4().hex
        return f"{unique_id}.{ext}"
    
    async def save_upload_file(self, file: UploadFile, directory: str = None) -> dict:
        """Save uploaded file to disk"""
        try:
            # Validate file
            validation = self.validate_file(file)
            if not validation["valid"]:
                return {"success": False, "error": validation["error"]}
            
            # Generate unique filename
            filename = self.generate_unique_filename(file.filename)
            
            # Determine save directory
            save_dir = directory if directory else self.photos_dir
            filepath = os.path.join(save_dir, filename)
            
            # Save file
            async with aiofiles.open(filepath, 'wb') as f:
                content = await file.read()
                
                # Check actual size
                if len(content) > self.max_size:
                    max_mb = self.max_size / 1024 / 1024
                    return {
                        "success": False,
                        "error": f"Plik jest za duży. Maksymalny rozmiar: {max_mb}MB"
                    }
                
                await f.write(content)
            
            return {
                "success": True,
                "filename": filename,
                "filepath": filepath,
                "size": len(content)
            }
            
        except Exception as e:
            print(f"Error saving file: {e}")
            return {
                "success": False,
                "error": f"Błąd podczas zapisywania pliku: {str(e)}"
            }
    
    async def save_multiple_files(
        self,
        files: List[UploadFile],
        max_files: int = 5
    ) -> dict:
        """Save multiple uploaded files"""
        try:
            if len(files) > max_files:
                return {
                    "success": False,
                    "error": f"Zbyt wiele plików. Maksimum: {max_files}"
                }
            
            saved_files = []
            errors = []
            
            for file in files:
                result = await self.save_upload_file(file)
                
                if result["success"]:
                    saved_files.append({
                        "filename": result["filename"],
                        "filepath": result["filepath"],
                        "size": result["size"]
                    })
                else:
                    errors.append({
                        "filename": file.filename,
                        "error": result["error"]
                    })
            
            return {
                "success": len(saved_files) > 0,
                "saved_files": saved_files,
                "errors": errors,
                "total_saved": len(saved_files),
                "total_errors": len(errors)
            }
            
        except Exception as e:
            print(f"Error saving multiple files: {e}")
            return {
                "success": False,
                "error": f"Błąd podczas zapisywania plików: {str(e)}"
            }
    
    def delete_file(self, filepath: str) -> bool:
        """Delete file from disk"""
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                return True
            return False
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False
    
    def delete_multiple_files(self, filepaths: List[str]) -> dict:
        """Delete multiple files"""
        deleted = 0
        failed = 0
        
        for filepath in filepaths:
            if self.delete_file(filepath):
                deleted += 1
            else:
                failed += 1
        
        return {
            "deleted": deleted,
            "failed": failed,
            "total": len(filepaths)
        }
    
    def optimize_image(
        self,
        filepath: str,
        max_width: int = 1920,
        max_height: int = 1920,
        quality: int = 85
    ) -> bool:
        """Optimize image size and quality"""
        try:
            with Image.open(filepath) as img:
                # Convert RGBA to RGB if necessary
                if img.mode == 'RGBA':
                    img = img.convert('RGB')
                
                # Resize if image is too large
                if img.width > max_width or img.height > max_height:
                    img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
                
                # Save optimized image
                img.save(filepath, optimize=True, quality=quality)
                
            return True
            
        except Exception as e:
            print(f"Error optimizing image: {e}")
            return False
    
    def create_thumbnail(
        self,
        filepath: str,
        thumbnail_size: tuple = (300, 300)
    ) -> Optional[str]:
        """Create thumbnail for image"""
        try:
            filename = os.path.basename(filepath)
            name, ext = os.path.splitext(filename)
            thumbnail_filename = f"{name}_thumb{ext}"
            thumbnail_path = os.path.join(os.path.dirname(filepath), thumbnail_filename)
            
            with Image.open(filepath) as img:
                # Convert RGBA to RGB if necessary
                if img.mode == 'RGBA':
                    img = img.convert('RGB')
                
                # Create thumbnail
                img.thumbnail(thumbnail_size, Image.Resampling.LANCZOS)
                img.save(thumbnail_path, optimize=True, quality=85)
            
            return thumbnail_path
            
        except Exception as e:
            print(f"Error creating thumbnail: {e}")
            return None
    
    def get_file_info(self, filepath: str) -> dict:
        """Get file information"""
        try:
            if not os.path.exists(filepath):
                return {"exists": False}
            
            stat = os.stat(filepath)
            
            info = {
                "exists": True,
                "filename": os.path.basename(filepath),
                "filepath": filepath,
                "size": stat.st_size,
                "created": stat.st_ctime,
                "modified": stat.st_mtime
            }
            
            # Try to get image dimensions
            try:
                with Image.open(filepath) as img:
                    info["width"] = img.width
                    info["height"] = img.height
                    info["format"] = img.format
            except:
                pass
            
            return info
            
        except Exception as e:
            print(f"Error getting file info: {e}")
            return {"exists": False, "error": str(e)}


# Singleton instance
file_service = FileService()


# Wrapper functions for imports
async def save_multiple_files(files: List[UploadFile], max_files: int = 5) -> dict:
    """Wrapper for saving multiple files"""
    return await file_service.save_multiple_files(files, max_files)


def delete_multiple_files(filepaths: List[str]) -> dict:
    """Wrapper for deleting multiple files"""
    return file_service.delete_multiple_files(filepaths)


def validate_file(file: UploadFile) -> dict:
    """Wrapper for validating file"""
    return file_service.validate_file(file)
