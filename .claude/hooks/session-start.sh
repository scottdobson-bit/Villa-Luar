#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

uv tool install graphifyy --reinstall-package graphifyy 2>&1 | tail -1
