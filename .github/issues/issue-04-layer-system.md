## 📝 Description

Implementar sistema de camadas (layers) com suporte a múltiplas imagens, blend modes e controle de opacidade.

## 🎯 Acceptance Criteria

- [ ] Painel lateral de camadas visível
- [ ] Adicionar novas camadas (imagens)
- [ ] Reordenar camadas (drag & drop)
- [ ] Toggle de visibilidade (show/hide)
- [ ] Controle de opacidade (slider 0-100%)
- [ ] Blend modes básicos (Normal, Multiply, Screen, Overlay)
- [ ] Lock/Unlock de camadas

## ✅ Implementation Checklist

### Frontend Components
- [ ] Componente LayerPanel (sidebar)
- [ ] Lista de camadas com thumbnails
- [ ] Drag & drop para reordenação (react-dnd ou dnd-kit)
- [ ] Ícones de visibilidade (eye icon)
- [ ] Slider de opacidade
- [ ] Dropdown de blend modes
- [ ] Ícone de lock/unlock
- [ ] Botão "Add Layer"
- [ ] Botão "Delete Layer"

### State Management
- [ ] Configurar Zustand store para layers
- [ ] Layer model/interface TypeScript
- [ ] Actions: addLayer, removeLayer, updateLayer, reorderLayers
- [ ] Seletores para layers ativos/visíveis

### Canvas Integration
- [ ] Sincronizar layers do Zustand com Fabric.js
- [ ] Aplicar blend modes no canvas
- [ ] Atualizar rendering ao mudar opacidade/visibilidade
- [ ] Aplicar z-index correto ao reordenar
- [ ] Prevenir edição de layers locked

### UI/UX
- [ ] Animações de drag & drop
- [ ] Highlight da layer selecionada
- [ ] Context menu (right-click): Duplicate, Delete, Rename
- [ ] Double-click para renomear layer

### Testing
- [ ] Testar adição de múltiplas camadas
- [ ] Testar reordenação por drag & drop
- [ ] Testar todos os blend modes
- [ ] Testar lock/unlock
- [ ] Testar delete de camada ativa

## 📚 Libraries/Dependencies

### Frontend
- `@dnd-kit/core` - Drag and drop (moderno e acessível)
- `@dnd-kit/sortable` - Lista sortable
- `zustand` - State management
- `lucide-react` ou `react-icons` - Ícones (eye, lock, trash, etc.)

## 🔗 Dependencies

- **Depends on**: #3 (Canvas Editor)

## 📊 Complexity Estimate

**Complexity**: Alta (3-5 dias)

## 📌 Additional Context

### Layer State Interface:
```typescript
interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number; // 0-100
  blendMode: BlendMode;
  locked: boolean;
  fabricObject: fabric.Image | fabric.Object;
  thumbnail?: string; // Base64 preview
  zIndex: number;
}

type BlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten';
```

### Zustand Store Exemplo:
```typescript
interface LayerState {
  layers: Layer[];
  activeLayerId: string | null;
  
  // Actions
  addLayer: (layer: Omit<Layer, 'id' | 'zIndex'>) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  setActiveLayer: (id: string) => void;
}
```

### Blend Modes em Fabric.js:
```typescript
// Fabric.js suporta globalCompositeOperation
fabricObject.set({
  opacity: layer.opacity / 100,
  globalCompositeOperation: blendModeToComposite(layer.blendMode),
  visible: layer.visible,
  selectable: !layer.locked,
});

function blendModeToComposite(mode: BlendMode): GlobalCompositeOperation {
  const map = {
    normal: 'source-over',
    multiply: 'multiply',
    screen: 'screen',
    overlay: 'overlay',
    darken: 'darken',
    lighten: 'lighten',
  };
  return map[mode] || 'source-over';
}
```

### Layer Panel Layout:
```
┌─────────────────────┐
│  LAYERS         [+] │
├─────────────────────┤
│ [👁️] Layer 3   [🔒] │
│   ▓▓▓▓░░░ 75%      │
│   Normal       ▼    │
├─────────────────────┤
│ [👁️] Layer 2        │
│   ▓▓▓▓▓▓▓ 100%     │
│   Multiply     ▼    │
├─────────────────────┤
│ [👁️] Background [🔒] │
│   ▓▓▓▓▓▓▓ 100%     │
│   Normal       ▼    │
└─────────────────────┘
```
