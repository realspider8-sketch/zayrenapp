Overview
--------
This backend is a small FastAPI service that writes user profiles directly to Supabase via the PostgREST REST API (no local DB required).

How it works
------------
- Client (your Expo app) creates a Supabase auth user (you already do this in the app)
- Client posts profile data to this backend: POST /api/auth/register
- Backend forwards the profile to Supabase REST endpoint (/rest/v1/profiles) using the Service Role key and returns the created/upserted record quickly
- Long-running tasks (emails, analytics) are run as FastAPI BackgroundTasks so the request returns fast

Important env vars
------------------
Create a backend/.env with the following (do NOT commit secrets):

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=8000

Install & run (dev)
-------------------
1. Create a Python venv and activate it
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1   # PowerShell

2. Install dependencies
   python -m pip install -r requirements.txt

3. Create backend/.env from .env.example and set SUPABASE_* values

4. Start the server (backend_start.bat already provided in repo)
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   OR run backend_start.bat

Testing from your dev machine
------------------------------
Use curl to test connectivity and to verify the endpoint responds quickly:

curl -v -X POST http://<your-host-ip>:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"id":"a08e3bae-5e0f-4374-9b13-855f01014311","email":"realspider8@gmail.com","name":"Arfat Danjummai","username":"realspider8"}'

If this returns quickly and shows the created record, your Expo app should be able to call the same URL.

Security notes
--------------
- Use the SUPABASE_SERVICE_ROLE_KEY on server only — never expose it to clients.
- In production, restrict access, rotate keys periodically, and push email/analytics to an external queue for reliability.
