# VISIONFLOW - Arquitetura do Sistema

## 📋 Sumário Executivo

**VISIONFLOW** é um editor de imagens profissional focado em processamento físico e óptico, implementado como um **protótipo Web com Docker**. Este documento descreve a arquitetura completa do sistema, decisões tecnológicas e justificativas.

---

## 🏗️ Visão Geral da Arquitetura

### Diagrama de Containers

```
┌────────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Frontend React/Next.js                                  │  │
│  │  - Fabric.js (Canvas Editor)                             │  │
│  │  - WebGL Shaders (GLSL)                                  │  │
│  │  - TensorFlow.js (Client-side IA)                        │  │
│  │  - Zustand (State Management)                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST API
┌────────────────────────────────────────────────────────────────┐
│                     DOCKER HOST                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Container: visionflow-frontend (Node.js)                │  │
│  │  - Next.js 14+ (SSR/SSG)                                 │  │
│  │  - Port: 3000                                            │  │
│  │  - Volume: ./frontend → /app                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↕                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Container: visionflow-backend (Python)                  │  │
│  │  - FastAPI/Flask                                         │  │
│  │  - OpenCV, Pillow, NumPy                                 │  │
│  │  - TensorFlow/PyTorch (IA models)                        │  │
│  │  - Port: 8000                                            │  │
│  │  - Volume: ./backend → /app                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↕                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Volume: visionflow-data                                 │  │
│  │  - Uploads (/uploads)                                    │  │
│  │  - Exports (/exports)                                    │  │
│  │  - AI Models Cache (/models)                             │  │
│  │  - User Presets (/presets)                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológica

### Frontend (Client-Side)

#### Framework
- **Next.js 14+** (React 18+)
  - **Justificativa**: SSR para SEO, file-based routing, otimizações automáticas
  - **Alternativa considerada**: Create React App (descartado por falta de SSR)

#### Canvas Editor
- **Fabric.js** ou **Konva.js**
  - **Justificativa**: API madura para manipulação de canvas, layer system built-in
  - **Decisão**: Fabric.js (melhor suporte a eventos e transforms)

#### Processamento GPU
- **WebGL 2.0** com **GLSL Shaders**
  - **Uso**: Filtros em tempo real, color grading, lens effects
  - **Fallback**: Canvas 2D API para browsers sem WebGL

#### State Management
- **Zustand** (recomendado) ou **Redux Toolkit**
  - **Justificativa**: Zustand é mais leve e simples que Redux
  - **Decisão final**: Zustand para protótipo, migração para Redux se necessário

#### IA Client-Side
- **TensorFlow.js** ou **ONNX Runtime Web**
  - **Uso**: Modelos leves (face detection, smart crop)
  - **Modelos pesados**: Offload para backend

#### Styling
- **Tailwind CSS** + **shadcn/ui** (componentes)
  - **Justificativa**: Desenvolvimento rápido, design system consistente

### Backend (Server-Side)

#### Framework
- **FastAPI** (Python 3.11+)
  - **Justificativa**: Performance, async/await nativo, auto-documentação (Swagger)
  - **Alternativa**: Flask (mais simples, mas menos features)

#### Processamento de Imagem
- **OpenCV** (cv2)
  - **Uso**: Visão computacional, segmentação, filtros avançados
- **Pillow** (PIL)
  - **Uso**: Manipulação básica, conversão de formatos
- **Sharp** (via subprocess ou imagemagick)
  - **Uso**: Redimensionamento ultra-rápido (se necessário)

#### IA e Machine Learning
- **TensorFlow** ou **PyTorch**
  - **Modelos**:
    - **MiDaS**: Depth estimation (Intel ISL)
    - **U²-Net**: Background removal (XueBin Qin)
    - **Real-ESRGAN**: Super-resolution (Tencent ARC Lab)
- **ONNX Runtime**
  - **Justificativa**: Inferência otimizada, suporte multi-framework

#### API
- **RESTful API** (JSON)
  - Endpoints: `/upload`, `/process`, `/export`, `/models`
- **WebSocket** (opcional, futuro)
  - Para processamento em tempo real e progress updates

### Infraestrutura

#### Docker
- **Docker Compose**
  - **Serviços**:
    - `frontend` (Node.js 20 Alpine)
    - `backend` (Python 3.11 Slim)
  - **Networks**: `visionflow-network` (bridge)
  - **Volumes**: 
    - `visionflow-data` (persistência)
    - `.:/app` (bind mount para desenvolvimento)

#### Persistência
- **Sistema de Arquivos** (volumes Docker)
  - `/uploads`: Imagens enviadas
  - `/exports`: Imagens processadas
  - `/models`: Cache de modelos de IA
  - `/presets`: Presets de usuário (.json, .vip)

#### (Futuro) Banco de Dados
- **SQLite** (para protótipo)
  - **Uso**: Metadados de projetos, histórico de edições
- **PostgreSQL** (para produção)
  - **Justificativa**: Escalabilidade, suporte robusto

---

## 📊 Fluxo de Dados

### 1. Upload de Imagem

```
User Browser
    ↓ [POST /api/upload - multipart/form-data]
