# Integração Frontend ↔ Backend — VisionFlow

## ✅ Funcionalidades Implementadas

### 📸 **Importação de Imagens**
- **Galeria de Fotos**: Selecione imagens da biblioteca do dispositivo
- **Câmera**: Capture fotos diretamente com a câmera
- **Upload Automático**: Imagens são enviadas automaticamente ao backend FastAPI
- **Validação**: Suporte completo para formatos JPG, PNG, WebP, TIFF, BMP (até 50MB)

**Localização**: `EditorScreen` → Botão "📤 Toque para importar imagem"

---

### 🎨 **Análise de Cores (colour-science)**
Análise avançada de cores usando a biblioteca `colour-science` no backend:

**Métricas fornecidas**:
- 🌡️ **Temperatura de Cor** (Kelvin) — precisão científica
- 🎨 **Cores Dominantes** (OKLCH e HEX) — até 8 cores principais
- 💡 **Lightness Médio** — brilho geral da imagem
- 🌈 **Chroma Médio** — saturação média
- 🎭 **Harmonia de Cores** — classificação da paleta
- 📊 **Dynamic Range** — contraste tonal
- 🔥 **Nível de Saturação** — vibrância geral

**Uso**: 
1. Importe uma imagem
2. Vá para aba `🤖 AI`
3. Clique em `🔬 Análise (colour-science)`
4. Veja resultados na aba `📊 Info`

**Endpoint Backend**: `GET /api/analyze/{image_id}`

---

### ✂️ **Remoção de Fundo (rembg + U²-Net)**
Remove fundos automaticamente usando IA de segmentação U²-Net:

**Características**:
- 🤖 Modelo: U²-Net (download automático ~170MB na primeira execução)
- 🎯 Alta precisão para pessoas, objetos, produtos
- 🖼️ Retorna PNG com transparência
- 💾 Salva resultado automaticamente no projeto
- ⚡ Processamento: 2-5 segundos

**Uso**:
1. Selecione uma imagem
2. Aba `🤖 AI`
3. Clique em `✂️ Remover Fundo (U²-Net)`
4. Aguarde processamento
5. Nova imagem com fundo transparente é adicionada ao projeto

**Endpoint Backend**: `POST /api/remove-bg/{image_id}`

---

### 🔍 **Upscaling 4× (Real-ESRGAN)**
Ampliação inteligente de imagens usando super-resolução:

**Características**:
- 🤖 Modelo: Real-ESRGAN via ONNX Runtime
- 📏 Fator de ampliação: 2× ou 4×
- 🎨 Preserva detalhes e texturas
- 🖼️ Retorna PNG de alta resolução
- ⏱️ Processamento: 10-30 segundos (depende do tamanho original)

**Uso**:
1. Selecione uma imagem
2. Aba `🤖 AI`
3. Clique em `🔍 Upscale 4× (Real-ESRGAN)`
4. Aguarde processamento (pode demorar 10-30s)
5. Imagem ampliada é adicionada ao projeto

**Endpoint Backend**: `POST /api/upscale/{image_id}?scale=4`

---

## 🏗️ Arquitetura da Integração

### Backend (FastAPI - porta 8000)
```
d:\VisionFlow\backend\
├── main.py                    # Entry point FastAPI
├── api\routes\
│   ├── upload.py             # POST /api/upload
│   ├── processing.py         # Análise, rembg, upscale
│   └── health.py             # GET /health
├── processing\
│   ├── color_flow.py         # colour-science
│   ├── segmentation.py       # rembg (U²-Net)
│   └── upscaling.py          # Real-ESRGAN (ONNX)
└── uploads/                   # Armazenamento temporário
```

### Frontend (React Native/Expo - porta 8083)
```
d:\VisionFlow\frontend\src\
├── services\
│   └── api.ts                # Cliente HTTP (fetch)
├── store\
│   ├── projectSlice.ts       # Redux: projetos, imagens
│   └── editorSlice.ts        # Redux: estado do editor
└── screens\
    ├── HomeScreen.tsx        # Dashboard de projetos
    ├── EditorScreen.tsx      # Workspace principal ⭐
    └── PreviewScreen.tsx     # Exportação final
```

---

