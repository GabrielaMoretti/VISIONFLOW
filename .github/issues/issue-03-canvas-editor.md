## 📝 Description

Integrar Fabric.js para edição de imagens em canvas com zoom, pan e manipulação básica.

## 🎯 Acceptance Criteria

- [ ] Canvas renderiza imagem carregada
- [ ] Zoom in/out funcional (mouse wheel ou controles)
- [ ] Pan (arrastar para mover a imagem)
- [ ] Fit to screen automático
- [ ] Reset de visualização

## ✅ Implementation Checklist

### Frontend
- [ ] Instalar fabric.js
- [ ] Criar componente CanvasEditor
- [ ] Implementar controles de zoom (+/- e mouse wheel)
- [ ] Implementar pan (arrastar com mouse)
- [ ] Botões de toolbar: Zoom In, Zoom Out, Fit to Screen, Reset
- [ ] Manter aspect ratio da imagem
- [ ] Canvas responsivo ao tamanho da janela
- [ ] Limites de zoom (min: 10%, max: 500%)
- [ ] Smooth zoom animation

### State Management
- [ ] Estado do canvas no Zustand/Redux
- [ ] Persistir nível de zoom
- [ ] Persistir posição do pan

### UI Components
- [ ] Toolbar com controles de zoom
- [ ] Indicador de nível de zoom (%)
- [ ] Mini-map (opcional para navegação)

### Testing
- [ ] Testar zoom com mouse wheel
- [ ] Testar zoom com botões
- [ ] Testar pan com arrastar
- [ ] Testar fit to screen com diferentes aspect ratios
- [ ] Testar limites de zoom

## 📚 Libraries/Dependencies

### Frontend
- `fabric` (v6+) - Canvas manipulation
- `zustand` ou `@reduxjs/toolkit` - State management

## 🔗 Dependencies

- **Depends on**: #2 (Image Loader)

## 📊 Complexity Estimate

**Complexity**: Média (2-3 dias)

## 📌 Additional Context

### Fabric.js Canvas Setup:
```typescript
import { fabric } from 'fabric';

const canvas = new fabric.Canvas('canvas', {
  width: containerWidth,
  height: containerHeight,
  selection: false,
});

// Load image
fabric.Image.fromURL(imageUrl, (img) => {
  canvas.add(img);
  canvas.centerObject(img);
  canvas.renderAll();
});
```

### Zoom Controls:
```typescript
// Mouse wheel zoom
canvas.on('mouse:wheel', (opt) => {
  const delta = opt.e.deltaY;
  let zoom = canvas.getZoom();
  zoom *= 0.999 ** delta;
  
  // Clamp zoom
  if (zoom > 5) zoom = 5;
  if (zoom < 0.1) zoom = 0.1;
  
  canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
  opt.e.preventDefault();
  opt.e.stopPropagation();
});
```

### Pan Controls:
```typescript
let isDragging = false;
let lastPosX = 0;
let lastPosY = 0;

canvas.on('mouse:down', (opt) => {
  isDragging = true;
  lastPosX = opt.e.clientX;
  lastPosY = opt.e.clientY;
});

canvas.on('mouse:move', (opt) => {
  if (isDragging) {
    const vpt = canvas.viewportTransform;
    vpt[4] += opt.e.clientX - lastPosX;
    vpt[5] += opt.e.clientY - lastPosY;
    canvas.requestRenderAll();
    lastPosX = opt.e.clientX;
    lastPosY = opt.e.clientY;
  }
});
```

### Keyboard Shortcuts:
- `Ctrl/Cmd + 0`: Reset zoom to 100%
- `Ctrl/Cmd + =`: Zoom in
- `Ctrl/Cmd + -`: Zoom out
- `Space + Drag`: Pan (alternative to mouse drag)
