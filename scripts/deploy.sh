#!/usr/bin/env bash
# Deploys the committed site (HEAD) to the Cloudflare Pages project, including the /api/ask function.
# Uses a clean copy so local-only folders (design/, .claude/) never get uploaded.
# Needs `npx wrangler login` once.
#
#   scripts/deploy.sh                 # project "portfolio"
#   scripts/deploy.sh other-project
set -euo pipefail

PROJECT="${1:-portfolio}"
cd "$(git rev-parse --show-toplevel)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

git archive HEAD | tar -x -C "$tmp"
cd "$tmp"
npx --yes wrangler@4.153.0 pages deploy . --project-name "$PROJECT" --branch master --commit-dirty=true