Frontend (Next.js)
    ↓ [Validate size/format]
    ↓ [Forward to backend]
Backend (FastAPI)
    ↓ [Save to /uploads]
    ↓ [Extract EXIF]
    ↓ [Generate thumbnail]
    ↓ [Return metadata + URLs]
Frontend
    ↓ [Display in canvas]
Fabric.js Canvas
```

### 2. Processamento de Cor (Client-Side)

```
User Interaction (Slider/Curve)
    ↓
Zustand Store Update
    ↓
React Re-render
    ↓
WebGL Shader Application
    ↓ [GLSL color grading shader]
Canvas Update (Real-time)
```

### 3. Processamento de IA (Server-Side)

```
User Request (Background Removal)
    ↓ [POST /api/process/background-removal]
Frontend
    ↓
Backend (FastAPI)
    ↓ [Load image from /uploads]
    ↓ [Load U²-Net model]
    ↓ [Run inference]
    ↓ [Generate mask]
    ↓ [Save mask to /exports]
    ↓ [Return mask URL]
Frontend
    ↓ [Composite with original]
Fabric.js Canvas
```

### 4. Exportação

```
User Click "Export"
    ↓
Frontend
    ↓ [Render canvas to blob]
    ↓ [POST /api/export - {format, quality, metadata}]
Backend
    ↓ [Convert to target format]
    ↓ [Optimize (compression)]
    ↓ [Save to /exports]
    ↓ [Return download URL]
Frontend
    ↓ [Trigger download]
