@echo off
REM ============================================================
REM  Respaldo Manual PARCIAL - MongoDB (quantify_db)
REM  Exporta UNA coleccion especifica de la BD
REM  Uso: backup_parcial.bat [NombreColeccion]
REM  Ejemplo: backup_parcial.bat Users
REM  Ejemplo: backup_parcial.bat Habits
REM ============================================================

setlocal enabledelayedexpansion

REM --- Validar parametro ---
if "%~1"=="" (
    echo.
    echo ============================================================
    echo   RESPALDO MANUAL PARCIAL - MongoDB
    echo ============================================================
    echo.
    echo   USO: backup_parcial.bat [NombreColeccion]
    echo.
    echo   Colecciones disponibles:
    echo     - Users
    echo     - UserMetrics
    echo     - Habits
    echo     - Logs
    echo     - Achievements
    echo     - UserEvents
    echo     - Bitacora
    echo     - bitacora_Admins
    echo.
    echo   Ejemplo: backup_parcial.bat Users
    echo.
    pause
    exit /b 1
)

set "COLECCION=%~1"

REM --- Configuracion ---
set "MONGO_URI=mongodb+srv://Quantify:Quantify_2025_dev*@cluster0.jr3tupr.mongodb.net/quantify_db"
set "DB_NAME=quantify_db"

REM --- Timestamp ---
for /f "tokens=1-3 delims=/" %%a in ('date /t') do set "FECHA=%%c-%%a-%%b"
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set "HORA=%%a%%b"
set "TIMESTAMP=%FECHA%_%HORA%"

REM --- Directorio de salida ---
set "SCRIPT_DIR=%~dp0"
set "BACKUP_DIR=%SCRIPT_DIR%..\backups\parcial_%COLECCION%_%TIMESTAMP%"

echo.
echo ============================================================
echo   RESPALDO MANUAL PARCIAL - MongoDB
echo   Base de datos: %DB_NAME%
echo   Coleccion: %COLECCION%
echo   Destino: %BACKUP_DIR%
echo ============================================================
echo.

REM --- Crear directorio ---
mkdir "%BACKUP_DIR%" 2>nul

REM --- Ejecutar mongodump con coleccion especifica ---
echo [INFO] Iniciando mongodump para coleccion "%COLECCION%"...
mongodump --uri="%MONGO_URI%" --out="%BACKUP_DIR%" --db=%DB_NAME% --collection=%COLECCION%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Respaldo parcial de "%COLECCION%" generado exitosamente en:
    echo      %BACKUP_DIR%
    echo.
) else (
    echo.
    echo [ERROR] Fallo al generar el respaldo. Verifica:
    echo   - Que la coleccion "%COLECCION%" exista en la BD
    echo   - Que mongodump este instalado (MongoDB Database Tools)
    echo   - Que la URI de conexion sea correcta
    echo.
)

pause
