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
	@echo "  make dev-run      - Start services in development mode (local ou serveur)"
	@echo "  make dev-kill     - Stop all services"
	@echo "  make dev-logs     - Display the logs of the services"
	@echo "  make dev-status   - Display the status of the services"
	@echo "  make dev-restart  - Restart the services"
	@echo "  make dev-clean    - Clean completely (images, volumes, containers)"
	@echo "  make help         - Display this help"
	@echo ""
	@echo "Note: Utilise docker-compose.dev.yml pour le développement"
	@echo "      Staging et Production sont déployés via Ansible (infra/deploy.sh)"
	@echo ""

# Build Docker images
dev-build:
	@echo "Building Docker images (development mode)..."
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml build --no-cache
	@echo "Images built successfully!"

# Start services in development mode (works for both local and server)
dev-run:
	@echo "Starting services SoloText (development mode)..."
	@echo "🧹 Nettoyage des anciens processus Node.js/Vite..."
	-@pkill -f "vite.*8090" 2>/dev/null || true
	-@pkill -f "vite.*8091" 2>/dev/null || true
	-@pkill -f "vite.*8080" 2>/dev/null || true
	-@pkill -f "vite.*8081" 2>/dev/null || true
	-@if [ -f .dev-pids ]; then \
		while read pid; do \
			kill $$pid 2>/dev/null || true; \
		done < .dev-pids; \
		rm -f .dev-pids; \
	fi
	@echo "✅ Nettoyage terminé"
	@echo ""
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml up -d
	@echo "✅ All Docker services started!"
	@echo ""
	@echo "🎉 All services started!"
	@echo ""
	@echo "📡 Backend API: http://localhost:3001 (ou http://51.178.80.14:3001 si sur serveur)"
	@echo "   Health Check: http://localhost:3001/api/health"
	@echo "🌐 App: http://localhost:8090 (ou http://51.178.80.14:8090 si sur serveur)"
	@echo "🌐 Website: http://localhost:8091 (ou http://51.178.80.14:8091 si sur serveur)"
	@echo "🗄️  Adminer (DB Admin): http://localhost:8083"
	@echo "🐰 RabbitMQ Management: http://localhost:15673"
	@echo ""
	@echo "To see the logs: make dev-logs"
	@echo "To stop the services: make dev-kill"

# Stop all services
dev-kill:
	@echo "Stopping services SoloText (development mode)..."
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml down
	@echo "🧹 Nettoyage des processus Node.js/Vite restants..."
	-@pkill -f "vite.*8090" 2>/dev/null || true
	-@pkill -f "vite.*8091" 2>/dev/null || true
	-@pkill -f "vite.*8080" 2>/dev/null || true
	-@pkill -f "vite.*8081" 2>/dev/null || true
	-@if [ -f .dev-pids ]; then \
		while read pid; do \
			kill $$pid 2>/dev/null || true; \
		done < .dev-pids; \
		rm -f .dev-pids; \
	fi
	@echo "✅ All services stopped!"

# Display logs
dev-logs:
	@echo "Logs of the services SoloText (development mode)..."
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml logs -f

# Display the status of the services
dev-status:
	@echo "Status of the services SoloText (development mode)..."
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml ps

# Restart the services
dev-restart:
	@echo "Restarting services SoloText (development mode)..."
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml restart
	@echo "Services restarted!"

# Clean completely (images, volumes, containers)
dev-clean:
	@echo "Cleaning completely the project SoloText (development mode)..."
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml down -v --rmi all --remove-orphans
	@$(DOCKER) system prune -f
	@echo "Cleaning completed!"

# Default command
all: dev-build dev-run
