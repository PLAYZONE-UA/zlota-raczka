# 🔧 Handyman Service - Backend

FastAPI backend z pełną funkcjonalnością dla serwisu napraw domowych.

## ✅ Status: **COMPLETE**

Wszystkie funkcje zostały zrealizowane i są gotowe do użycia!

---

## 🚀 Quick Start

### 1. Instalacja

```bash
cd backend

# Utwórz wirtualne środowisko
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# lub: venv\Scripts\activate  # Windows

# Zainstaluj zależności
pip install -r requirements.txt
```

### 2. Konfiguracja

```bash
# Skopiuj .env.example do .env
cp .env.example .env

# Edytuj .env i dodaj swoje dane:
nano .env
```

**Wymagane zmienne:**
```env
# Twilio SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+48123456789

# Telegram Bot
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here

# Database
DATABASE_URL=sqlite+aiosqlite:///./handyman.db
```

### 3. Inicjalizacja bazy danych

```bash
python -m app.core.init_db
```

To utworzy:
- Wszystkie tabele w bazie
- 40+ dostępnych dat (pomijając weekendy)

### 4. Uruchomienie

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**API będzie dostępne na:**
- API: http://localhost:8000
- Docs (Swagger): http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 📊 Funkcje

### ✅ SMS Weryfikacja (Twilio)
- Wysyłanie kodów SMS (6 cyfr)
- Weryfikacja kodów z timeout'em
- Expiry time (10 minut - konfigurowalny)
- Reużycie niewygasłych kodów
- Limit powtórzeń (3 razy)

### ✅ Zarządzanie zamówieniami
- Tworzenie zamówień (multipart/form-data)
- Upload do 5 zdjęć per zamówienie
- Lista zamówień (z filtrowaniem po statusie)
- Szczegóły zamówienia
- Zmiana statusu (new → in_progress → completed/cancelled)
- Usuwanie zamówień + powiązanych plików
- Telegram notyfikacje dla admina

### ✅ Upload plików
- Walidacja typu (JPG, PNG, GIF, WebP)
- Walidacja rozmiaru (max 5MB)
- Maksimum 5 zdjęć per zamówienie
- Optymalizacja obrazów (resize, quality)
- Tworzenie miniatur
- Unique filenames (UUID)
- Automatyczne usuwanie przy DELETE

### ✅ Dostępne daty
- Lista dostępnych dat (tylko przyszłe)
- CRUD operacje
- Bulk creation (zakres dat naraz)
- Pomijanie weekendów
- Filtrowanie po dostępności

### ✅ Telegram Powiadomienia
- Nowe zamówienie (+ wszystkie zdjęcia)
- Zmiana statusu zamówienia
- HTML formatting
- Graceful error handling

### ✅ Admin Authentication
- HTTP Basic Auth
- Credentials z .env
- Timing-safe comparison

---

## 📡 API Endpoints

### SMS Verification
```
POST   /api/sms/send       - Wyślij kod SMS
POST   /api/sms/verify     - Zweryfikuj kod
```

### Orders
```
POST   /api/orders              - Utwórz zamówienie (multipart/form-data)
GET    /api/orders              - Lista zamówień (+ filter by status)
GET    /api/orders/{id}         - Szczegóły zamówienia
PATCH  /api/orders/{id}/status  - Zmień status
DELETE /api/orders/{id}         - Usuń zamówienie (auth required)
```

### Available Dates
```
GET    /api/dates/available     - Dostępne daty (tylko przyszłe)
GET    /api/dates/all           - Wszystkie daty (admin)
POST   /api/dates               - Utwórz datę
PATCH  /api/dates/{id}          - Zmień dostępność
DELETE /api/dates/{id}          - Usuń datę
POST   /api/dates/bulk          - Utwórz wiele dat naraz
```

---

## 🗄️ Baza danych

**SQLite + AsyncIO** (łatwa migracja na PostgreSQL)

### Tabele:

**orders**
```
id, phone, address, description
selected_date, photos (JSON array)
status (new|in_progress|completed|cancelled)
created_at, updated_at
```

**sms_verifications**
```
id, phone, code
is_verified, expires_at
created_at
```

**available_dates**
```
id, date (YYYY-MM-DD)
is_available, created_at
```

---

## 🛠️ Services

### SMS Service (`services/sms_service.py`)
```python
- send_verification_code()  # Wysyła SMS przez Twilio
- verify_code()             # Weryfikuje kod
- check_verification_status()  # Sprawdza status weryfikacji
- generate_code()           # Generuje 6-cyfrowy kod
```

### Telegram Service (`services/telegram_service.py`)
```python
- notify_new_order()        # Powiadomienie o nowym zamówieniu
- notify_status_change()    # Powiadomienie o zmianie statusu
- send_message()            # Wysyła wiadomość tekstową
- send_photo()              # Wysyła zdjęcie
- format_order_message()    # Formatuje wiadomość zamówienia
```

### File Service (`services/file_service.py`)
```python
- save_upload_file()        # Zapisuje plik na dysk
- save_multiple_files()     # Zapisuje wiele plików
- validate_file()           # Walidacja pliku
- optimize_image()          # Optymalizacja obrazu (resize, quality)
- create_thumbnail()        # Tworzenie miniaturki
- delete_file()             # Usuwanie pliku z dysku
- get_file_info()           # Informacje o pliku (size, dimensions)
```

