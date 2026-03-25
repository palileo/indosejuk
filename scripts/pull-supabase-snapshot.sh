#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "Pull perubahan repo terbaru..."
git pull --ff-only

if [[ -n "${INDOSEJUK_SNAPSHOT_URL:-}" ]]; then
  mkdir -p data
  auth_header=()
  if [[ -n "${INDOSEJUK_SNAPSHOT_BEARER:-}" ]]; then
    auth_header=(-H "Authorization: Bearer ${INDOSEJUK_SNAPSHOT_BEARER}")
  fi

  echo "Mengambil snapshot profiles dari endpoint aman..."
  curl -fsSL "${auth_header[@]}" "${INDOSEJUK_SNAPSHOT_URL}" -o "data/profiles-snapshot.json"
  echo "Snapshot disimpan di data/profiles-snapshot.json"
else
  echo "INDOSEJUK_SNAPSHOT_URL belum diset. Snapshot endpoint dilewati."
fi

echo "Catatan: localhost app tetap membaca Supabase langsung sebagai source of truth."
echo "Snapshot GitHub hanya berguna untuk audit, backup, atau inspeksi perubahan."
