@echo off
title D' VIAJE - FRONTEND (la aplicacion) - NO CERRAR
cd /d "%~dp0frontend-transporte"

echo.
echo   D' VIAJE - FRONTEND
echo   ===================
echo   Carpeta: %CD%
echo.
echo   Cuando veas "Local: http://localhost:5173/" la aplicacion esta lista.
echo   NO cierres esta ventana mientras la uses.
echo.

rem Se muestra en pantalla Y se guarda en arranque-frontend.log, para poder
rem ver el motivo si algo falla (la ventana a veces se cierra muy rapido).
powershell -NoProfile -ExecutionPolicy Bypass -Command "npm run dev 2>&1 | Tee-Object -FilePath '%~dp0frontend-transporte\arranque-frontend.log'"

echo.
echo   ------------------------------------------------------------
echo   El frontend se detuvo. Arriba esta el motivo.
echo   Tambien quedo guardado en:
echo     frontend-transporte\arranque-frontend.log
echo   ------------------------------------------------------------
echo.
pause
