# VISIONFLOW Makefile
# Comandos simplificados para desenvolvimento

.PHONY: help up down build logs restart clean shell-frontend shell-backend test format lint

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[36m
RESET := \033[0m

help: ## Mostra esta mensagem de ajuda
	@echo "$(BLUE)VISIONFLOW - Comandos Disponíveis$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-20s$(RESET) %s\n", $$1, $$2}'

# ============================================
# Docker Commands
# ============================================

up: ## Iniciar containers (detached)
	docker compose up -d

up-build: ## Build e iniciar containers
	docker compose up --build -d

down: ## Parar containers
	docker compose down

build: ## Build containers sem iniciar
	docker compose build

restart: ## Reiniciar containers
	docker compose restart

logs: ## Ver logs de todos os containers
	docker compose logs -f

logs-frontend: ## Ver logs do frontend
	docker compose logs -f frontend

logs-backend: ## Ver logs do backend
	docker compose logs -f backend

clean: ## Parar containers e remover volumes (⚠️ DELETA DADOS)
	@echo "⚠️  Isso vai deletar TODOS os dados nos volumes. Continuar? [y/N] " && read ans && [ $${ans:-N} = y ]
	docker compose down -v
	docker system prune -f

# ============================================
# Shell Access
# ============================================

shell-frontend: ## Abrir shell no container frontend
	docker compose exec frontend sh

shell-backend: ## Abrir shell no container backend
	docker compose exec backend bash

# ============================================
# Development
# ============================================

install-frontend: ## Instalar dependências do frontend
	docker compose exec frontend npm install

install-backend: ## Instalar dependências do backend
	docker compose exec backend pip install -r requirements.txt

# ============================================
# Testing
# ============================================

test: ## Executar todos os testes
	docker compose exec backend pytest
	docker compose exec frontend npm test

test-frontend: ## Executar testes do frontend
	docker compose exec frontend npm test

test-backend: ## Executar testes do backend
	docker compose exec backend pytest

test-coverage: ## Executar testes com coverage
	docker compose exec backend pytest --cov=.
	docker compose exec frontend npm run test:coverage

# ============================================
# Code Quality
# ============================================

format: ## Formatar código (Black + Prettier)
	docker compose exec backend black .
	docker compose exec frontend npm run format

lint: ## Verificar code style
	docker compose exec backend ruff check .
	docker compose exec frontend npm run lint

type-check: ## Verificar tipos TypeScript
	docker compose exec frontend npm run type-check

# ============================================
# Database (Future)
# ============================================

# migrate: ## Executar migrações de banco
# 	docker compose exec backend alembic upgrade head

# migrate-create: ## Criar nova migração
# 	docker compose exec backend alembic revision --autogenerate -m "$(message)"

# ============================================
# Cleanup
# ============================================

clean-cache: ## Limpar caches (não remove volumes)
	docker compose exec frontend rm -rf .next node_modules/.cache
	docker compose exec backend find . -type d -name __pycache__ -exec rm -rf {} +
	docker compose exec backend find . -type f -name "*.pyc" -delete

prune: ## Remover containers, imagens e volumes não utilizados
	docker system prune -af --volumes

# ============================================
# Utilities
# ============================================

ps: ## Listar containers em execução
	docker compose ps

stats: ## Mostrar uso de recursos dos containers
	docker stats

volumes: ## Listar volumes
	docker volume ls | grep visionflow

backup-volumes: ## Backup de volumes para ./backups/
	@mkdir -p backups
	@echo "Creating backup..."
	@docker run --rm -v visionflow-uploads:/data -v $(PWD)/backups:/backup alpine tar czf /backup/uploads-$(shell date +%Y%m%d-%H%M%S).tar.gz -C /data .
	@docker run --rm -v visionflow-exports:/data -v $(PWD)/backups:/backup alpine tar czf /backup/exports-$(shell date +%Y%m%d-%H%M%S).tar.gz -C /data .
	@docker run --rm -v visionflow-presets:/data -v $(PWD)/backups:/backup alpine tar czf /backup/presets-$(shell date +%Y%m%d-%H%M%S).tar.gz -C /data .
	@echo "✅ Backup criado em ./backups/"

# ============================================
# Quick Development Setup
# ============================================

setup: ## Setup inicial (build + criar volumes + iniciar)
	@echo "🚀 Setting up VISIONFLOW development environment..."
	@mkdir -p volumes/{uploads,exports,models,presets}
	@cp -n .env.example .env || true
	@echo "📦 Building containers..."
	docker compose build
	@echo "▶️  Starting containers..."
	docker compose up -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 10
	@echo "✅ Setup complete!"
	@echo ""
	@echo "📍 Access points:"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:8000"
	@echo "   API Docs: http://localhost:8000/docs"
	@echo ""
	@echo "📖 See 'make help' for available commands"
