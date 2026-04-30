#!/usr/bin/env sh
set -eu

CONTAINER_NAME="pm-mvp"

if [ "$(docker ps -a --filter "name=^/${CONTAINER_NAME}$" --format "{{.Names}}")" = "$CONTAINER_NAME" ]; then
  docker rm -f "$CONTAINER_NAME" >/dev/null
  printf '%s\n' "Stopped $CONTAINER_NAME"
else
  printf '%s\n' "$CONTAINER_NAME is not running"
fi
