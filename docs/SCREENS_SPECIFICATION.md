# VISIONFLOW - Especificação de Telas

## 📋 Visão Geral

Este documento detalha todas as telas e funcionalidades do VISIONFLOW, organizadas por fluxo de usuário. Cada tela inclui propósito, componentes visuais, funcionalidades técnicas, interações UX e estados de feedback.

---

## 🗺️ Mapa de Navegação

```
┌─────────────────────────────────────────────────────────────┐
│                1. Dashboard de Projetos                     │
│                      (Tela Inicial)                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
    ┌─────────────────────┼─────────────────────┐
    ↓                     ↓                     ↓
┌─────────┐     ┌─────────────────┐     ┌──────────────┐
│ 2. Arq. │     │ 3. Gestor de    │     │ 4. Estúdio   │
│ Funil   │     │    Blueprints   │     │ de Criação   │
└─────────┘     └─────────────────┘     └──────────────┘
                                                ↓
                                   ┌────────────┴────────────┐
                                   ↓                         ↓
                          ┌─────────────────┐    ┌──────────────────┐
                          │ 5. Centro de    │    │ 6. Biblioteca de │
                          │    Preview      │    │    Blueprints    │
                          └─────────────────┘    └──────────────────┘
                                   ↓
                          ┌─────────────────┐
                          │ 7. Central de   │
                          │    Exportação   │
                          └─────────────────┘
```

---

## 1️⃣ Dashboard de Projetos (Home)

### 📌 Propósito
Tela inicial onde o usuário gerencia projetos, importa imagens e acessa quick actions para workflows comuns.

### 🎨 Componentes Visuais

```
┌────────────────────────────────────────────────────────────┐
│  VISIONFLOW                    [🔍 Search]  [+ New Project]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📂 Recent Projects                        [View All →]    │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐               │
│  │ Project 1 │ │ Project 2 │ │ Project 3 │               │
│  │ ████████  │ │ ████████  │ │ ████████  │               │
│  │ 3 images  │ │ 12 images │ │ 1 image   │               │
│  │ 2h ago    │ │ 1 day ago │ │ 3 days ago│               │
│  └───────────┘ └───────────┘ └───────────┘               │
│                                                             │
│  ⚡ Quick Actions                                          │
│  [📤 Import Images] [🎨 New Campaign] [📋 Browse Presets] │
│                                                             │
│  📊 Importação Inteligente                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Drag & Drop ou [Selecionar Arquivos]                │ │
│  │  Formatos: JPG, PNG, WebP, TIFF, RAW                 │ │
│  │  Max: 50MB por arquivo                                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### 🛠️ Funcionalidades

| Função | Descrição Técnica | Interação UX |
|--------|-------------------|--------------|
| **CRUD de Projetos** | Criar, ler, atualizar, deletar projetos (localStorage ou API) | Click "New Project" → modal com nome/descrição → Create |
| **Listagem de Projetos** | Grid/lista de projetos recentes (ordenado por `lastModified`) | Scroll infinito ou paginação (10/20/30 itens) |
| **Busca** | Filtro por nome/data (regex ou fuzzy search) | Input com debounce (300ms) + sugestões |
| **Drag & Drop Upload** | File API + validation (type, size) | Área de drop com highlight ao arrastar |
| **Pré-processamento Assíncrono** | Upload → backend → EXIF extraction + thumbnail | Progress bar + notification ao completar |
| **Quick Actions** | Atalhos para fluxos comuns | Botões grandes com ícones |

### 📊 Estados de Feedback

- **Empty State**: "Nenhum projeto ainda. Importe suas primeiras imagens!"
- **Loading**: Skeleton screens para cards de projeto
- **Error**: "Falha ao carregar projetos. [Tentar novamente]"
- **Upload Progress**: "Processando 3/5 imagens..." (progress bar)
- **Upload Success**: Toast notification "5 imagens importadas com sucesso!"

### 🎯 Casos de Uso

1. **Novo Usuário**: Vê empty state → arrasta imagens → vê progress → redirecionado para Estúdio
2. **Usuário Recorrente**: Vê projetos recentes → click em projeto → continua edição
3. **Batch Import**: Arrasta 20 imagens → sistema cria projeto automaticamente → notifica ao completar

---

## 2️⃣ Arquiteto de Funil (Dashboard de Campanha)

### 📌 Propósito
Gerenciamento de campanhas multi-plataforma com mapeamento de funil (Teaser → Lançamento → Manutenção).

### 🎨 Componentes Visuais

```
┌────────────────────────────────────────────────────────────┐
│  Campaign: "Album Launch Q1 2026"                [Save]    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  🎯 Funil de Campanha                                      │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐               │
│  │ TEASER  │ →  │LANÇAMENTO│→  │MANUTENÇÃO│               │
│  ├─────────┤    ├─────────┤    ├─────────┤               │
│  │ 3 ativos│    │ 12 ativos│    │ 8 ativos │               │
│  │ 2 prontos│   │ 5 prontos│    │ 0 prontos│               │
│  └─────────┘    └─────────┘    └─────────┘               │
│                                                             │
│  📦 Ativos da Fase: LANÇAMENTO                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [✓] IG Story 1 (1080x1920)        [Edit] [Preview]  │  │
│  │ [✓] IG Post 1 (1080x1080)         [Edit] [Preview]  │  │
│  │ [ ] YouTube Thumbnail (1280x720)  [Edit] [Preview]  │  │
│  │ [ ] Spotify Canvas (1080x1920)    [Edit] [Preview]  │  │
│  │ [✓] Facebook Cover (820x312)      [Edit] [Preview]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  🗓️ Ordem de Publicação                                   │
│  Day 1: IG Story 1, IG Post 1                              │
│  Day 3: YouTube Thumbnail, Spotify Canvas                  │
│  Day 7: Facebook Cover                                     │
│                                                             │
│  ✅ Checklist de Campanha                                 │
│  [✓] Todos os ativos criados                              │
│  [✓] Cores alinhadas ao blueprint                         │
│  [ ] Safe zones verificadas                               │
│  [ ] Preview em dispositivos reais                         │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### 🛠️ Funcionalidades

