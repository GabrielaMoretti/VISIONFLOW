# VISIONFLOW - Roadmap de Desenvolvimento

## 📋 Visão Geral

**Estratégia de Implementação**: Protótipo Web com Docker
**Abordagem**: Desenvolvimento em camadas de funcionalidades modulares
**Objetivo**: Beta funcional com core features implementadas

---

## 🎯 Estratégia de Camadas

O desenvolvimento do VISIONFLOW seguirá uma arquitetura modular organizada em **6 camadas de funcionalidades**, cada uma construída sobre as anteriores:

```
🟣 Camada 6: INTERFACE & UX
    ↓
🔴 Camada 5: MULTI-MODAL CAMPAIGN
    ↓
🟠 Camada 4: IA ASSISTIVA
    ↓
🟡 Camada 3: VIRTUAL LENS RACK
    ↓
🟢 Camada 2: COLOR FLOW ENGINE
    ↓
🔵 Camada 1: CORE ENGINE (FUNDAÇÃO)
```

---

## 🔵 Camada 1: CORE ENGINE (Fundação)

**Objetivo**: Estabelecer a base sólida para manipulação de imagens
**Prioridade**: CRÍTICA
**Duração Estimada**: 3-4 semanas

### Funcionalidades

#### 1.1 Image Loader
- **Descrição**: Sistema de importação de imagens
- **Formatos Suportados**: JPEG, PNG, RAW (CR2, NEF, DNG)
- **Tecnologias**: Sharp (backend), File API (frontend)

**Critérios de Aceitação**:
- ✅ Upload de imagens via drag-and-drop ou seleção
- ✅ Validação de formato e tamanho
- ✅ Preview imediato da imagem importada
- ✅ Extração de metadados EXIF

#### 1.2 Canvas Editor
- **Descrição**: Editor de canvas interativo
- **Tecnologias**: Fabric.js ou Konva.js
- **Funcionalidades**: Pan, zoom, seleção, transform

**Critérios de Aceitação**:
- ✅ Canvas responsivo e otimizado
- ✅ Zoom suave (mouse wheel + pinch)
- ✅ Pan com mouse/touch
- ✅ Controles de visualização (fit, 100%, zoom in/out)

#### 1.3 Layer System
- **Descrição**: Sistema de camadas não-destrutivo
- **Funcionalidades**: Blend modes, opacidade, visibilidade
- **Tecnologias**: Canvas API + WebGL

**Critérios de Aceitação**:
- ✅ Criação/duplicação/exclusão de camadas
- ✅ Reordenação via drag-and-drop
- ✅ 10+ blend modes (Normal, Multiply, Screen, Overlay, etc.)
- ✅ Controle de opacidade (0-100%)
- ✅ Toggle visibilidade individual

#### 1.4 Export Engine
- **Descrição**: Sistema de exportação otimizado
- **Formatos**: PNG, JPG, WebP
- **Qualidade**: Configurável (Low, Medium, High, Maximum)

**Critérios de Aceitação**:
- ✅ Exportação com qualidade selecionável
- ✅ Preview de tamanho do arquivo
- ✅ Preservação de EXIF (opcional)
- ✅ Download direto ou salvamento em volume Docker

### Dependências
- Docker environment configurado
- Node.js + React/Next.js
- Python FastAPI backend

### Marcos (Milestones)
- **M1.1**: Image Loader funcional (Semana 1)
- **M1.2**: Canvas Editor operacional (Semana 2)
- **M1.3**: Layer System completo (Semana 3)
- **M1.4**: Export Engine integrado (Semana 4)

---

## 🟢 Camada 2: COLOR FLOW ENGINE

**Objetivo**: Ferramentas profissionais de correção e gradação de cor
**Prioridade**: ALTA
**Duração Estimada**: 3-4 semanas

### Funcionalidades

#### 2.1 Palette Extractor
- **Descrição**: Extração inteligente de paleta de cores
- **Algoritmo**: K-Means clustering
- **Output**: 5-10 cores dominantes + percentuais

**Critérios de Aceitação**:
- ✅ Extração automática de paleta (3, 5, 8, 10 cores)
- ✅ Visualização de cores em UI card
- ✅ Export de paleta (.ase, .json, .txt)
- ✅ Análise de harmonia cromática

