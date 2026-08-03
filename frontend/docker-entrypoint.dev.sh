#!/bin/sh
set -e

# Install into the named volume on first start (keeps the image small).
if [ ! -d node_modules/.bin ]; then
  echo "Installing npm dependencies..."
  npm install
fi

exec "$@"