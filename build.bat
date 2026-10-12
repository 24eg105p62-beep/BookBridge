@echo off
echo ========================================================
echo   BOOKBRIDGE - Maven Build Script
echo   B.Tech CSE Project: Yeldhandi Chandu (24EG105P62)
echo ========================================================
echo.
mvn clean package -DskipTests
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Build Successful! JAR created in target\
) else (
    echo.
    echo Build Failed! Please ensure Java JDK 17+ and Maven are installed.
)
pause