| Função | Descrição Técnica | Interação UX |
|--------|-------------------|--------------|
| **Mapeamento de Funil** | 3 fases configuráveis (Teaser/Launch/Maintenance) | Drag & drop de ativos entre fases |
| **Gestão de Ativos** | Lista de templates/formatos + status (done/pending) | Checkbox + quick actions (edit, preview, duplicate) |
| **Ordem de Publicação** | Timeline com datas sugeridas (Gantt-like) | Drag & drop para reordenar, date picker |
| **Checklist de Campanha** | Validação automática (safe zones, colors, resolution) | Auto-check ao completar tarefas |
| **Exportação em Batch** | Gerar todos os ativos da fase de uma vez | Botão "Export All in Phase" → ZIP download |

### 📊 Estados de Feedback

- **Empty Campaign**: "Adicione seu primeiro ativo à campanha"
- **Progress**: "5/12 ativos prontos (42%)" + barra de progresso
- **Validation Error**: "⚠️ 2 ativos fora da safe zone"
- **Export Progress**: "Exportando 12 ativos... 8/12 completos"

### 🎯 Casos de Uso

1. **Nova Campanha**: Cria campanha → adiciona ativos por template → preenche cada ativo → marca como pronto
2. **Review de Campanha**: Vê checklist → identifica ativos pendentes → edita → exporta em lote

---

## 3️⃣ Gestor de Blueprints (DNA Visual)

### 📌 Propósito
Criar e gerenciar blueprints de identidade visual reutilizáveis (paletas, LUTs, layer styles).

### 🎨 Componentes Visuais

