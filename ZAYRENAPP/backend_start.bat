@echo off
rem Install backend dependencies
python -m pip install --upgrade pip
python -m pip install -r ..\backend\requirements.txt

rem Change to project root where backend package is located
cd ..

rem Start FastAPI backend
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