#### 2.2 Tone Mapping
- **Descrição**: Controle granular de tons (Shadows/Midtones/Highlights)
- **Tecnologias**: Custom curves + color science (Culori/Color.js)

**Critérios de Aceitação**:
- ✅ Sliders independentes para Shadows, Midtones, Highlights
- ✅ Ajuste de temperatura de cor por zona tonal
- ✅ Visualização em tempo real (ou <500ms de latência)
- ✅ Presets (Golden Hour, Blue Hour, Moody, etc.)

#### 2.3 HSL Adjustments
- **Descrição**: Controle fino de Hue, Saturation, Lightness
- **Espaços de Cor**: HSL, HSV, OKLCH

**Critérios de Aceitação**:
- ✅ Ajuste global de H/S/L
- ✅ Ajuste seletivo por faixa de cor (8 cores: R, Y, G, C, B, M)
- ✅ Color wheel interativo
- ✅ Vibrance (saturação seletiva de tons dessaturados)

#### 2.4 LUT System (Lookup Tables)
- **Descrição**: Sistema de LUTs 3D para grading cinematográfico
- **Formatos**: .cube, .3dl

**Critérios de Aceitação**:
- ✅ Importação de LUTs (.cube)
- ✅ Preview em tempo real
- ✅ Biblioteca de LUTs (Cinematic, Analog Film, ACES)
- ✅ Strength/intensity slider (0-100%)
- ✅ Exportação de LUT customizada

### Dependências
- Camada 1 completa
- WebGL shaders para performance
- Culori ou Color.js integrado

### Marcos (Milestones)
- **M2.1**: Palette Extractor funcional (Semana 5)
- **M2.2**: Tone Mapping operacional (Semana 6)
- **M2.3**: HSL Adjustments completo (Semana 7)
- **M2.4**: LUT System integrado (Semana 8)

---

## 🟡 Camada 3: VIRTUAL LENS RACK

**Objetivo**: Simulação realista de características ópticas de lentes
**Prioridade**: MÉDIA-ALTA
**Duração Estimada**: 4-5 semanas

### Funcionalidades

#### 3.1 Depth Map Generator
- **Descrição**: Geração de mapa de profundidade a partir de imagem 2D
- **Tecnologias**: MiDaS via TensorFlow.js ou ONNX Runtime Web
- **Output**: Grayscale depth map (normalizado 0-1)

**Critérios de Aceitação**:
- ✅ Geração de depth map (512x512 mínimo)
- ✅ Visualização do depth map (overlay ou side-by-side)
- ✅ Manual adjustment (brush para correções)
- ✅ Tempo de processamento <10s para imagem 12MP

#### 3.2 Lens Blur Shader
- **Descrição**: Desfoque baseado em profundidade (bokeh simulation)
- **Tecnologias**: WebGL GLSL custom shaders
- **Parâmetros**: Aperture (f/1.4 - f/22), focal length, focus distance

**Critérios de Aceitação**:
- ✅ Bokeh realista com circle of confusion
- ✅ Diferentes shapes de abertura (circular, hexagonal, octagonal)
- ✅ Edge bleeding control
- ✅ Performance >30fps em preview (720p)

#### 3.3 Distortion Simulation
- **Descrição**: Simulação de distorção de lente (barrel/pincushion)
- **Tipos**: Radial distortion, tangential distortion

**Critérios de Aceitação**:
- ✅ Barrel distortion (fish-eye effect)
- ✅ Pincushion distortion (telephoto compression)
- ✅ Slider de intensidade (-100% a +100%)
- ✅ Perfis de lente pré-definidos (Wide 14mm, Normal 50mm, Tele 200mm)

#### 3.4 Chromatic Aberration
- **Descrição**: Simulação de aberração cromática
- **Tipos**: Lateral CA, longitudinal CA

**Critérios de Aceitação**:
- ✅ Fringing colorido nas bordas de alto contraste
- ✅ Controle de intensidade e tipo (R/G/B channels)
- ✅ Edge detection para aplicação seletiva
- ✅ Preview em tempo real

### Dependências
- Camada 1 e 2 completas
- TensorFlow.js ou ONNX Runtime Web configurado
- WebGL shaders otimizados