---

## 🔧 Utilities

### Auth (`core/auth.py`)
```python
- verify_admin_credentials()  # Weryfikacja loginu/hasła
- get_current_admin()         # Pobiera dane zalogowanego admina
```

### Validators (`core/validators.py`)
```python
- validate_phone_number()     # Walidacja numeru telefonu
- validate_date_format()      # Walidacja daty (YYYY-MM-DD)
- validate_text_length()      # Walidacja długości tekstu
- validate_sms_code()         # Walidacja kodu SMS
- validate_order_status()     # Walidacja statusu zamówienia
- validate_file_size()        # Walidacja rozmiaru pliku
- validate_file_extension()   # Walidacja rozszerzenia pliku
- sanitize_filename()         # Czyszczenie nazwy pliku
```

---

## 🔒 Bezpieczeństwo

- ✅ SMS weryfikacja przed zamówieniem
- ✅ Walidacja typu i rozmiaru pliku
- ✅ Admin HTTP Basic Auth
- ✅ CORS configuration
- ✅ SQL injection protection (SQLAlchemy ORM)
- ✅ XSS protection (FastAPI + Pydantic)
- ✅ Unique filenames (UUID)
- ✅ Zmienne środowiskowe dla sekretów
- ✅ Timing-safe authentication comparison

---

## 📝 Przykłady użycia

### Utworzenie zamówienia (curl)

```bash
curl -X POST "http://localhost:8000/api/orders" \
  -H "Content-Type: multipart/form-data" \
  -F "phone=+48123456789" \
  -F "address=ul. Testowa 123, Legionowo" \
  -F "description=Wymiana żarówki w łazience" \
  -F "selected_date=2026-02-15" \
  -F "sms_code=123456" \
  -F "photos=@photo1.jpg" \
  -F "photos=@photo2.jpg"
```

### Utwórz wiele dat naraz

```bash
curl -X POST "http://localhost:8000/api/dates/bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-02-01",
    "end_date": "2026-02-28",
    "skip_weekends": true
  }'
```

### Zmiana statusu zamówienia (admin)

```bash
curl -X PATCH "http://localhost:8000/api/orders/1/status" \
  -H "Content-Type: application/json" \
  -u admin:password \
  -d '{
    "status": "completed"
  }'
```

---

## 🧪 Testing

```bash
# Unit tests (do zaimplementowania)
pytest tests/

# Manual testing via Swagger UI
# Otwórz: http://localhost:8000/docs
```

---

## 🚢 Production Deployment

### Zmienne środowiskowe

Pamiętaj aby ustawić:
- `DEBUG=False`
- Secure `ADMIN_PASSWORD` (min 8 znaków)
- Właściwe `BACKEND_CORS_ORIGINS`
- Production database URL (PostgreSQL)

### Railway / Render

```bash
# Build Command
pip install -r requirements.txt && python -m app.core.init_db

# Start Command
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Docker

```bash
docker build -t handyman-backend .
docker run -p 8000:8000 --env-file .env handyman-backend
```

---

## 📚 Dokumentacja API

Po uruchomieniu serwera, dokumentacja jest dostępna na:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

---

## 🐛 Troubleshooting

### Problem: "Twilio error"
- Sprawdź credentials w `.env`
- Zweryfikuj numer telefonu w Twilio Console
- Sprawdź czy masz kredyty w Twilio

### Problem: "Telegram API error"
- Sprawdź Bot Token
- Sprawdź Chat ID (powinien być liczbą)
- Upewnij się, że bot został dodany do grupy/kanału

### Problem: "File upload error"
- Sprawdź czy katalog `uploads/photos` istnieje
- Sprawdź uprawnienia do zapisu (chmod 755)
- Sprawdź rozmiar pliku (max 5MB)

### Problem: "Database locked"
- SQLite ma ograniczenia w concurrency
- Dla production użyj PostgreSQL: `postgresql+asyncpg://user:pass@localhost/db`

---

## 📦 Dependencies

**Core:**
- fastapi==0.109.0
- uvicorn[standard]==0.27.0
- sqlalchemy==2.0.25
- aiosqlite==0.19.0
- pydantic==2.5.3

**Services:**
- twilio==8.11.1
- httpx==0.26.0
- pillow==10.2.0

**Utils:**
- python-multipart==0.0.6
- python-dotenv==1.0.0
- aiofiles==23.2.1

---

## 🎯 Next Steps

Backend jest kompletny! Możesz:

1. ✅ Uruchomić serwer lokalnie
2. ✅ Przetestować wszystkie endpointy
3. ✅ Zintegrować z Frontend (React)
4. ✅ Deploy na production

---

## 📞 Support

Potrzebujesz pomocy?
- Sprawdź dokumentację API: `/docs`
- Przejrzyj logi serwera w terminalu
- Sprawdź zmienne `.env`

---

**Status:** ✅ COMPLETE  
**Version:** 1.0.0  
**Last Updated:** 2026-01-28