```
┌────────────────────────────────────────────────────────────┐
│  Blueprint: "Moody Cinematic"                    [Save]    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  🎨 Paleta de Cores                                        │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                                │
│  │██│ │██│ │██│ │██│ │██│                                │
│  └──┘ └──┘ └──┘ └──┘ └──┘                                │
│  #1A1A2E #16213E #0F3460 #E94560 #F9F7F7                  │
│                                              [+ Add Color]  │
│                                                             │
│  🌈 Color Grading (LUT)                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Before]        [Slider]        [After]            │   │
│  │  ██████          ←  50%  →        ██████            │   │
│  └─────────────────────────────────────────────────────┘   │
│  Current LUT: "Cinematic Teal & Orange"                    │
│  [Browse LUTs] [Upload Custom]                             │
│                                                             │
│  🖼️ Layer Styles                                          │
│  • Vignette: 35%                                           │
│  • Film Grain: Low                                         │
│  • Chromatic Aberration: 5%                                │
│                                                             │
│  💾 Ações                                                  │
│  [Export .vflow] [Share Link] [Apply to All Assets]       │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### 🛠️ Funcionalidades

| Função | Descrição Técnica | Interação UX |
|--------|-------------------|--------------|
| **Criação de Blueprint** | Salvar combinação de cores + LUT + layer styles em JSON | Form com inputs + live preview |
| **Sincronização Global** | Aplicar blueprint a múltiplos projetos/ativos | Botão "Apply to All" → seleciona ativos → confirma |
| **Color Matcher Inter-Ativos** | Garantir mesma paleta em todos os assets da campanha | Auto-sync ao mudar cor (toggle "Lock Colors") |
| **Export/Import .vflow** | Formato proprietário (JSON) com paleta + LUT path + settings | Download/upload de arquivo |
| **Blueprint Sharing** | Gerar link público (read-only) ou export code | Botão "Share" → copia link ou mostra código |

### 📊 Estados de Feedback

- **New Blueprint**: "Blueprint vazio. Customize para começar."
- **Saving**: "Salvando blueprint..." + spinner
- **Sync Success**: "✅ Blueprint aplicado a 8 ativos"
- **Export Success**: "blueprint_moody.vflow baixado"

### 🎯 Casos de Uso

1. **Criar Identidade Visual**: Define paleta → escolhe LUT → ajusta layer styles → salva blueprint
2. **Reutilizar Blueprint**: Importa .vflow → aplica a novo projeto → ajusta finamente se necessário
3. **Compartilhar Blueprint**: Exporta → envia a colaborador → colaborador importa e usa

---

## 4️⃣ Estúdio de Criação (Workspace Principal)

### 📌 Propósito
Editor principal onde toda a magia acontece: edição de imagem, aplicação de efeitos, layer management.

### 🎨 Componentes Visuais

```
┌────────────────────────────────────────────────────────────┐
│ File Edit View Layer Tools                     [- □ ✕]   │
├─────┬──────────────────────────────────────────────┬───────┤
│     │                                              │       │
│ 🎨  │                                              │  📚   │
│ COL │                                              │  LAY  │
│ OR  │              CANVAS EDITOR                   │  ERS  │
│     │              (Fabric.js)                     │       │
│ 🔍  │                                              │  ✓ Bg │
│ LEN │          [Imagem sendo editada]             │  ✓ Fg │
│ S   │                                              │  ✓ Adj│
│     │                                              │       │
│ 🤖  │                                              │  🎚️  │
│ A I │                                              │  ADJ  │
│     │                                              │  USTE │
├─────┴──────────────────────────────────────────────┴───────┤
│ 🛠️ Toolbar: [Cursor] [Crop] [Brush] [Text]       │       │
│ Zoom: [25%] [50%] [100%] [Fit] [200%]             │       │
└────────────────────────────────────────────────────────────┘
```

### Layout Detalhado

#### Toolbar (Topo)
- File, Edit, View, Layer, Tools menus
- Undo/Redo buttons
- Save/Export buttons

#### Painel Esquerdo (Tabs)
1. **🎨 Color Flow**: Curves, HSL, Tone Mapping, LUTs
2. **🔍 Virtual Lens**: Depth, Bokeh, Distortion, CA
3. **🤖 AI Tools**: Background Removal, Upscaling, Denoising

#### Canvas Central
- Fabric.js canvas com grid/guides opcionais
- Zoom controls (bottom-left)
- Ruler (top/left, togglable)

#### Painel Direito (Tabs)
1. **📚 Layers**: Lista de camadas com drag & drop
2. **🎚️ Adjustments**: Quick sliders (brightness, contrast, saturation)
3. **📊 Info**: EXIF, histogram, color picker

### 🛠️ Funcionalidades

#### Painel de Camadas (Layers Manager)

| Função | Descrição Técnica | Interação UX |
|--------|-------------------|--------------|
| **Add Layer** | Criar nova camada (raster, adjustment, text) | Botão "+" → dropdown com tipos |
| **Delete Layer** | Remover camada selecionada | Click trash icon ou Delete key |
| **Reorder Layers** | Mudar Z-index | Drag & drop na lista |
| **Opacity Control** | Ajustar transparência (0-100%) | Slider ou input numérico |
| **Blend Modes** | Aplicar blend mode (Normal, Multiply, Screen, etc.) | Dropdown com 15+ modos |
| **Visibility Toggle** | Mostrar/ocultar camada | Click ícone de olho |
| **Lock Layer** | Prevenir edição acidental | Click ícone de cadeado |
| **Group Layers** | Agrupar camadas relacionadas | Multi-select + botão "Group" |

#### Painel Virtual Lens Rack

| Função | Descrição Técnica | Interação UX |
|--------|-------------------|--------------|
| **Depth Map Generator** | Executar MiDaS → gerar depth map | Botão "Generate Depth" → progress → preview |
| **Bokeh Slider** | Ajustar intensidade do blur | Slider (0-100%) com live preview |
| **Aperture Shape** | Escolher shape (circular, hex, octagonal) | Dropdown com visual previews |
| **Focal Plane** | Definir ponto de foco no canvas | Click no canvas + crosshair cursor |
| **Distortion Preset** | Aplicar preset de lente (14mm, 50mm, 200mm) | Dropdown com thumbnails |
| **CA Intensity** | Ajustar chromatic aberration | Slider (0-100%) |

#### Painel Neural Color Flow

| Função | Descrição Técnica | Interação UX |
|--------|-------------------|--------------|
| **Curve Editor** | Ajustar curvas RGB/Master | Bézier curve editor (click para adicionar pontos) |
| **Tone Mapping** | Shadows/Midtones/Highlights sliders | 3 sliders independentes (-100 a +100) |
| **HSL Adjustments** | Global ou seletivo por cor | Tabs: Global / Selective (color wheel) |
| **LUT Browser** | Navegar e aplicar LUTs | Grid de thumbnails com hover preview |
| **Palette Extractor** | Extrair cores dominantes | Botão "Extract" → mostra 5 cores + percentuais |

### 📊 Estados de Feedback

- **Loading Image**: Spinner central + "Carregando imagem..."
- **Processing**: "Aplicando efeito..." + progress bar (para operações >1s)
- **Auto-save**: "✓ Salvo automaticamente às 14:32"
- **Error**: "❌ Falha ao aplicar efeito. [Tentar novamente]"
- **Undo/Redo Disabled**: Ícones grayed out quando não disponível

### 🎯 Casos de Uso

1. **Edição Básica**: Importa imagem → ajusta brilho/contraste → crop → export
2. **Grading Avançado**: Aplica LUT → ajusta curves → extrai paleta → salva como blueprint
3. **Bokeh Simulation**: Gera depth map → ajusta focal plane → aplica bokeh → export
4. **Workflow Completo**: Remove background → aplica color grading → adiciona text layer → export múltiplos formatos

---

## 5️⃣ Centro de Preview & Validação

### 📌 Propósito
Simular visualização em diferentes dispositivos e plataformas, com validação de safe zones e compliance.

### 🎨 Componentes Visuais

```
┌────────────────────────────────────────────────────────────┐
│  Preview: IG Story (1080x1920)                  [Back]    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📱 Simulador Multi-Plataforma                            │
│  [iPhone 14] [Galaxy S23] [Desktop] [Tablet]              │
│                                                             │
│       ┌─────────────────────┐                              │
│       │  ┌───────────────┐  │  ← Device Frame             │
│       │  │               │  │                              │
│       │  │  Your Image   │  │                              │
│       │  │   Preview     │  │                              │
│       │  │               │  │                              │
│       │  └───────────────┘  │                              │
│       └─────────────────────┘                              │
│                                                             │
│  🔲 Safe Zones Dinâmicas                                  │
│  [✓] Show Safe Zone  [✓] Show Text Area  [✓] Show Logo   │
│                                                             │
│  🎬 Motion Preview (Canvas Animation)                     │
│  [ Play ] [ Pause ] [ Loop ]                               │
│  Duration: 5s | FPS: 30                                    │
│                                                             │
│  ✅ Compliance Checklist                                  │
│  [✓] Resolution: 1080x1920 ✓                              │
│  [✓] Aspect Ratio: 9:16 ✓                                 │
│  [⚠] Elements in Safe Zone: 1 warning                     │
│  [✓] File Size: 2.3MB (< 4MB) ✓                           │
│  [✓] Format: PNG ✓                                        │
│                                                             │
│  [Export] [Share Preview Link]                             │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### 🛠️ Funcionalidades

