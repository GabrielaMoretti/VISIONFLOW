# VISIONFLOW - Estrutura do Projeto

## 📋 Visão Geral

Este documento descreve a organização de pastas e arquivos do projeto VISIONFLOW, seguindo a arquitetura **Web + Docker** com separação clara entre frontend (Next.js/React) e backend (Python/FastAPI).

---

## 🏗️ Estrutura de Alto Nível

```
visionflow/
├── frontend/                   # Aplicação Next.js/React
├── backend/                    # API FastAPI/Python
├── docker-compose.yml          # Orquestração de containers
├── .env.example                # Template de variáveis
├── docs/                       # Documentação
├── volumes/                    # Volumes Docker (gitignored)
├── .gitignore
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── Makefile                    # Comandos simplificados (opcional)
```

---

## 📂 Frontend Structure

```
frontend/
├── Dockerfile
├── .dockerignore
├── next.config.js
├── package.json
├── package-lock.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.json
├── .prettierrc
│
├── public/                     # Assets estáticos
│   ├── icons/
│   ├── images/
│   └── fonts/
│
└── src/
    ├── app/                    # Next.js 14 App Router
    │   ├── layout.tsx          # Root layout
    │   ├── page.tsx            # Home page (Dashboard)
    │   ├── globals.css         # Global styles
    │   ├── dashboard/
    │   │   └── page.tsx        # Dashboard de Projetos
    │   ├── campaign/
    │   │   └── page.tsx        # Arquiteto de Funil
    │   ├── blueprints/
    │   │   ├── page.tsx        # Biblioteca de Blueprints
    │   │   └── [id]/
    │   │       └── page.tsx    # Gestor de Blueprint
    │   ├── studio/
    │   │   └── [projectId]/
    │   │       └── page.tsx    # Estúdio de Criação
    │   ├── preview/
    │   │   └── page.tsx        # Centro de Preview
    │   └── export/
    │       └── page.tsx        # Central de Exportação
    │
    ├── components/             # Componentes React
    │   ├── Dashboard/
    │   │   ├── ProjectCard.tsx
    │   │   ├── ProjectGrid.tsx
    │   │   ├── QuickActions.tsx
    │   │   └── UploadZone.tsx
    │   │
    │   ├── Studio/
    │   │   ├── Canvas/
    │   │   │   ├── FabricCanvas.tsx
    │   │   │   ├── ZoomControls.tsx
    │   │   │   └── GridOverlay.tsx
    │   │   ├── Panels/
    │   │   │   ├── LayersPanel.tsx
    │   │   │   ├── ColorFlowPanel.tsx
    │   │   │   ├── VirtualLensPanel.tsx
    │   │   │   ├── AIToolsPanel.tsx
    │   │   │   └── AdjustmentsPanel.tsx
    │   │   ├── Toolbar/
    │   │   │   ├── MainToolbar.tsx
    │   │   │   └── ToolButton.tsx
    │   │   └── Controls/
    │   │       ├── CurveEditor.tsx
    │   │       ├── ColorPicker.tsx
    │   │       └── SliderControl.tsx
    │   │
    │   ├── Blueprints/
    │   │   ├── BlueprintCard.tsx
    │   │   ├── BlueprintEditor.tsx
    │   │   ├── PaletteDisplay.tsx
    │   │   └── LUTSelector.tsx
    │   │
    │   ├── Campaign/
    │   │   ├── FunnelStage.tsx
    │   │   ├── AssetList.tsx
    │   │   ├── Timeline.tsx
    │   │   └── Checklist.tsx
    │   │
    │   ├── Preview/
    │   │   ├── DeviceFrame.tsx
    │   │   ├── SafeZoneOverlay.tsx
    │   │   └── ComplianceChecker.tsx
    │   │
    │   ├── Export/
    │   │   ├── ExportQueue.tsx
    │   │   ├── FormatSelector.tsx
    │   │   └── ProgressModal.tsx
    │   │
    │   └── shared/              # Componentes reutilizáveis
    │       ├── ui/              # shadcn/ui components
    │       │   ├── button.tsx
    │       │   ├── slider.tsx
    │       │   ├── dropdown.tsx
    │       │   ├── modal.tsx
    │       │   └── toast.tsx
    │       ├── Button.tsx
    │       ├── Input.tsx
    │       ├── Card.tsx
    │       ├── Modal.tsx
    │       └── LoadingSpinner.tsx
    │
    ├── lib/                    # Lógica de negócio
    │   ├── canvas/
    │   │   ├── fabricSetup.ts
    │   │   ├── layerManager.ts
    │   │   ├── transformControls.ts
    │   │   └── eventHandlers.ts
    │   │
    │   ├── shaders/
    │   │   ├── colorGrading.glsl
    │   │   ├── bokeh.glsl
    │   │   ├── distortion.glsl
    │   │   ├── grain.glsl
    │   │   └── shaderManager.ts
    │   │
    │   ├── ai/
    │   │   ├── tfjs-init.ts
    │   │   ├── faceDetection.ts
    │   │   ├── smartCrop.ts
    │   │   └── modelLoader.ts
    │   │
    │   ├── color/
    │   │   ├── colorSpaces.ts
    │   │   ├── paletteExtractor.ts
    │   │   ├── curves.ts
    │   │   ├── lut.ts
    │   │   └── toneMapping.ts
    │   │
    │   └── utils/
    │       ├── imageUtils.ts
    │       ├── fileUtils.ts
    │       ├── mathUtils.ts
    │       └── validation.ts
    │
    ├── store/                  # Zustand state management
    │   ├── index.ts            # Root store
    │   ├── slices/
    │   │   ├── projectSlice.ts
    │   │   ├── editorSlice.ts
    │   │   ├── layersSlice.ts
    │   │   ├── historySlice.ts
    │   │   └── settingsSlice.ts
    │   └── middleware/
    │       └── historyMiddleware.ts
    │
    ├── hooks/                  # Custom React hooks
    │   ├── useCanvas.ts
    │   ├── useImageUpload.ts
    │   ├── useKeyboardShortcuts.ts
    │   ├── useAutoSave.ts
    │   └── useDebounce.ts
    │
    ├── types/                  # TypeScript types
    │   ├── project.types.ts
    │   ├── layer.types.ts
    │   ├── color.types.ts
    │   ├── blueprint.types.ts
    │   ├── export.types.ts
    │   └── api.types.ts
    │
    ├── constants/
    │   ├── platforms.ts        # Platform specs (IG, YT, etc.)
    │   ├── blendModes.ts
    │   ├── fileFormats.ts
    │   └── presets.ts
    │
    └── services/               # API calls
        ├── api.ts              # Axios/Fetch setup
        ├── projectService.ts
        ├── uploadService.ts
        ├── processingService.ts
        └── exportService.ts
```