### Marcos (Milestones)
- **M3.1**: Depth Map Generator funcional (Semana 9-10)
- **M3.2**: Lens Blur Shader operacional (Semana 11)
- **M3.3**: Distortion Simulation completo (Semana 12)
- **M3.4**: Chromatic Aberration integrado (Semana 13)

---

## 🟠 Camada 4: IA ASSISTIVA (Baixa Interferência)

**Objetivo**: Ferramentas de IA para acelerar workflow (sem regeneração)
**Prioridade**: MÉDIA
**Duração Estimada**: 4-5 semanas

### Funcionalidades

#### 4.1 Background Removal
- **Descrição**: Remoção automática de fundo
- **Tecnologias**: SAM (Segment Anything Model) ou U²-Net
- **Output**: Máscara binária + preview com transparência

**Critérios de Aceitação**:
- ✅ Detecção automática de sujeito principal
- ✅ Máscara editável (add/remove areas com brush)
- ✅ Feathering/edge softness control
- ✅ Export com alpha channel (PNG)

#### 4.2 Super-Resolution
- **Descrição**: Upscaling inteligente de imagem
- **Tecnologias**: ESRGAN (Real-ESRGAN) via ONNX
- **Fatores**: 2x, 4x

**Critérios de Aceitação**:
- ✅ Upscaling 2x com qualidade superior a bicubic
- ✅ Preservação de detalhes e texturas
- ✅ Tempo de processamento razoável (<30s para 2K→4K)
- ✅ Opção de processamento em background (async)

#### 4.3 Noise Reduction
- **Descrição**: Redução de ruído com preservação de detalhes
- **Tecnologias**: OpenCV.js bilateral filter + wavelet denoising

**Critérios de Aceitação**:
- ✅ Slider de intensidade (0-100%)
- ✅ Preservação de bordas (edge-aware)
- ✅ Luminance vs Chrominance noise control separado
- ✅ Before/after comparison slider

#### 4.4 Smart Crop
- **Descrição**: Crop inteligente baseado em regra dos terços e detecção facial
- **Tecnologias**: Face detection (TensorFlow.js FaceAPI)

**Critérios de Aceitação**:
- ✅ Sugestão automática de crop (aspect ratios: 1:1, 4:5, 16:9, etc.)
- ✅ Detecção de faces para centralização
- ✅ Regra dos terços visualizada (grid overlay)
- ✅ Manual override disponível

### Dependências
- Camada 1, 2 e 3 completas
- TensorFlow.js ou ONNX Runtime configurado
- Modelos de IA hospedados (CDN ou backend)

### Marcos (Milestones)
- **M4.1**: Background Removal funcional (Semana 14-15)
- **M4.2**: Super-Resolution operacional (Semana 16)
- **M4.3**: Noise Reduction completo (Semana 17)
- **M4.4**: Smart Crop integrado (Semana 18)

---

## 🔴 Camada 5: MULTI-MODAL CAMPAIGN

**Objetivo**: Ferramentas para criação de campanhas multi-plataforma
**Prioridade**: ALTA
**Duração Estimada**: 3-4 semanas

### Funcionalidades

#### 5.1 Template System
- **Descrição**: Sistema de templates pré-configurados para plataformas
- **Templates**: Spotify Canvas (1080x1920), Instagram Story (1080x1920), Instagram Post (1080x1080), YouTube Thumbnail (1280x720), etc.

**Critérios de Aceitação**:
- ✅ 10+ templates de plataformas populares
- ✅ Auto-resize com crop inteligente
- ✅ Preview em device frames (mobile, desktop)
- ✅ Custom template creation

#### 5.2 Safe Zone Overlay
- **Descrição**: Visualização de safe zones e áreas críticas
- **Tipos**: Text safe zone, action safe zone, profile picture overlap

**Critérios de Aceitação**:
- ✅ Overlay toggle para diferentes safe zones
- ✅ Customização de margem (%)
- ✅ Validação automática (warning se elementos fora da safe zone)
- ✅ Platform-specific guides (Instagram, TikTok, YouTube)

#### 5.3 Batch Export
- **Descrição**: Exportação em lote para múltiplos formatos
- **Output**: Múltiplas resoluções e aspect ratios simultaneamente