| Função | Descrição Técnica | Interação UX |
|--------|-------------------|--------------|
| **Simulador Multi-Plataforma** | Device frames (SVG overlays) com dimensões reais | Tabs ou dropdown para trocar device |
| **Safe Zones Dinâmicas** | Overlay de guides coloridos (green = safe, red = danger) | Toggle checkboxes para cada tipo de zone |
| **Motion Preview** | Animação de Spotify Canvas (looping) | Controles de player (play/pause/loop) |
| **Compliance Checklist** | Validação automática de specs da plataforma | Lista de checks com ícones (✓ / ⚠ / ❌) |
| **Share Preview Link** | Gerar URL temporária para review externo | Botão → copia link → expira em 7 dias |

### 📊 Estados de Feedback

- **Loading Preview**: Skeleton do device frame + spinner
- **Validation Error**: "⚠️ Logo parcialmente fora da safe zone" + highlight visual
- **Export Ready**: "✅ Ativo pronto para publicação"
- **Share Link Generated**: "🔗 Link copiado para a área de transferência"

### 🎯 Casos de Uso

1. **Validar IG Story**: Seleciona template → vê preview em iPhone → identifica elemento fora da safe zone → ajusta → re-valida
2. **Testar Canvas**: Faz upload de vídeo curto → testa loop → valida duration (5-8s) → exporta

