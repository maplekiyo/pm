@echo off
setlocal

set CONTAINER_NAME=pm-mvp
set FOUND=

for /f %%i in ('docker ps -a --filter "name=^/%CONTAINER_NAME%$" --format "{{.Names}}"') do (
  if "%%i"=="%CONTAINER_NAME%" set FOUND=1
)

if "%FOUND%"=="1" (
  docker rm -f %CONTAINER_NAME% >nul
  echo Stopped %CONTAINER_NAME%
) else (
  echo %CONTAINER_NAME% is not running
)
