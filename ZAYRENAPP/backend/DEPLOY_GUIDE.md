# Quick Start: Deploy Backend Locally

## 1. Setup (First Time Only)

### Copy Environment Configuration
```bash
cd backend
copy .env.example .env
```

### Edit `.env` with Your Supabase Credentials
Open `backend/.env` in VS Code and fill in:
```
SUPABASE_URL=https://vskmpsecfgsiiyfkcyzg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=8000
```

### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

**Verify installation:**
```bash
pip list | find "fastapi"
```

Expected: `fastapi==0.100.0`

## 2. Start Backend

### Windows
Double-click `backend/start_backend.bat`

Or from terminal:
```bash
cd backend
python -m uvicorn main_fixed:app --host 0.0.0.0 --port 8000
```

### Mac/Linux
```bash
cd backend
python -m uvicorn main_fixed:app --host 0.0.0.0 --port 8000
```

### Expected Output
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

## 3. Configure Expo App

### Get Your Machine's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your network adapter (e.g., 192.168.1.100)

**Mac:**
```bash
ipconfig getifaddr en0
```

### Update `lib/api.ts`

Find the `registerUserProfile` function and verify the API endpoint:

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://YOUR_IP:8000';
```

Replace `YOUR_IP` with your machine's IP address from above.

**Example:**
```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:8000';
```

## 4. Test Registration Flow

### From Terminal (Before Testing on Device)

Test if backend is responding:
```bash
curl -X GET http://localhost:8000/
```

Expected:
```json
{"detail":"Not Found"}
```

Test register endpoint:
```bash
curl -X POST http://localhost:8000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"12345678-1234-1234-1234-123456789abc\",\"email\":\"test@example.com\",\"name\":\"Test\",\"username\":\"testuser\"}"
```

Expected:
```json
{"ok":true,"id":"12345678-1234-1234-1234-123456789abc","detail":"created"}
```

### From Expo Physical Device

1. Open Expo app on your phone
2. Navigate to register screen
3. Fill in: name, email, password, username
4. Tap "Register"
5. Check backend terminal for logs:
   ```
   POST /api/auth/register START payload=...
   Supabase response status: 201
   ```
6. Check Supabase Dashboard:
   - Go to Table Editor
   - Open "profiles" table
   - Verify new profile appears with your data

## 5. Production Deployment

### Option A: Local Network (Development)
- Keep backend running on your machine
- Update `lib/api.ts` to use your machine's IP

### Option B: Cloud Server (Production)

Deploy backend to free services:

**Railway.app** (Recommended - free tier with $5/month credits):
1. Push `backend/` folder to GitHub
2. Connect Railway to GitHub repo
3. Railway auto-detects FastAPI and starts server
4. Update `lib/api.ts` to use Railway URL

**Or use:** Heroku, Render, AWS Lambda, Google Cloud Run

## Troubleshooting

### Error: "Could not find the table 'public.profiles'"
- ✅ Already fixed in Supabase (table + RLS policies created)
- Restart backend: `Ctrl+C` then start again

### Error: "invalid input syntax for type uuid"
- Client must send valid UUIDs from Supabase auth
- Check `lib/api.ts` is using `auth.user?.id` (UUID format)

### Error: "Service Unavailable" / Connection Refused
- Verify backend is running: `curl http://localhost:8000/`
- Check firewall allows port 8000
- Verify IP address in `lib/api.ts` matches your machine

### Backend 500 Error
- Check `.env` file exists in `backend/` folder
- Check SUPABASE_SERVICE_ROLE_KEY is correct (long JWT token, not short key)
- Restart backend after updating `.env`

### Still Timing Out on Device
1. Confirm machine IP address is reachable from phone: `ping YOUR_IP` from your phone
2. Check backend is listening on 0.0.0.0: `netstat -an | find "8000"` (Windows)
3. Try connecting to backend health endpoint from phone browser: `http://YOUR_IP:8000/`

## Files & Scripts

| File | Purpose |
|------|---------|
| `backend/main_fixed.py` | The FastAPI server (main code) |
| `backend/requirements.txt` | Python dependencies |
| `backend/start_backend.bat` | One-click startup (Windows) |
| `backend/.env` | Your credentials (created from .env.example) |
| `backend/test_supabase_direct.py` | Diagnostic tool to test Supabase |
| `lib/api.ts` | Expo frontend API client |

## Architecture Overview

```
Physical Device (Expo App)
    ↓ POST /api/auth/register
Backend Server (FastAPI)
    ↓ POST /rest/v1/profiles
Supabase
    ↓ RLS Policies
Database (PostgreSQL)
```

Flow:
1. User submits registration form in Expo
2. Frontend creates Supabase auth user
3. Frontend calls backend /api/auth/register with userId
4. Backend forwards to Supabase REST API (/rest/v1/profiles)
5. Supabase writes profile record to PostgreSQL
6. Response returned to frontend
7. User redirected to login/dashboard

---

**Status**: ✅ Ready to deploy  
**Next Step**: Run `backend/start_backend.bat` and test from Expo device
