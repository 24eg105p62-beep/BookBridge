@echo off
echo ========================================================
echo   BOOKBRIDGE - Run Spring Boot Application
echo ========================================================
echo.
echo Choose Database Mode:
echo [1] MySQL Database (requires MySQL running on port 3306)
echo [2] H2 In-Memory Database (No setup needed, instant launch)
echo.
set /p choice="Enter choice (1 or 2, default is 1): "

if "%choice%"=="2" (
    echo Starting with H2 in-memory profile...
    mvn spring-boot:run -Dspring-boot.run.profiles=h2
) else (
    echo Starting with MySQL profile...
    mvn spring-boot:run
)
pause
