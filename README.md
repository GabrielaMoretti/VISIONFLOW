# 🎥 VISIONFLOW

**Editor de Imagens Profissional com Processamento Físico e Óptico**

> Transforme imagens em qualidade cinematográfica através de processamento baseado em física óptica — criação multi-plataforma sem regeneração por IA.

---

## 📋 Visão Geral

**VISIONFLOW** é um editor de imagens profissional desenvolvido como **protótipo Web com Docker**, focado em processamento físico e óptico para criadores contemporâneos, fotógrafos, artistas visuais e produtores de conteúdo multi-plataforma.

### Filosofia Central

> "A imagem não é recriada — ela é revelada."

VISIONFLOW manipula as propriedades físicas reais de luz, cor e características ópticas, respeitando a integridade da fotografia original. Diferente de editores baseados em IA que regeneram imagens, VISIONFLOW processa opticamente sem destruir a essência da captura.

---

## ✨ Funcionalidades Principais

### 🔵 **CORE ENGINE (Fundação)**
- Image Loader com suporte a JPEG, PNG, RAW
- Canvas Editor interativo (Fabric.js)
- Sistema de Camadas com blend modes e opacidade
- Export Engine otimizado (PNG/JPG/WebP)

### 🟢 **COLOR FLOW ENGINE**
- Palette Extractor (K-Means clustering)
- Tone Mapping (Shadows/Midtones/Highlights)
- Ajustes HSL precisos
- Sistema LUT (Lookup Tables 3D)

### 🟡 **VIRTUAL LENS RACK**
- Depth Map Generator (MiDaS via TensorFlow.js)
- Lens Blur com bokeh realista (WebGL)
- Simulação de Distorção (Barrel/Pincushion)
- Chromatic Aberration

### 🟠 **IA ASSISTIVA (Baixa Interferência)**
- Background Removal (SAM/U²-Net)
- Super-Resolution (ESRGAN)
- Noise Reduction (bilateral filter)
- Smart Crop com detecção facial

### 🔴 **MULTI-MODAL CAMPAIGN**
- Template System (Spotify Canvas, Instagram, YouTube)
- Safe Zone Overlay dinâmicas
- Batch Export organizado
- Preset Manager (VIP - Visual Identity Presets)

---

## 🗂️ Documentação

### Documentação Principal
- **[ROADMAP.md](./docs/ROADMAP.md)** - Planejamento de desenvolvimento por camadas funcionais
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Arquitetura Web + Docker completa
- **[SCREENS_SPECIFICATION.md](./docs/SCREENS_SPECIFICATION.md)** - Especificação detalhada das 7 telas
- **[DOCKER_SETUP.md](./docs/DOCKER_SETUP.md)** - Configuração completa do Docker
- **[PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)** - Estrutura de pastas frontend/backend
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guia para contribuidores

### Documentação Legada
- Ver `/docs/legacy/` para documentação da versão anterior (React Native/Electron)

---

## 🛠️ Stack Tecnológica

### Frontend (Next.js/React)
```
┌─────────────────────────────────────┐
│   Frontend Web (Next.js 14)         │
│   - Fabric.js (Canvas Editor)       │
│   - WebGL (Shaders GLSL)            │
│   - Zustand (State Management)      │
│   - TensorFlow.js (IA client-side)  │
└─────────────────────────────────────┘
```

- **Next.js 14+** - Framework React com SSR
- **Fabric.js** - Editor de canvas interativo
- **WebGL 2.0** - Processamento GPU (shaders GLSL)
- **Zustand** - Gerenciamento de estado
- **TensorFlow.js** - IA client-side (modelos leves)
- **Tailwind CSS + shadcn/ui** - Design system

### Backend (Python/FastAPI)
```
┌─────────────────────────────────────┐
│   Backend Python (FastAPI)          │
│   - OpenCV (Visão Computacional)    │
│   - Pillow (Image Processing)       │
│   - TensorFlow/PyTorch (IA)         │
│   - MiDaS, ESRGAN, U²-Net           │
└─────────────────────────────────────┘
```

