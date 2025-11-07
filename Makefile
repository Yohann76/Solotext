# Makefile for SoloText
# Docker development commands

# Détection automatique : utilise docker directement si le groupe est actif, sinon utilise sg docker
# Cela évite d'avoir à utiliser sg docker -c à chaque fois si vous êtes dans le groupe docker
DOCKER = $(shell groups | grep -q docker && echo "docker" || echo "sg docker -c docker")
DOCKER_COMPOSE = $(shell groups | grep -q docker && echo "docker compose" || echo "sg docker -c \"docker compose\"")

.PHONY: help dev-build dev-run dev-kill dev-logs dev-status dev-clean dev-restart

# Default help
help:
	@echo "🚀 SoloText - Development commands"
	@echo ""
	@echo "Commandes disponibles :"
	@echo "  make dev-build    - Build Docker images"
	@echo "  make dev-run      - Start services in development mode"
	@echo "  make dev-kill     - Stop all services"
	@echo "  make dev-logs     - Display the logs of the services"
	@echo "  make dev-status   - Display the status of the services"
	@echo "  make dev-restart  - Restart the services"
	@echo "  make dev-clean    - Clean completely (images, volumes, containers)"
	@echo "  make help         - Display this help"
	@echo ""

# Build Docker images
dev-build:
	@echo "Building Docker images..."
	@$(DOCKER_COMPOSE) build --no-cache
	@echo "Images built successfully!"

# Start services in development mode
dev-run:
	@echo "Starting services SoloText..."
	@$(DOCKER_COMPOSE) up -d
	@echo "Services started!"
	@echo ""
	@echo "Frontend: http://localhost:8080"
	@echo "Backend API: http://localhost:3000"
	@echo "Adminer (DB Admin): http://localhost:8081"
	@echo "Health Check: http://localhost:3000/api/health"
	@echo ""
	@echo "To see the logs: make dev-logs"
	@echo "To stop the services: make dev-kill"

# Stop all services
dev-kill:
	@echo "Stopping services SoloText..."
	@$(DOCKER_COMPOSE) down
	@echo "Services stopped!"

# Display logs
dev-logs:
	@echo "Logs of the services SoloText..."
	@$(DOCKER_COMPOSE) logs -f

# Display the status of the services
dev-status:
	@echo "Status of the services SoloText..."
	@$(DOCKER_COMPOSE) ps

# Restart the services
dev-restart:
	@echo "Restarting services SoloText..."
	@$(DOCKER_COMPOSE) restart
	@echo "Services restarted!"

# Clean completely (images, volumes, containers)
dev-clean:
	@echo "Cleaning completely the project SoloText..."
	@$(DOCKER_COMPOSE) down -v --rmi all --remove-orphans
	@$(DOCKER) system prune -f
	@echo "Cleaning completed!"

# Default command
all: dev-build dev-run