**Critérios de Aceitação**:
- ✅ Seleção de múltiplos formatos de export
- ✅ Nomenclatura automática (filename_1080x1080.jpg)
- ✅ Fila de exportação com progress bar
- ✅ ZIP download com todos os arquivos

#### 5.4 Preset Manager (VIP - Visual Identity Presets)
- **Descrição**: Gerenciamento de identidade visual reutilizável
- **Conteúdo**: Paleta de cores, fonts, LUTs, layer styles

**Critérios de Aceitação**:
- ✅ Salvar "Visual Identity Preset" (.vip ou .json)
- ✅ Aplicar preset em novos projetos
- ✅ Library de presets (local + cloud sync futuro)
- ✅ Import/Export de presets

### Dependências
- Camadas 1 e 2 completas
- Sistema de templates configurado
- Backend para persistência de presets

### Marcos (Milestones)
- **M5.1**: Template System funcional (Semana 19)
- **M5.2**: Safe Zone Overlay operacional (Semana 20)
- **M5.3**: Batch Export completo (Semana 21)
- **M5.4**: Preset Manager integrado (Semana 22)

---

## 🟣 Camada 6: INTERFACE & UX

**Objetivo**: Experiência de usuário polida e intuitiva
**Prioridade**: CRÍTICA
**Duração Estimada**: 2-3 semanas

### Funcionalidades

#### 6.1 Tooltip Educativo
- **Descrição**: Tooltips contextuais explicando conceitos técnicos
- **Conteúdo**: Explicações de f-stop, ISO, color spaces, etc.

**Critérios de Aceitação**:
- ✅ Tooltips em todos os controles técnicos
- ✅ Opção de desabilitar tooltips (usuários avançados)
- ✅ Links para documentação completa
- ✅ Multilíngue (PT-BR, EN)

#### 6.2 Before/After Slider
- **Descrição**: Comparação visual deslizante entre original e editado
- **Modos**: Horizontal split, vertical split, overlay

**Critérios de Aceitação**:
- ✅ Slider responsivo (touch + mouse)
- ✅ Hotkey para toggle rápido (Spacebar hold)
- ✅ Before/After labels opcionais
- ✅ Sync com zoom/pan

#### 6.3 History/Undo System
- **Descrição**: Sistema de histórico não-destrutivo
- **Tecnologias**: Redux time-travel debugging ou Immer.js

**Critérios de Aceitação**:
- ✅ Unlimited undo/redo (limitado por memória)
- ✅ History panel com thumbnails
- ✅ Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- ✅ History persistence (session storage)

#### 6.4 Guided Workflow
- **Descrição**: Tutorial interativo para primeiros usuários
- **Conteúdo**: 5-step onboarding (Import → Adjust → Export)

**Critérios de Aceitação**:
- ✅ Onboarding interativo (skippable)
- ✅ Highlights de UI elements
- ✅ Sample images para experimentação
- ✅ "Quick Tips" recorrentes (dismissible)

### Dependências
- Todas as camadas anteriores completas
- Design system finalizado
- Internacionalização (i18n) configurada

### Marcos (Milestones)
- **M6.1**: Tooltip System funcional (Semana 23)
- **M6.2**: Before/After Slider operacional (Semana 23)
- **M6.3**: History System completo (Semana 24)
- **M6.4**: Guided Workflow integrado (Semana 24)

---

## 📊 Visão Geral de Sprints

### Sprint 1-4: Fundação (Camada 1)
- Semanas 1-4
- **Entrega**: Sistema básico de edição funcional

### Sprint 5-8: Color Flow (Camada 2)
- Semanas 5-8
- **Entrega**: Ferramentas profissionais de cor

### Sprint 9-13: Virtual Lens (Camada 3)
- Semanas 9-13
- **Entrega**: Simulação óptica realista

### Sprint 14-18: IA Assistiva (Camada 4)
- Semanas 14-18
- **Entrega**: Automação inteligente

### Sprint 19-22: Multi-Modal (Camada 5)
- Semanas 19-22
- **Entrega**: Sistema de campanhas

### Sprint 23-24: UX Polish (Camada 6)
- Semanas 23-24
- **Entrega**: Interface polida e intuitiva