- **FastAPI** - Framework assíncrono de alta performance
- **OpenCV** - Visão computacional e processamento de imagem
- **Pillow** - Manipulação de imagem
- **PyTorch/TensorFlow** - Modelos de IA (depth, upscaling, segmentation)
- **NumPy/SciPy** - Computação científica

### Infraestrutura (Docker)
```
┌─────────────────────────────────────┐
│          Docker Compose             │
│   - Container Frontend (Node 20)    │
│   - Container Backend (Python 3.11) │
│   - Volumes para persistência       │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start com Docker

### Pré-requisitos

- **Docker** 24.0+ ([Instalar Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** 2.20+ (incluído no Docker Desktop)
- **Git** para clonar o repositório

### Instalação e Execução

```bash
# 1. Clonar repositório
git clone https://github.com/GabrielaMoretti/VISIONFLOW.git
cd VISIONFLOW

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Iniciar containers (build + run)
docker compose up --build

# 4. Acessar aplicação
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Comandos Úteis

```bash
# Parar containers
docker compose down

# Ver logs
docker compose logs -f

# Rebuild containers
docker compose up --build

# Executar testes
docker compose exec backend pytest
docker compose exec frontend npm test

# Acessar shell do container
docker compose exec backend bash
docker compose exec frontend sh
```

Para instruções detalhadas, consulte [DOCKER_SETUP.md](./docs/DOCKER_SETUP.md).

---

## 📐 Estrutura do Projeto

```
visionflow/
├── frontend/              # Aplicação Next.js/React
│   ├── src/
│   │   ├── app/           # Next.js App Router (pages)
│   │   ├── components/    # Componentes React
│   │   ├── lib/           # Lógica de negócio
│   │   │   ├── canvas/    # Fabric.js engine
│   │   │   ├── shaders/   # WebGL GLSL shaders
│   │   │   └── ai/        # TensorFlow.js
│   │   ├── store/         # Zustand state
│   │   └── services/      # API calls
│   ├── Dockerfile
│   └── package.json
│
├── backend/               # API Python/FastAPI
│   ├── api/
│   │   └── routes/        # Endpoints REST
│   ├── processing/        # Processamento de imagem
│   │   ├── depth_map.py   # MiDaS
│   │   ├── upscaling.py   # ESRGAN
│   │   ├── segmentation.py # U²-Net
│   │   └── color_flow.py
│   ├── models/            # Cache de modelos IA
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml     # Orquestração de containers
├── docs/                  # Documentação completa
│   ├── ROADMAP.md
│   ├── ARCHITECTURE.md
│   ├── SCREENS_SPECIFICATION.md
│   ├── DOCKER_SETUP.md
│   ├── PROJECT_STRUCTURE.md
│   └── legacy/            # Docs da versão anterior
└── volumes/               # Volumes Docker (gitignored)
    ├── uploads/
    ├── exports/
    ├── models/
    └── presets/
```

Veja [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) para detalhes completos.

---

## 🎯 Roadmap de Alto Nível

O desenvolvimento segue uma arquitetura modular em **6 camadas de funcionalidades**:

### 🔵 Camada 1: CORE ENGINE (Semanas 1-4)
- Image Loader, Canvas Editor, Layer System, Export Engine

### 🟢 Camada 2: COLOR FLOW ENGINE (Semanas 5-8)
- Palette Extractor, Tone Mapping, HSL Adjustments, LUT System

### 🟡 Camada 3: VIRTUAL LENS RACK (Semanas 9-13)
- Depth Map, Lens Blur, Distortion, Chromatic Aberration

### 🟠 Camada 4: IA ASSISTIVA (Semanas 14-18)
- Background Removal, Super-Resolution, Denoising, Smart Crop

