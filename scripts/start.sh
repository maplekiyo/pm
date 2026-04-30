#!/usr/bin/env sh
set -eu

IMAGE_NAME="pm-mvp"
CONTAINER_NAME="pm-mvp"

docker build -t "$IMAGE_NAME" .

if [ "$(docker ps -a --filter "name=^/${CONTAINER_NAME}$" --format "{{.Names}}")" = "$CONTAINER_NAME" ]; then
  docker rm -f "$CONTAINER_NAME" >/dev/null
fi

docker run -d --name "$CONTAINER_NAME" -p 8000:8000 "$IMAGE_NAME"
printf '%s\n' "Project Management MVP is running at http://localhost:8000"
