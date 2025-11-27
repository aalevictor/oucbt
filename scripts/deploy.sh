#!/usr/bin/env bash
set -euo pipefail

# Helper script for managing deployment on CentOS with Docker Compose
# Usage:
#  ./scripts/deploy.sh build     # build locally and start
#  ./scripts/deploy.sh deploy    # pull image (if using registry) and start
#  ./scripts/deploy.sh migrate   # run prisma migrate deploy
#  ./scripts/deploy.sh logs      # follow container logs
#  ./scripts/deploy.sh rollback  # guidance for rollback by image tag

SERVICE="oucbt"

cmd_build() {
  docker compose build "$SERVICE"
  docker compose up -d "$SERVICE"
}

cmd_deploy() {
  # If image is from a registry, pull the latest tag first
  docker compose pull "$SERVICE" || true
  docker compose up -d "$SERVICE"
}

cmd_migrate() {
  docker compose exec "$SERVICE" npx prisma migrate deploy
}

cmd_logs() {
  docker compose logs -f "$SERVICE"
}

cmd_rollback() {
  echo "Para rollback: altere a tag em docker-compose.yml (chave 'image:') para a versão anterior e execute:"
  echo "  docker compose pull && docker compose up -d"
}

ACTION=${1:-deploy}
case "$ACTION" in
  build) cmd_build ;;
  deploy|pull) cmd_deploy ;;
  migrate) cmd_migrate ;;
  logs) cmd_logs ;;
  rollback) cmd_rollback ;;
  *)
    echo "Uso: $0 [build|deploy|migrate|logs|rollback]" >&2
    exit 1
    ;;
esac