## 📝 Description

Implementar extração de paleta de cores usando K-Means clustering.

## 🎯 Acceptance Criteria

- [ ] Extrair 5 cores dominantes da imagem
- [ ] Exibir paleta em painel lateral
- [ ] Clicar em cor para ver onde ela aparece na imagem (highlight)
- [ ] Copiar código hexadecimal da cor

## ✅ Implementation Checklist

### Backend
- [ ] Implementar K-Means em Python (scikit-learn ou OpenCV)
- [ ] Endpoint POST /api/colors/extract
- [ ] Processar imagem e retornar cores RGB/HEX
- [ ] Calcular porcentagem de cada cor na imagem
- [ ] Otimização: downsampling para performance

### Frontend Components
- [ ] Componente PalettePanel
- [ ] Grid de swatches de cores
- [ ] Click to copy (clipboard API)
- [ ] Toast notification "Color copied!"
- [ ] Loading state durante extração
- [ ] Error handling

### Highlight Feature
- [ ] Highlight de regiões da imagem com cor selecionada
- [ ] Overlay semi-transparente no canvas
- [ ] Slider de tolerância de cor (threshold)
- [ ] Toggle on/off do highlight

### UI/UX
- [ ] Color swatch com código HEX
- [ ] Porcentagem de presença da cor
- [ ] Nome da cor (opcional, usando biblioteca de nomes)
- [ ] Export da paleta (JSON, CSS, ASE)

### Testing
- [ ] Testar com imagens monocromáticas
- [ ] Testar com imagens coloridas complexas
- [ ] Testar copy to clipboard
- [ ] Validar precisão das cores extraídas

## 📚 Libraries/Dependencies

### Backend
- `scikit-learn` - K-Means clustering
- `opencv-python` - Processamento de imagem
- `numpy` - Manipulação de arrays

### Frontend
- `colord` ou `chroma-js` - Manipulação de cores
- Clipboard API (nativo do browser)

## 🔗 Dependencies

- **Depends on**: #2 (Image Loader)

## 📊 Complexity Estimate

**Complexity**: Média (2-3 dias)

## 📌 Additional Context

### K-Means Implementation:
```python
from sklearn.cluster import KMeans
import cv2
import numpy as np

def extract_palette(image_path: str, n_colors: int = 5):
    # Carregar imagem
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Redimensionar para performance
    max_size = 300
    h, w = img.shape[:2]
    if max(h, w) > max_size:
        scale = max_size / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)))
    
    # Reshape para array de pixels
    pixels = img.reshape(-1, 3)
    
    # K-Means clustering
    kmeans = KMeans(n_clusters=n_colors, random_state=42)
    kmeans.fit(pixels)
    
    # Cores dominantes
    colors = kmeans.cluster_centers_.astype(int)
    
    # Calcular porcentagens
    labels = kmeans.labels_
    counts = np.bincount(labels)
    percentages = (counts / len(labels)) * 100
    
    # Ordenar por prevalência
    sorted_indices = np.argsort(percentages)[::-1]
    
    palette = []
    for idx in sorted_indices:
        r, g, b = colors[idx]
        palette.append({
            "rgb": [int(r), int(g), int(b)],
            "hex": f"#{r:02x}{g:02x}{b:02x}",
            "percentage": float(percentages[idx])
        })
    
    return palette
```

### API Response:
```json
{
  "palette": [
    {
      "rgb": [45, 87, 123],
      "hex": "#2d577b",
      "percentage": 35.4,
      "name": "Steel Blue"
    },
    {
      "rgb": [245, 222, 179],
      "hex": "#f5deb3",
      "percentage": 28.7,
      "name": "Wheat"
    },
    {
      "rgb": [34, 139, 34],
      "hex": "#228b22",
      "percentage": 18.2,
      "name": "Forest Green"
    }
  ]
}
```

### Palette Panel UI:
```
┌──────────────────────┐
│  COLOR PALETTE       │
├──────────────────────┤
│  ████ #2d577b  35.4% │
│  Steel Blue     [📋] │
├──────────────────────┤
│  ████ #f5deb3  28.7% │
│  Wheat          [📋] │
├──────────────────────┤
│  ████ #228b22  18.2% │
│  Forest Green   [📋] │
├──────────────────────┤
│  [Extract] [Export]  │
└──────────────────────┘
```

### Color Highlight Algorithm:
```typescript
function highlightColor(
  canvas: fabric.Canvas,
  targetColor: RGB,
  tolerance: number = 20
) {
  const imageData = canvas.getContext().getImageData(0, 0, width, height);
  const pixels = imageData.data;
  
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    
    const distance = Math.sqrt(
      (r - targetColor.r) ** 2 +
      (g - targetColor.g) ** 2 +
      (b - targetColor.b) ** 2
    );
    
    if (distance > tolerance) {
      // Escurecer pixels que não são da cor alvo
      pixels[i] *= 0.3;
      pixels[i + 1] *= 0.3;
      pixels[i + 2] *= 0.3;
    }
  }
  
  canvas.getContext().putImageData(imageData, 0, 0);
}
```

### Future Enhancements:
- Export em formatos Adobe ASE, Procreate
- Paletas harmônicas (complementar, análoga, triádica)
- Comparação de paletas entre imagens
- Biblioteca de paletas salvas