---

## 6️⃣ Biblioteca de Blueprints (VIP Presets Manager)

### 📌 Propósito
Galeria de blueprints reutilizáveis (próprios e da comunidade), com import/export.

### 🎨 Componentes Visuais

```
┌────────────────────────────────────────────────────────────┐
│  Blueprint Library                        [+ New Blueprint]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 Search: [_____________]  Filter: [All] [Mine] [Shared] │
│                                                             │
│  📚 My Blueprints                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ Moody    │ │ Vibrant  │ │ B&W Film │                   │
│  │ Cinema   │ │ Summer   │ │ Noir     │                   │
│  │ ████████ │ │ ████████ │ │ ████████ │                   │
│  │ 🎨 5 cols│ │ 🎨 8 cols│ │ 🎨 2 cols│                   │
│  │ [Apply]  │ │ [Apply]  │ │ [Apply]  │                   │
│  │ [Edit]   │ │ [Edit]   │ │ [Edit]   │                   │
│  │ [Export] │ │ [Export] │ │ [Export] │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│                                                             │
│  🌐 Community Blueprints (Coming Soon)                    │
│  ┌──────────┐ ┌──────────┐                                │
│  │ Golden   │ │ Retro    │                                │
│  │ Hour     │ │ 80s      │                                │
│  │ ████████ │ │ ████████ │                                │
│  │ ⭐ 4.8   │ │ ⭐ 4.5   │                                │
│  │ [Import] │ │ [Import] │                                │
│  └──────────┘ └──────────┘                                │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### 🛠️ Funcionalidades

| Função | Descrição Técnica | Interação UX |
|--------|-------------------|--------------|
| **Galeria de Blueprints** | Grid de cards com thumbnail + metadata | Scroll infinito ou paginação |
| **Search & Filter** | Busca por nome, filtro por tags (portrait, landscape, cinematic) | Input com autocomplete + filter chips |
| **Apply Blueprint** | Carregar JSON → aplicar settings ao projeto ativo | Click "Apply" → confirmação → aplicado |
| **Edit Blueprint** | Abrir Gestor de Blueprints com blueprint pré-carregado | Click "Edit" → redireciona para tela 3 |
| **Export Blueprint** | Download .vflow file | Click "Export" → salva arquivo |
| **Import Blueprint** | Upload .vflow → validar → adicionar à biblioteca | Botão "Import" → file picker → sucesso/erro |
| **Blueprint Sharing** | (Futuro) Upload para cloud → gerar link público | Botão "Share" → modal com opções |

### 📊 Estados de Feedback

- **Empty Library**: "Nenhum blueprint ainda. [Criar primeiro blueprint]"
- **Importing**: "Importando blueprint..." + spinner
- **Import Success**: "✅ Blueprint 'Golden Hour' adicionado à biblioteca"
- **Apply Success**: "✅ Blueprint aplicado ao projeto atual"

### 🎯 Casos de Uso

1. **Reutilizar Blueprint**: Navega biblioteca → encontra "Moody Cinema" → click Apply → blueprint aplicado
2. **Importar da Comunidade**: Baixa .vflow de outro artista → importa → testa → ajusta → salva versão própria
3. **Exportar para Backup**: Seleciona múltiplos blueprints → exporta como ZIP → faz backup local

---

## 7️⃣ Central de Exportação e Deploy

### 📌 Propósito
Exportar ativos finalizados com otimizações por destino (IG, YouTube, Spotify), batch processing e cleanup automático.

### 🎨 Componentes Visuais

```
┌────────────────────────────────────────────────────────────┐
│  Export Center                                   [Export] │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📦 Batch Export Organizado                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [✓] Instagram Story (1080x1920, PNG, 4MB max)      │   │
│  │ [✓] Instagram Post (1080x1080, JPG 90%, 8MB max)   │   │
│  │ [ ] YouTube Thumbnail (1280x720, JPG 95%)          │   │
│  │ [✓] Spotify Canvas (1080x1920, MP4, 8MB max)       │   │
│  │ [ ] Facebook Cover (820x312, JPG 85%)              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🎯 Otimização por Destino                                │
│  Platform: [Instagram] [YouTube] [Spotify] [Custom]        │
│                                                             │
│  Instagram Selected:                                        │
│  • Color Space: sRGB ✓                                     │
│  • Compression: Optimized for mobile                       │
│  • Metadata: Strip GPS, keep copyright                     │
│  • Safe Zone: Auto-applied                                 │
│                                                             │
│  💾 Opções de Exportação                                  │
│  Output Format:  [PNG] [JPG] [WebP] [TIFF]                │
│  Quality (JPG):  [━━━━━━━━━○] 90%                         │
│  Resize:         [No] [Yes - 50%] [Custom]                 │
│  Watermark:      [✓] Add watermark (bottom-right)          │
│                                                             │
│  📁 Destino                                                │
│  [💻 Download] [🐳 Docker Volume (/exports)] [☁️ Cloud]   │
│                                                             │
│  🧹 Cleanup Automático                                    │
│  [✓] Delete originals after export                        │
│  [✓] Compress exports to ZIP                              │
│  [ ] Auto-delete exports after 7 days                      │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  [Cancel]                          [Export Selected (3)]   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### 🛠️ Funcionalidades