---

## 📂 Backend Structure

```
backend/
├── Dockerfile
├── .dockerignore
├── requirements.txt
├── requirements-dev.txt
├── .env
├── pytest.ini
│
├── main.py                     # FastAPI app entry point
│
├── api/                        # API routes
│   ├── __init__.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── health.py           # Health check endpoint
│   │   ├── upload.py           # Image upload
│   │   ├── projects.py         # Project CRUD
│   │   ├── processing.py       # Image processing
│   │   ├── export.py           # Export endpoints
│   │   ├── blueprints.py       # Blueprint management
│   │   └── models.py           # AI model management
│   │
│   ├── dependencies.py         # FastAPI dependencies
│   ├── middleware.py           # Custom middleware
│   └── exceptions.py           # Custom exceptions
│
├── processing/                 # Core image processing
│   ├── __init__.py
│   │
│   ├── depth_map.py            # MiDaS depth estimation
│   ├── upscaling.py            # ESRGAN super-resolution
│   ├── segmentation.py         # U²-Net background removal
│   ├── denoising.py            # Bilateral filter
│   │
│   ├── color_flow.py           # Color processing
│   │   # - Palette extraction (K-Means)
│   │   # - Tone mapping
│   │   # - HSL adjustments
│   │   # - LUT application
│   │
│   ├── lens_simulation.py      # Virtual lens effects
│   │   # - Distortion
│   │   # - Chromatic aberration
│   │   # - Vignette
│   │
│   └── utils/
│       ├── image_io.py         # Load/save images
│       ├── validators.py       # Input validation
│       └── transformations.py  # Basic transforms
│
├── models/                     # AI model management
│   ├── __init__.py
│   ├── model_loader.py         # Download/load models
│   ├── midas_wrapper.py        # MiDaS wrapper
│   ├── esrgan_wrapper.py       # ESRGAN wrapper
│   ├── unet_wrapper.py         # U²-Net wrapper
│   └── cache/                  # Model weights (gitignored)
│       ├── midas/
│       ├── esrgan/
│       └── unet/
│
├── core/                       # Business logic
│   ├── __init__.py
│   ├── project.py              # Project management
│   ├── blueprint.py            # Blueprint logic
│   ├── export.py               # Export logic
│   └── settings.py             # App settings (Pydantic)
│
├── db/                         # Database (futuro)
│   ├── __init__.py
│   ├── database.py             # SQLite/PostgreSQL connection
│   ├── models.py               # SQLAlchemy models
│   └── crud.py                 # CRUD operations
│
├── schemas/                    # Pydantic schemas
│   ├── __init__.py
│   ├── upload.py
│   ├── project.py
│   ├── processing.py
│   ├── export.py
│   └── blueprint.py
│
├── tests/                      # Tests (pytest)
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   │   ├── test_color_flow.py
│   │   ├── test_depth_map.py
│   │   └── test_segmentation.py
│   ├── integration/
│   │   ├── test_api.py
│   │   └── test_processing_pipeline.py
│   └── fixtures/
│       └── sample_images/
│
└── scripts/                    # Utility scripts
    ├── download_models.py      # Pre-download AI models
    ├── benchmark.py            # Performance benchmarking
    └── migrate.py              # Database migrations
```

