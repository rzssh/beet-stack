#!/usr/bin/env sh
set -eu

APP_DIR="${BEET_APP_DIR:-/app}"
PORT="${SERVICE_PORT:-3001}"

if [ "${BEET_SKIP_MIGRATIONS:-0}" != "1" ]; then
  echo "beet: applying database migrations" >&2
  "$APP_DIR/migrate"
fi

echo "beet: starting API server on port ${PORT}" >&2
exec "$APP_DIR/server"