## 🔌 Endpoints Backend Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` | Status do servidor |
| `POST` | `/api/upload` | Upload de imagem (multipart/form-data) |
| `GET` | `/api/analyze/{id}` | Análise de cores (colour-science) |
| `POST` | `/api/remove-bg/{id}` | Remoção de fundo (rembg) |
| `POST` | `/api/upscale/{id}?scale=4` | Super-resolução (ESRGAN) |

---

## 🚀 Como Usar

### 1. **Inicie o Backend**
```powershell
cd d:\VisionFlow\backend
..\venv_d\Scripts\Activate.ps1
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Saída esperada**:
```
✅ VisionFlow backend started
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. **Inicie o Frontend**
```powershell
cd d:\VisionFlow
npm start
```

Pressione `w` para abrir no navegador (Web).

### 3. **Teste a Conexão**
- O círculo verde 🟢 no canto superior direito indica backend conectado
- Se vermelho 🔴, verifique se o backend está rodando na porta 8000

---

## 📋 Fluxo de Trabalho Típico

1. **Criar Novo Projeto**
   - `HomeScreen` → Botão "Novo Projeto"

2. **Importar Imagem**
   - `EditorScreen` → "📤 Toque para importar"
   - Escolha: Galeria ou Câmera
   - Upload automático ao backend

3. **Análise de Cores**
   - Aba `🤖 AI` → `🔬 Análise (colour-science)`
   - Ver resultados em `📊 Info`

4. **Processar Imagem**
   - `✂️ Remover Fundo` — para transparência
   - `🔍 Upscale 4×` — para ampliar

5. **Análise de Mood (Local)**
   - Aba `🎨 Color` → Digite mood (ex: "warm sunset")
   - Veja ajustes OKLCH sugeridos

6. **Exportar**
   - Botão "Preview & Exportar →"
   - `PreviewScreen` com opções de export

---

## 🛡️ Tratamento de Erros

### ❌ "Backend offline"
**Causa**: FastAPI não está rodando ou não responde na porta 8000  
**Solução**:
```powershell
cd d:\VisionFlow\backend
..\venv_d\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### ❌ "Upload failed"
**Causa**: Arquivo muito grande (>50MB) ou formato não suportado  
**Solução**: Use JPG/PNG, reduza tamanho

### ❌ "Analysis failed" / "Image not found"
**Causa**: Imagem não existe no diretório `backend/uploads/`  
**Solução**: Re-faça upload da imagem

### ❌ Upscaling/RemoveBG demora muito
**Causa**: Modelos baixando pela primeira vez (~187MB total)  
**Solução**: Aguarde download automático (só acontece uma vez)

---

## 📦 Dependências

### Backend (Python)
```txt
fastapi==0.132.0
uvicorn[standard]
aiofiles
python-multipart
colour-science
rembg
onnxruntime
Pillow
opencv-python-headless
```

### Frontend (npm)
```json
{
  "expo": "~50.0.0",
  "expo-image-picker": "SDK 50 compatible",
  "react": "18.3.1",
  "react-native": "0.73.11",
  "@reduxjs/toolkit": "^2.0.0",
  "culori": "^4.0.0",
  "react-navigation": "^6.x"
}
```

---

## 🎯 Status da Implementação

| Funcionalidade | Status | Notas |
|----------------|--------|-------|
| Upload (Galeria) | ✅ 100% | Funcional |
| Upload (Câmera) | ✅ 100% | Funcional |
| Análise de Cores | ✅ 100% | colour-science |
| Remoção de Fundo | ✅ 100% | rembg U²-Net |
| Upscaling 4× | ✅ 100% | Real-ESRGAN |
| Mood Analysis (Local) | ✅ 100% | Client-side OKLCH |
| Exportação | 🟡 70% | Layout pronto, falta download |
| Presets LUT | 🟡 50% | Estrutura pronta, falta aplicação |

---

## 🔮 Próximas Melhorias

- [ ] Download de imagens processadas (web)
- [ ] Aplicação de LUTs em tempo real
- [ ] Cache de análises de cor
- [ ] Thumbnail generation
- [ ] Histórico de ações (undo/redo)
- [ ] Sharing de projetos
- [ ] Export para múltiplos formatos (TIFF, WebP, AVIF)

---

**Última atualização**: 2026-03-04  
**Versão**: 0.1.0
