#!/usr/bin/env sh
set -eu

IMAGE_NAME="pm-mvp"
CONTAINER_NAME="pm-mvp"

docker build -t "$IMAGE_NAME" .

if [ "$(docker ps -a --filter "name=^/${CONTAINER_NAME}$" --format "{{.Names}}")" = "$CONTAINER_NAME" ]; then
  docker rm -f "$CONTAINER_NAME" >/dev/null
fi

ENV_ARGS=""
if [ -f .env ]; then
  ENV_ARGS="--env-file .env"
fi

CERT_ARGS=""
if [ -f /etc/ssl/certs/ca-certificates.crt ]; then
  CERT_ARGS="-v /etc/ssl/certs/ca-certificates.crt:/etc/ssl/certs/ca-certificates.crt:ro"
fi

docker run -d --name "$CONTAINER_NAME" -p 8000:8000 $ENV_ARGS $CERT_ARGS "$IMAGE_NAME"
printf '%s\n' "Project Management MVP is running at http://localhost:8000"