---

## 📂 Volumes Structure (Runtime)

```
volumes/                        # Gitignored, criado em runtime
├── uploads/                    # Uploaded images
│   ├── <user_id>/
│   │   └── <project_id>/
│   │       ├── original.jpg
│   │       └── thumbnail.jpg
│
├── exports/                    # Exported images
│   ├── <project_id>/
│   │   ├── instagram_story.png
│   │   ├── youtube_thumb.jpg
│   │   └── spotify_canvas.mp4
│
├── models/                     # AI model weights cache
│   ├── midas_v21_384.pt
│   ├── esrgan_x4.pth
│   └── u2net.pth
│
└── presets/                    # User blueprints
    ├── <user_id>/
    │   ├── moody_cinematic.vflow
    │   ├── vibrant_summer.vflow
    │   └── bw_film_noir.vflow
```

---

## 📦 Configuração de Arquivos

### Frontend: package.json

```json
{
  "name": "visionflow-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\""
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.0",
    "fabric": "^5.3.0",
    "@tensorflow/tfjs": "^4.17.0",
    "axios": "^1.6.0",
    "culori": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "lucide-react": "^0.315.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "typescript": "^5",
    "eslint": "^8",
    "prettier": "^3",
    "@typescript-eslint/eslint-plugin": "^6"
  }
}
```

### Backend: requirements.txt

```txt
# Web Framework
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6

# Image Processing
opencv-python==4.9.0.80
Pillow==10.2.0
numpy==1.26.3

# AI/ML
torch==2.1.2
torchvision==0.16.2
onnxruntime==1.17.0
# tensorflow==2.15.0  # Opcional, se usar TF

# Color Science
scikit-learn==1.4.0
scipy==1.12.0

# Database (futuro)
# sqlalchemy==2.0.25
# alembic==1.13.1

# Utilities
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
aiofiles==23.2.1

# Development
pytest==7.4.4
pytest-asyncio==0.23.3
httpx==0.26.0
black==24.1.0
ruff==0.1.14
```

### Frontend: tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/store/*": ["./src/store/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/constants/*": ["./src/constants/*"],
      "@/services/*": ["./src/services/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Backend: main.py

```python
"""
VISIONFLOW Backend - FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.routes import (
    health,
    upload,
    projects,
    processing,
    export,
    blueprints,
    models as models_route
)
from core.settings import settings
from models.model_loader import download_models_if_needed


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("🚀 Starting VISIONFLOW Backend...")
    
    if settings.DOWNLOAD_MODELS_ON_START:
        print("📥 Downloading AI models...")
        await download_models_if_needed()
    
    print("✅ Backend ready!")
    
    yield
    
    # Shutdown
    print("👋 Shutting down VISIONFLOW Backend...")


# Initialize FastAPI app
app = FastAPI(
    title="VISIONFLOW API",
    description="Professional image editing API with physical-based processing",
    version="0.1.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(projects.router, prefix="/api", tags=["Projects"])
app.include_router(processing.router, prefix="/api", tags=["Processing"])
app.include_router(export.router, prefix="/api", tags=["Export"])
app.include_router(blueprints.router, prefix="/api", tags=["Blueprints"])
app.include_router(models_route.router, prefix="/api", tags=["Models"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.PYTHON_ENV == "development"
    )
```

---

## 🔗 Princípios de Organização

### 1. Separação de Responsabilidades

- **Frontend**: UI, interações, validações client-side, processamento leve
- **Backend**: Processamento pesado, IA, persistência, validações server-side

### 2. Modularidade

- Cada módulo (color, lens, ai) é independente
- Fácil testar isoladamente
- Fácil substituir implementações

### 3. Escalabilidade

- Frontend pode ser deployed em CDN (static export)
- Backend pode escalar horizontalmente (stateless)
- Volumes persistentes separados

### 4. Testabilidade

- Estrutura de pastas `tests/` espelha estrutura de código
- Fixtures compartilhadas em `conftest.py`
- Testes unitários + integração + e2e

### 5. Manutenibilidade

- Nomenclatura clara e consistente
- Documentação inline (docstrings, comentários)
- README em cada módulo complexo

---

## 📚 Documentação Relacionada

- [ROADMAP.md](./ROADMAP.md) - Planejamento de desenvolvimento
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura do sistema
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Setup do Docker
- [SCREENS_SPECIFICATION.md](./SCREENS_SPECIFICATION.md) - Especificação de telas
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guia de contribuição

---

**Última Atualização**: Fevereiro 2026
**Versão**: 2.0 (Web + Docker)
**Mantenedor**: Time VISIONFLOW
