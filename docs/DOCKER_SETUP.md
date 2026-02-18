# VISIONFLOW - Docker Setup Guide

## 📋 Visão Geral

Este documento fornece instruções completas para configurar o ambiente de desenvolvimento do VISIONFLOW usando Docker e Docker Compose.

---

## 🐳 Pré-requisitos

### Software Necessário

- **Docker**: 24.0+ ([Instalar Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: 2.20+ (incluído no Docker Desktop)
- **Git**: Para clonar o repositório
- **(Opcional) Make**: Para usar comandos simplificados

### Verificar Instalação

```bash
docker --version
# Docker version 24.0.0, build ...

docker compose version
# Docker Compose version v2.20.0

git --version
# git version 2.40.0
```

### Requisitos de Sistema

- **CPU**: 4 cores recomendados (mínimo 2)
- **RAM**: 8GB recomendados (mínimo 4GB)
- **Disco**: 10GB livres (modelos de IA ocupam ~2-3GB)
- **GPU**: Opcional (acelera inferência de IA, requer NVIDIA Docker Toolkit)

---

## 📁 Estrutura do Projeto

```
visionflow/
├── docker-compose.yml          # Orquestração de containers
├── .env.example                # Template de variáveis de ambiente
├── .env                        # Variáveis de ambiente (gitignored)
│
├── frontend/
│   ├── Dockerfile              # Imagem do frontend
│   ├── .dockerignore
│   ├── package.json
│   ├── next.config.js
│   └── src/
│
├── backend/
│   ├── Dockerfile              # Imagem do backend
│   ├── .dockerignore
│   ├── requirements.txt
│   ├── main.py                 # FastAPI app
│   └── api/
│
└── volumes/                    # Volumes locais (gitignored)
    ├── uploads/                # Imagens uploaded
    ├── exports/                # Imagens exportadas
    ├── models/                 # Cache de modelos de IA
    └── presets/                # User presets (.vip, .json)
```

---

## 🚀 Quick Start

### 1. Clonar Repositório

```bash
git clone https://github.com/GabrielaMoretti/VISIONFLOW.git
cd VISIONFLOW
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Editar `.env`:

```bash
# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend
PYTHON_ENV=development
BACKEND_PORT=8000
UPLOAD_MAX_SIZE=52428800  # 50MB in bytes

# AI Models
MODELS_CACHE_DIR=/app/models
DOWNLOAD_MODELS_ON_START=true

# Frontend
FRONTEND_PORT=3000

# Volumes
VOLUMES_PATH=./volumes
```

### 3. Iniciar Containers

```bash
docker compose up --build
```

Ou em background:

```bash
docker compose up -d --build
```

### 4. Acessar Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)

### 5. Parar Containers

```bash
docker compose down
```

Para também remover volumes (⚠️ deleta dados):

```bash
docker compose down -v
```

---

## 📝 docker-compose.yml Completo

```yaml
version: '3.8'

services:
  # ============================================
  # Frontend Service (Next.js)
  # ============================================
  frontend:
    container_name: visionflow-frontend
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - NODE_ENV=${NODE_ENV:-development}
    ports:
      - "${FRONTEND_PORT:-3000}:3000"
    environment:
      - NODE_ENV=${NODE_ENV:-development}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://backend:8000}
    volumes:
      # Bind mount para hot reload (desenvolvimento)
      - ./frontend:/app
      - /app/node_modules  # Anon volume para node_modules
      - /app/.next         # Anon volume para cache do Next.js
    depends_on:
      - backend
    networks:
      - visionflow-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # ============================================
  # Backend Service (FastAPI + Python)
  # ============================================
  backend:
    container_name: visionflow-backend
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        - PYTHON_ENV=${PYTHON_ENV:-development}
    ports:
      - "${BACKEND_PORT:-8000}:8000"
    environment:
      - PYTHON_ENV=${PYTHON_ENV:-development}
      - UPLOAD_MAX_SIZE=${UPLOAD_MAX_SIZE:-52428800}
      - MODELS_CACHE_DIR=${MODELS_CACHE_DIR:-/app/models}
      - DOWNLOAD_MODELS_ON_START=${DOWNLOAD_MODELS_ON_START:-true}
    volumes:
      # Bind mount para desenvolvimento
      - ./backend:/app
      # Named volumes para persistência
      - visionflow-uploads:/app/uploads
      - visionflow-exports:/app/exports
      - visionflow-models:/app/models
      - visionflow-presets:/app/presets
    networks:
      - visionflow-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    # Opcional: GPU support (requer NVIDIA Docker Toolkit)
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: 1
    #           capabilities: [gpu]

# ============================================
# Networks
# ============================================
networks:
  visionflow-network:
    driver: bridge
    name: visionflow-net

# ============================================
# Volumes
# ============================================
volumes:
  visionflow-uploads:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ${VOLUMES_PATH:-./volumes}/uploads
  
  visionflow-exports:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ${VOLUMES_PATH:-./volumes}/exports
  
  visionflow-models:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ${VOLUMES_PATH:-./volumes}/models
  
  visionflow-presets:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ${VOLUMES_PATH:-./volumes}/presets
```

---

## 🏗️ Dockerfiles

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build Next.js app
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ============================================
# Stage 3: Runner (Production)
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# ============================================
# Development Override
# ============================================
# Para desenvolvimento, usar docker-compose que monta volumes
# e executa `npm run dev` ao invés de build
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile

# ============================================
# Stage 1: Base
# ============================================
FROM python:3.11-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# ============================================
# Stage 2: Builder
# ============================================
FROM base AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Create virtual environment and install dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ============================================
# Stage 3: Runner
# ============================================
FROM base AS runner

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY . .

# Create directories for volumes
RUN mkdir -p /app/uploads /app/exports /app/models /app/presets && \
    chmod 777 /app/uploads /app/exports /app/models /app/presets

# Create non-root user
RUN useradd -m -u 1001 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run FastAPI with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

---

## 🔧 Comandos Úteis

### Ver Logs

```bash
# Todos os serviços
docker compose logs -f

# Apenas frontend
docker compose logs -f frontend

# Apenas backend
docker compose logs -f backend

# Últimas 100 linhas
docker compose logs --tail=100
```

### Rebuild Containers

```bash
# Rebuild tudo
docker compose up --build

# Rebuild apenas frontend
docker compose up --build frontend

# Rebuild sem cache
docker compose build --no-cache
```

### Executar Comandos em Containers

```bash
# Shell no backend
docker compose exec backend bash

# Shell no frontend
docker compose exec frontend sh

# Rodar migrações (exemplo)
docker compose exec backend python manage.py migrate

# Instalar nova dependência
docker compose exec backend pip install nome-pacote
```

### Gerenciar Volumes

```bash
# Listar volumes
docker volume ls

# Inspecionar volume
docker volume inspect visionflow-uploads

# Remover volumes não utilizados
docker volume prune

# Backup de volume
docker run --rm -v visionflow-uploads:/data -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup.tar.gz -C /data .

# Restaurar volume
docker run --rm -v visionflow-uploads:/data -v $(pwd):/backup \
  alpine tar xzf /backup/uploads-backup.tar.gz -C /data
```

### Monitorar Recursos

```bash
# Stats em tempo real
docker stats

# Uso de disco
docker system df

# Limpar tudo (cuidado!)
docker system prune -a --volumes
```

---

## 🛠️ Desenvolvimento

### Hot Reload

O setup atual suporta hot reload para desenvolvimento:

- **Frontend**: Next.js detecta mudanças em `./frontend/src` e recarrega automaticamente
- **Backend**: Uvicorn com `--reload` detecta mudanças em `./backend` e reinicia

### Adicionar Dependências

#### Frontend

```bash
# Executar dentro do container
docker compose exec frontend npm install nome-pacote

# Ou localmente (se tem Node.js instalado)
cd frontend
npm install nome-pacote
docker compose restart frontend
```

#### Backend

```bash
# Executar dentro do container
docker compose exec backend pip install nome-pacote

# Atualizar requirements.txt
docker compose exec backend pip freeze > requirements.txt

# Rebuild para persistir
docker compose up --build backend
```

### Debug

#### Frontend (Next.js)

1. Adicionar ao `package.json`:
```json
"scripts": {
  "dev:debug": "NODE_OPTIONS='--inspect=0.0.0.0:9229' next dev"
}
```

2. Modificar `docker-compose.yml`:
```yaml
frontend:
  command: npm run dev:debug
  ports:
    - "3000:3000"
    - "9229:9229"  # Debug port
```

3. Conectar VS Code Debugger (`.vscode/launch.json`):
```json
{
  "type": "node",
  "request": "attach",
  "name": "Docker: Attach to Next.js",
  "port": 9229,
  "address": "localhost",
  "restart": true
}
```

#### Backend (FastAPI)

1. Modificar `docker-compose.yml`:
```yaml
backend:
  command: python -m debugpy --listen 0.0.0.0:5678 -m uvicorn main:app --reload --host 0.0.0.0
  ports:
    - "8000:8000"
    - "5678:5678"  # Debug port
```

2. Conectar VS Code Debugger:
```json
{
  "type": "python",
  "request": "attach",
  "name": "Docker: Attach to FastAPI",
  "port": 5678,
  "host": "localhost",
  "pathMappings": [
    {
      "localRoot": "${workspaceFolder}/backend",
      "remoteRoot": "/app"
    }
  ]
}
```

---

## ⚡ Otimizações

### Build Cache

Docker usa cache de layers. Para aproveitar:

1. **Ordenar comandos** do menos frequente ao mais frequente
2. **Copiar `package.json` antes** de copiar código fonte
3. **Multi-stage builds** para reduzir tamanho da imagem final

### Reduzir Tamanho de Imagens

```bash
# Ver tamanho das imagens
docker images | grep visionflow

# Usar Alpine base images (menores)
# Frontend: node:20-alpine (~120MB vs node:20 ~900MB)
# Backend: python:3.11-slim (~150MB vs python:3.11 ~900MB)
```

### GPU Acceleration (Opcional)

Para acelerar inferência de IA:

1. **Instalar NVIDIA Docker Toolkit**:
```bash
# Ubuntu/Debian
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update && sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker
```

2. **Descomentar seção GPU** em `docker-compose.yml`:
```yaml
backend:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

3. **Testar**:
```bash
docker compose exec backend python -c "import torch; print(torch.cuda.is_available())"
# True
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Ver o que está usando a porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou mudar porta no .env
FRONTEND_PORT=3001
```

### Container Keeps Restarting

```bash
# Ver logs
docker compose logs backend

# Possíveis causas:
# - Erro no código (syntax error)
# - Dependência faltando
# - Porta já em uso
```

### Out of Disk Space

```bash
# Limpar containers parados
docker container prune

# Limpar imagens não utilizadas
docker image prune -a

# Limpar volumes não utilizados
docker volume prune

# Limpar tudo (CUIDADO!)
docker system prune -a --volumes
```

### Slow Performance

```bash
# Aumentar recursos do Docker Desktop
# Settings → Resources → CPU/Memory

# Verificar uso de recursos
docker stats

# Reduzir logs
docker compose logs --tail=100
```

### Models Not Downloading

```bash
# Verificar conectividade
docker compose exec backend curl -I https://huggingface.co

# Download manual
docker compose exec backend python -c "
from transformers import AutoModel
model = AutoModel.from_pretrained('Intel/dpt-large')
"

# Verificar espaço em disco
df -h ./volumes/models
```

### Permission Denied (Volumes)

```bash
# Ajustar permissões
sudo chown -R $USER:$USER ./volumes

# Ou criar volumes com permissões corretas
mkdir -p volumes/{uploads,exports,models,presets}
chmod -R 777 volumes
```

---

## 📊 Makefile (Opcional)

Criar `Makefile` na raiz para simplificar comandos:

```makefile
.PHONY: up down build logs restart clean help

up: ## Start containers
	docker compose up -d

down: ## Stop containers
	docker compose down

build: ## Build containers
	docker compose up --build -d

logs: ## View logs
	docker compose logs -f

restart: ## Restart containers
	docker compose restart

clean: ## Remove containers, images, and volumes
	docker compose down -v
	docker system prune -af

shell-frontend: ## Open shell in frontend container
	docker compose exec frontend sh

shell-backend: ## Open shell in backend container
	docker compose exec backend bash

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
```

Uso:

```bash
make up        # Start containers
make logs      # View logs
make clean     # Clean everything
make help      # Show all commands
```

---

## 🚀 Deploy para Produção

### Considerações

1. **Não usar bind mounts** em produção (apenas volumes nomeados)
2. **Remover `--reload`** do Uvicorn
3. **Usar variáveis de ambiente** para secrets (não hardcode)
4. **Habilitar HTTPS** (via reverse proxy: nginx, Traefik)
5. **Adicionar autenticação** se expor API publicamente

### Exemplo docker-compose.prod.yml

```yaml
version: '3.8'

services:
  frontend:
    image: visionflow-frontend:latest
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.visionflow.com
    restart: always

  backend:
    image: visionflow-backend:latest
    ports:
      - "8000:8000"
    environment:
      - PYTHON_ENV=production
    volumes:
      - visionflow-uploads:/app/uploads
      - visionflow-exports:/app/exports
      - visionflow-models:/app/models
    restart: always

volumes:
  visionflow-uploads:
  visionflow-exports:
  visionflow-models:
```

Deploy:

```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## 📚 Documentação Relacionada

- [ROADMAP.md](./ROADMAP.md) - Planejamento de desenvolvimento
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura do sistema
- [SCREENS_SPECIFICATION.md](./SCREENS_SPECIFICATION.md) - Especificação de telas
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Estrutura de código
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guia de contribuição

---

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/GabrielaMoretti/VISIONFLOW/issues)
- **Discussions**: [GitHub Discussions](https://github.com/GabrielaMoretti/VISIONFLOW/discussions)
- **Docker Docs**: [docs.docker.com](https://docs.docker.com/)

---

**Última Atualização**: Fevereiro 2026
**Versão**: 1.0
**Mantenedor**: Time VISIONFLOW