User Downloads File
```

---

## 🎯 Decisões Arquiteturais

### Por que Web ao invés de React Native no Protótipo?

#### ✅ Vantagens da Abordagem Web

1. **Desenvolvimento Mais Rápido**
   - Ecosystem maduro (npm, bundlers, hot reload)
   - Debugging superior (Chrome DevTools)
   - Deploy simplificado (Docker + nginx)

2. **Menor Complexidade Inicial**
   - Sem necessidade de Expo/React Native build tools
   - Sem problemas de compatibilidade mobile (iOS vs Android)
   - WebGL funciona uniformemente em browsers modernos

3. **Performance Adequada**
   - WebGL 2.0 + Web Workers oferecem performance GPU aceitável
   - TensorFlow.js otimizado para WebAssembly
   - Server-side offloading para operações pesadas

4. **Iteração Rápida**
   - Hot reload instantâneo
   - Sem rebuilds de apps nativos
   - Testes em múltiplos browsers sem dispositivos físicos

#### ⚠️ Desvantagens (Trade-offs Aceitos)

1. **Sem Acesso Nativo**
   - Não pode acessar camera/galeria diretamente (workaround: file picker web)
   - Sem integração com Photos app

2. **Performance Limitada**
   - Processamento de IA mais lento que nativo (mitigado com backend)
   - Memória limitada do browser (mitigado com tile processing)

3. **Experiência Mobile Limitada**
   - Não é um app nativo (workaround: PWA futuro)

#### 🔄 Estratégia de Migração Futura

**Fase 1**: Protótipo Web (atual)
- Validar conceitos
- Testar algoritmos
- Obter feedback de usuários

**Fase 2**: Progressive Web App (PWA)
- Adicionar manifest.json
- Service Workers para cache
- Instalar no home screen

**Fase 3**: Electron Desktop App
- Empacotar com Electron
- Acesso a sistema de arquivos nativo
- Distribuição para Windows/Mac/Linux

**Fase 4**: (Opcional) React Native Mobile
- Reusar lógica de negócio (TypeScript)
- UI adaptada para mobile
- Acesso a APIs nativas

---

## 🧩 Módulos e Responsabilidades

### Frontend Modules

#### `/src/lib/canvas`
**Responsabilidade**: Gerenciamento do Fabric.js canvas
- Inicialização do canvas
- Layer management (add, remove, reorder)
- Transform controls (pan, zoom, rotate)
- Event handling (mouse, touch, keyboard)

#### `/src/lib/shaders`
**Responsabilidade**: WebGL shaders GLSL
- Color grading shaders
- Bokeh/blur shaders
- Distortion shaders
- LUT application shaders

#### `/src/lib/ai`
**Responsabilidade**: TensorFlow.js client-side
- Face detection (FaceAPI.js)
- Smart crop suggestions
- (Futuro) Lightweight segmentation

#### `/src/store`
**Responsabilidade**: Zustand state management
- Image state (current image, layers, history)
- Editor state (active tool, zoom level, cursor)
- Settings state (preferences, language)

#### `/src/components`
**Responsabilidade**: React UI components
- `Dashboard/`: Project management
- `Studio/`: Main editor workspace
- `Blueprints/`: Preset/template management
- `shared/`: Reusable components (Button, Slider, Modal)

### Backend Modules

#### `/api/routes`
**Responsabilidade**: FastAPI route handlers
- `upload.py`: Image upload endpoint
- `process.py`: Image processing endpoints
- `export.py`: Export endpoint
- `models.py`: AI model management

#### `/processing`
**Responsabilidade**: Core image processing logic
- `depth_map.py`: MiDaS depth estimation
- `upscaling.py`: ESRGAN super-resolution
- `segmentation.py`: U²-Net background removal
- `color_flow.py`: Color grading (curves, LUTs)

#### `/models`
**Responsabilidade**: AI model cache
- MiDaS weights (downloaded on first use)
- U²-Net weights
- ESRGAN weights
- Model loading utilities

---

## 🔐 Segurança e Validação

### Upload Security

1. **File Type Validation**
   - Whitelist: `.jpg`, `.jpeg`, `.png`, `.webp`, `.tiff`
   - Magic number verification (não confiar apenas em extensão)

2. **File Size Limits**
   - Max: 50MB (configurável)
   - Client-side check (UX) + server-side enforcement (segurança)

3. **Sanitização**
   - Remover EXIF potencialmente perigoso (GPS, autor, etc.)
   - Re-encode imagem para eliminar payloads maliciosos

### API Security

1. **Rate Limiting**
   - 100 requests/min por IP (ajustável)
   - Slowloris protection

2. **CORS**
   - Whitelist de origens permitidas
   - Credentials: `same-origin`

3. **(Futuro) Autenticação**
   - JWT tokens
   - OAuth2 (Google, GitHub)

---

## ⚡ Performance e Otimização

### Frontend Optimizations

1. **Code Splitting**
   - Next.js dynamic imports
   - Lazy load de componentes pesados (AI modules)

2. **Image Lazy Loading**
   - Native `loading="lazy"`
   - Intersection Observer para thumbnails

3. **WebGL Optimization**
   - Texture pooling (reusar texturas)
   - Shader compilation cache
   - RequestAnimationFrame para rendering

4. **Web Workers**
   - Offload heavy computations (histogram, palette extraction)
   - Comlink para API simplificada

### Backend Optimizations

1. **Async Processing**
   - FastAPI async/await para I/O
   - Background tasks (via `BackgroundTasks`)

2. **Model Caching**
   - Load models na inicialização (warm-up)
   - Manter em memória (não recarregar por request)

3. **Image Caching**
   - Cache de thumbnails
   - ETags para conditional requests

4. **Batch Processing**
   - Queue system (Celery futuro)
   - Processar múltiplas imagens em paralelo

---

## 📏 Escalabilidade

### Vertical Scaling (Curto Prazo)

- Aumentar recursos do container Docker
- GPU acceleration (CUDA para TensorFlow)

### Horizontal Scaling (Longo Prazo)

1. **Load Balancer**
   - Nginx ou Traefik
   - Múltiplas instâncias do backend

2. **Microservices**
   - Separar processamento de IA em serviço dedicado
   - Message queue (RabbitMQ, Redis)

3. **CDN**
   - Servir assets estáticos (Next.js build)
   - Cache de imagens exportadas

4. **Object Storage**
   - S3-compatible (MinIO, AWS S3)
   - Substituir volumes Docker por object storage

---

## 🧪 Testabilidade

### Frontend Tests

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Cypress ou Playwright
- **Visual Regression**: Percy ou Chromatic

### Backend Tests

- **Unit Tests**: pytest
- **Integration Tests**: TestClient (FastAPI)
- **Load Tests**: Locust ou k6

---

## 📚 Documentação Relacionada

- [ROADMAP.md](./ROADMAP.md) - Planejamento de desenvolvimento por camadas
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Configuração do Docker
- [SCREENS_SPECIFICATION.md](./SCREENS_SPECIFICATION.md) - Especificação de telas
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Estrutura de código
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guia de contribuição

---

**Última Atualização**: Fevereiro 2026
**Arquiteto**: Time VISIONFLOW
**Revisão**: v2.0 (Web + Docker Prototype)
