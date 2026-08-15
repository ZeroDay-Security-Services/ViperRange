#!/usr/bin/env bash
# ViperRange — Lab Image Build Script
# ZeroDay Security Services
#
# Builds and optionally pushes all deployable lab Docker images.
# Usage:
#   ./build.sh                 Build all images locally
#   ./build.sh --push          Build and push to registry
#   REGISTRY=myorg ./build.sh  Override registry namespace (default: zerodaysec)

set -euo pipefail

REGISTRY="${REGISTRY:-zerodaysec}"
PUSH=false

if [[ "${1:-}" == "--push" ]]; then
  PUSH=true
fi

LABS=(
  "file-oracle"
  "pixel-cache"
  "crawler-protocol"
  "session-architect"
  "cipher-gate"
  "loose-types"
  "template-engine"
  "style-injector"
)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for lab in "${LABS[@]}"; do
  IMAGE="${REGISTRY}/vr-${lab}:latest"
  echo "── Building ${IMAGE} ─────────────────────────────"
  docker build -t "${IMAGE}" "${SCRIPT_DIR}/${lab}"

  if [[ "${PUSH}" == true ]]; then
    echo "── Pushing ${IMAGE} ───────────────────────────────"
    docker push "${IMAGE}"
  fi
done

echo ""
echo "All lab images built successfully."
if [[ "${PUSH}" == false ]]; then
  echo "Run with --push to publish to the registry."
fi