### 🔴 Camada 5: MULTI-MODAL CAMPAIGN (Semanas 19-22)
- Template System, Safe Zones, Batch Export, Preset Manager

### 🟣 Camada 6: INTERFACE & UX (Semanas 23-24)
- Tooltips, Before/After, History/Undo, Guided Workflow

**Veja o [ROADMAP.md](./docs/ROADMAP.md) completo para detalhes de cada sprint.**

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia nosso [CONTRIBUTING.md](./CONTRIBUTING.md) antes de submeter PRs.

### Diretrizes de Desenvolvimento

1. Seguir padrões de código TypeScript/Python
2. Escrever testes para novas funcionalidades
3. Documentar APIs públicas
4. Manter módulos focados e com responsabilidade única
5. Otimizar para performance

### Setup para Desenvolvimento

```bash
# Clonar repositório
git clone https://github.com/GabrielaMoretti/VISIONFLOW.git
cd VISIONFLOW

# Copiar .env
cp .env.example .env

# Iniciar em modo desenvolvimento (com hot reload)
docker compose up

# Em outro terminal, acessar container para executar comandos
docker compose exec backend bash
docker compose exec frontend sh
```

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para instruções completas.

---

## 📖 Conceitos Fundamentais

### Edição Não-Destrutiva
Todos os ajustes são aplicados como modificações paramétricas que podem ser alteradas ou removidas a qualquer momento sem degradar a imagem original.

### Processamento Baseado em Física
Ao invés de aplicar filtros digitais, VISIONFLOW simula a física da luz, lentes e cor para alcançar resultados naturais e profissionais.

### Sistema de Camadas
O engine analisa a estrutura da imagem e cria camadas separadas para foreground, background, profundidade, materiais e iluminação — permitindo ajustes precisos e isolados.

### Colorimetria Profissional
Usa espaços de cor perceptuais (LAB, LCH, OKLCH) e ferramentas padrão da indústria (ΔE2000, LUTs 3D) para garantir representação precisa de cor em diferentes dispositivos.

### Multi-Modal Campaign
Sistema integrado para criar campanhas multi-plataforma (Instagram, YouTube, Spotify) com templates, safe zones e batch export otimizado por destino.

---

## 🚧 Status do Projeto

- **Fase Atual**: Planejamento e Documentação ✅
- **Próximo Marco**: Alpha 0.1 - Core Engine (Semana 4)
- **Versão**: 0.1.0 (Web Prototype)

### Por que Web ao invés de React Native?

Este é um **protótipo Web com Docker** para:
- ✅ Desenvolvimento mais rápido
- ✅ Debugging superior (Chrome DevTools)
- ✅ Deploy simplificado
- ✅ Iteração rápida de features

**Futura migração**: PWA → Electron Desktop → (opcional) React Native Mobile

Veja justificativa completa em [ARCHITECTURE.md](./docs/ARCHITECTURE.md#decisões-arquiteturais).

---

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 Agradecimentos

VISIONFLOW é construído sobre o trabalho de muitos projetos open-source:
- **OpenCV** - Visão computacional
- **Fabric.js** - Canvas manipulation
- **Next.js** - React framework
- **FastAPI** - Python web framework
- **TensorFlow** - Machine learning
- **Intel MiDaS** - Depth estimation
- **Real-ESRGAN** - Super-resolution
- **U²-Net** - Segmentation

---

## 📬 Contato

- **Issues**: [GitHub Issues](https://github.com/GabrielaMoretti/VISIONFLOW/issues)
- **Discussions**: [GitHub Discussions](https://github.com/GabrielaMoretti/VISIONFLOW/discussions)

---

## 🌟 Suporte ao Projeto

Se você acha este projeto útil, considere:
- ⭐ Dar uma estrela no repositório
- 🐛 Reportar bugs
- 💡 Sugerir features
- 🤝 Contribuir com código
- 📖 Melhorar a documentação

---

**Construído com ❤️ para criadores que exigem qualidade profissional**