@echo off
REM ============================================================
REM  Respaldo Manual COMPLETO - MongoDB (quantify_db)
REM  Exporta TODAS las colecciones de la BD a una carpeta
REM  con timestamp en backend\NoSQL\backups\
REM ============================================================

setlocal enabledelayedexpansion

REM --- Configuracion ---
set "MONGO_URI=mongodb+srv://Quantify:Quantify_2025_dev*@cluster0.jr3tupr.mongodb.net/quantify_db"
set "DB_NAME=quantify_db"

REM --- Timestamp ---
for /f "tokens=1-3 delims=/" %%a in ('date /t') do set "FECHA=%%c-%%a-%%b"
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set "HORA=%%a%%b"
set "TIMESTAMP=%FECHA%_%HORA%"

REM --- Directorio de salida ---
set "SCRIPT_DIR=%~dp0"
set "BACKUP_DIR=%SCRIPT_DIR%..\backups\completo_%TIMESTAMP%"

echo.
echo ============================================================
echo   RESPALDO MANUAL COMPLETO - MongoDB
echo   Base de datos: %DB_NAME%
echo   Destino: %BACKUP_DIR%
echo ============================================================
echo.

REM --- Crear directorio ---
mkdir "%BACKUP_DIR%" 2>nul

REM --- Ejecutar mongodump ---
echo [INFO] Iniciando mongodump...
mongodump --uri="%MONGO_URI%" --out="%BACKUP_DIR%" --db=%DB_NAME%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Respaldo completo generado exitosamente en:
    echo      %BACKUP_DIR%
    echo.
) else (
    echo.
    echo [ERROR] Fallo al generar el respaldo. Verifica:
    echo   - Que mongodump este instalado (MongoDB Database Tools)
    echo   - Que la URI de conexion sea correcta
    echo   - Que tengas conexion a internet (Atlas)
    echo.
)

pause