---

## 🎯 Dependências Entre Módulos

```
┌─────────────────────────────────────────┐
│  Camada 6: Interface & UX               │
│  Depende de: TODAS                      │
└─────────────────────────────────────────┘
           ↑                    ↑
┌──────────────────┐  ┌──────────────────┐
│  Camada 5:       │  │  Camada 4:       │
│  Multi-Modal     │  │  IA Assistiva    │
│  Depende de: 1,2 │  │  Depende de: 1,3 │
└──────────────────┘  └──────────────────┘
           ↑                    ↑
           └──────┬──────┬──────┘
                  ↓      ↓
       ┌──────────────────┐
       │  Camada 3:       │
       │  Virtual Lens    │
       │  Depende de: 1   │
       └──────────────────┘
                  ↑
       ┌──────────────────┐
       │  Camada 2:       │
       │  Color Flow      │
       │  Depende de: 1   │
       └──────────────────┘
                  ↑
       ┌──────────────────┐
       │  Camada 1:       │
       │  CORE ENGINE     │
       │  Sem dependências│
       └──────────────────┘
```

**Caminho Crítico**:
1. Camada 1 → Camada 2 e 3 (paralelo) → Camada 4 e 5 (paralelo) → Camada 6

---

## 📈 Marcos de Entrega (Milestones)

| Milestone | Semana | Descrição | Critérios de Aceitação |
|-----------|--------|-----------|------------------------|
| **Alpha 0.1** | 4 | Core Engine completo | Editor básico funcional, import/export operacional |
| **Alpha 0.2** | 8 | Color Flow integrado | Ferramentas de cor profissionais disponíveis |
| **Alpha 0.3** | 13 | Virtual Lens funcional | Simulação de lentes e profundidade |
| **Beta 0.4** | 18 | IA Assistiva integrada | Background removal, upscaling, denoising |
| **Beta 0.5** | 22 | Multi-Modal completo | Templates, batch export, presets |
| **RC 1.0** | 24 | Release Candidate | Interface polida, onboarding, documentação |

---

## ⚠️ Riscos e Mitigações

### Riscos Técnicos

1. **Performance de IA no Browser**
   - **Risco**: Modelos pesados (MiDaS, ESRGAN) podem ser lentos no browser
   - **Mitigação**: 
     - Usar versões quantizadas (INT8)
     - Offload para backend Python quando necessário
     - Web Workers para processamento assíncrono

2. **Compatibilidade WebGL**
   - **Risco**: Nem todos os browsers suportam WebGL 2.0
   - **Mitigação**: 
     - Fallback para Canvas 2D (CPU)
     - Feature detection e graceful degradation

3. **Limitações de Memória**
   - **Risco**: Imagens de alta resolução podem causar crash
   - **Mitigação**: 
     - Tile processing para imagens >20MP
     - Garbage collection agressiva
     - Limite de tamanho de upload (50MB inicial)

### Riscos de Projeto

1. **Scope Creep**
   - **Mitigação**: Roadmap rigoroso, feature freeze após Beta 0.5

2. **Dependências de Terceiros**
   - **Mitigação**: Wrappers e abstrações para bibliotecas críticas

3. **Performance em Produção**
   - **Mitigação**: Testes de carga, profiling contínuo, otimização incremental

---

## 🚀 Próximos Passos

1. **Semana 1**: Setup do ambiente Docker (ver [DOCKER_SETUP.md](./DOCKER_SETUP.md))
2. **Semana 1**: Implementar Image Loader (ver [ARCHITECTURE.md](./ARCHITECTURE.md))
3. **Semana 2**: Criar Canvas Editor com Fabric.js
4. **Weekly**: Review de progresso vs. roadmap
5. **Monthly**: Ajuste de timeline baseado em progresso real

---

## 📚 Documentação Relacionada

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura do sistema
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Configuração do Docker
- [SCREENS_SPECIFICATION.md](./SCREENS_SPECIFICATION.md) - Especificação de telas
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Estrutura de pastas
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guia de contribuição

---

**Última Atualização**: Fevereiro 2026
**Status**: Planejamento
**Próxima Revisão**: Semana 4 (Milestone Alpha 0.1)
