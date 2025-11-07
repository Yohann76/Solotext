# Makefile for SoloText
# Docker development commands

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
	@sg docker -c "docker compose build --no-cache"
	@echo "Images built successfully!"

# Start services in development mode
dev-run:
	@echo "Starting services SoloText..."
	@sg docker -c "docker compose up -d"
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
	@sg docker -c "docker compose down"
	@echo "Services stopped!"

# Display logs
dev-logs:
	@echo "Logs of the services SoloText..."
	@sg docker -c "docker compose logs -f"

# Display the status of the services
dev-status:
	@echo "Status of the services SoloText..."
	@sg docker -c "docker compose ps"

# Restart the services
dev-restart:
	@echo "Restarting services SoloText..."
	@sg docker -c "docker compose restart"
	@echo "Services restarted!"

# Clean completely (images, volumes, containers)
dev-clean:
	@echo "Cleaning completely the project SoloText..."
	@sg docker -c "docker compose down -v --rmi all --remove-orphans"
	@sg docker -c "docker system prune -f"
	@echo "Cleaning completed!"

# Default command
all: dev-build dev-run
