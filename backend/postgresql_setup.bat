@echo off
echo ========================================
echo PostgreSQL Setup for Wrytera Project
echo ========================================

echo.
echo Step 1: Installing PostgreSQL (if not installed)
echo Download from: https://www.postgresql.org/download/windows/
echo.

echo Step 2: Creating database and user
echo Run these commands in PostgreSQL Command Line (psql):
echo.
echo psql -U postgres
echo CREATE DATABASE wrytera_db;
echo CREATE USER wrytera_user WITH PASSWORD 'wrytera_password';
echo GRANT ALL PRIVILEGES ON DATABASE wrytera_db TO wrytera_user;
echo ALTER USER wrytera_user CREATEDB;
echo \q
echo.

echo Step 3: Create .env file
copy .env.example .env
echo Edit .env file with your database credentials
echo.

echo Step 4: Install Python PostgreSQL adapter
pip install psycopg2-binary

echo.
echo Step 5: Run migration script
python migrate_to_postgresql.py

echo.
echo ========================================
echo Migration Complete!
echo ========================================
pause