| Função | Descrição Técnica | Interação UX |
|--------|-------------------|--------------|
| **Batch Export Organizado** | Queue de exports com configs individuais | Checkboxes para selecionar + review antes de exportar |
| **Otimização por Destino** | Presets específicos (IG = sRGB + strip EXIF, YT = rec709) | Dropdown de plataforma → auto-aplica otimizações |
| **Docker Volume Sync** | Salvar exports em volume Docker (persistente) | Toggle "Docker Volume" → exports salvos em `/exports` |
| **Cleanup Automático** | Deletar arquivos temporários/originais após export | Checkboxes com confirmação |
| **Export Progress** | Real-time progress para cada ativo | Modal com progress bars (overall + individual) |
| **ZIP Download** | Comprimir múltiplos exports em ZIP | Checkbox "Compress to ZIP" → único download |

### 📊 Estados de Feedback

- **Selecting**: "3 ativos selecionados para exportação"
- **Exporting**: Modal com "Exportando... 2/3 completos" + progress bars
- **Export Complete**: "✅ 3 ativos exportados com sucesso! [Download ZIP]"
- **Error**: "❌ Falha ao exportar 'IG_Story_1.png'. [Tentar novamente]"
- **Cleanup**: "🧹 Limpeza automática concluída. 150MB liberados."

