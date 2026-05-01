@echo off
setlocal

set IMAGE_NAME=pm-mvp
set CONTAINER_NAME=pm-mvp

docker build -t %IMAGE_NAME% .
for /f %%i in ('docker ps -a --filter "name=^/%CONTAINER_NAME%$" --format "{{.Names}}"') do (
  if "%%i"=="%CONTAINER_NAME%" docker rm -f %CONTAINER_NAME% >nul
)

set ENV_ARGS=
if exist .env set ENV_ARGS=--env-file .env

docker run -d --name %CONTAINER_NAME% -p 8000:8000 %ENV_ARGS% %IMAGE_NAME%
echo Project Management MVP is running at http://localhost:8000