### 🎯 Casos de Uso

1. **Export Simples**: Seleciona 1 ativo → escolhe formato (PNG) → download
2. **Batch Export para Campanha**: Seleciona 10 ativos → otimiza para Instagram → exporta ZIP → faz download
3. **Exportar para Volume Docker**: Exporta 5 ativos → salva em `/exports` → acessa via Docker volume para processar em outro serviço

---

## 📊 Fluxo de Navegação Completo

### Jornada do Usuário: Campanha de Lançamento de Álbum

1. **Dashboard** → Cria novo projeto "Album Q1"
2. **Arquiteto de Funil** → Define 3 fases (Teaser, Launch, Maintenance) → adiciona 15 ativos
3. **Gestor de Blueprints** → Cria blueprint "Moody Cinematic" com paleta + LUT
4. **Estúdio de Criação** → Edita cada ativo:
   - Aplica blueprint
   - Gera depth map
   - Aplica bokeh
   - Ajusta curves
   - Remove background (se necessário)
5. **Centro de Preview** → Valida cada ativo em device frames → corrige elementos fora da safe zone
6. **Biblioteca de Blueprints** → Salva blueprint customizado para reutilizar em próximo projeto
7. **Central de Exportação** → Batch export de todos os ativos otimizados por plataforma → download ZIP

---

## 🎯 Princípios de UX

### Consistência
- Mesmos patterns de interação em todas as telas (tooltips, modals, buttons)
- Design system único (cores, tipografia, espaçamento)

### Feedback Imediato
- Skeleton screens durante loading
- Progress bars para operações >1s
- Toast notifications para ações completadas

### Prevenção de Erros
- Validação de inputs em tempo real
- Confirmações para ações destrutivas (delete, overwrite)
- Safe zones visuais para prevenir erros de crop

### Flexibilidade
- Keyboard shortcuts para usuários avançados
- Drag & drop + click-based alternatives
- Customização de workspace (panels collapsible)

### Acessibilidade
- Contraste WCAG AA mínimo
- Focus states visíveis
- Alt text em imagens
- Navegação por teclado completa

---

## 📚 Documentação Relacionada

- [ROADMAP.md](./ROADMAP.md) - Planejamento de desenvolvimento
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura do sistema
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Setup do Docker
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Estrutura de código
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guia de contribuição

---

**Última Atualização**: Fevereiro 2026
**Designer**: Time VISIONFLOW
**Versão**: 1.0 (Web Prototype)
