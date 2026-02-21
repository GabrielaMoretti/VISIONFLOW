## 📝 Description

Implementar sistema de histórico com Undo/Redo para todas as operações de edição.

## 🎯 Acceptance Criteria

- [ ] Ctrl+Z para Undo
- [ ] Ctrl+Shift+Z para Redo
- [ ] Botões de Undo/Redo na toolbar
- [ ] Estados desabilitados quando não há ações para desfazer/refazer
- [ ] Histórico persistido durante a sessão

## ✅ Implementation Checklist

### State Management
- [ ] Configurar Redux com redux-undo OU
- [ ] Implementar history stack no Zustand
- [ ] Snapshots do estado do canvas
- [ ] Limite de histórico (ex: 50 ações)
- [ ] Tipos de ações rastreáveis

### Frontend Components
- [ ] Botões Undo/Redo na toolbar
- [ ] Ícones (setas de volta/avanço)
- [ ] Tooltips com keyboard shortcuts
- [ ] Estados disabled quando não aplicável
- [ ] Indicador visual do número de ações no histórico (opcional)
- [ ] History panel com lista de ações (opcional)

### Keyboard Shortcuts
- [ ] Ctrl/Cmd + Z para Undo
- [ ] Ctrl/Cmd + Shift + Z para Redo
- [ ] Ctrl/Cmd + Y para Redo (alternativo)
- [ ] Prevenir comportamento padrão do browser

### Canvas Integration
- [ ] Serializar estado do Fabric.js canvas
- [ ] Restaurar estado ao fazer Undo/Redo
- [ ] Preservar layers, opacidades, blend modes
- [ ] Preservar zoom e pan position (opcional)
- [ ] Otimização: debounce de snapshots para ações contínuas

### Performance
- [ ] Compressão de snapshots (JSON minify)
- [ ] Diff-based history (salvar apenas mudanças)
- [ ] Cleanup automático de snapshots antigos
- [ ] Memory management

### Testing
- [ ] Testar Undo/Redo com adição de layers
- [ ] Testar Undo/Redo com mudança de opacidade
- [ ] Testar Undo/Redo com blend modes
- [ ] Testar limite de histórico
- [ ] Testar keyboard shortcuts

## 📚 Libraries/Dependencies

### State Management (escolher uma opção)
- **Opção 1**: `redux` + `redux-undo` (se usar Redux)
- **Opção 2**: `zustand` com middleware customizado
- **Opção 3**: `immer` para immutability

## 🔗 Dependencies

- **Depends on**: #4 (Layer System)

## 📊 Complexity Estimate

**Complexity**: Média (2-3 dias)

## 📌 Additional Context

### Redux Undo Setup:
```typescript
import undoable from 'redux-undo';

const rootReducer = combineReducers({
  canvas: undoable(canvasReducer, {
    limit: 50, // Máximo 50 ações no histórico
    filter: filterActions, // Filtrar ações triviais
  }),
});

// Usage
dispatch(ActionCreators.undo());
dispatch(ActionCreators.redo());
```

### Zustand History Middleware:
```typescript
interface HistoryState {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
  
  undo: () => void;
  redo: () => void;
  recordState: (state: CanvasState) => void;
}

const useHistoryStore = create<HistoryState>((set) => ({
  past: [],
  present: initialState,
  future: [],
  
  undo: () => set((state) => {
    if (state.past.length === 0) return state;
    
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, -1);
    
    return {
      past: newPast,
      present: previous,
      future: [state.present, ...state.future],
    };
  }),
  
  redo: () => set((state) => {
    if (state.future.length === 0) return state;
    
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    
    return {
      past: [...state.past, state.present],
      present: next,
      future: newFuture,
    };
  }),
  
  recordState: (newState) => set((state) => ({
    past: [...state.past, state.present].slice(-50), // Limite de 50
    present: newState,
    future: [], // Limpar redo ao fazer nova ação
  })),
}));
```

### Canvas State Serialization:
```typescript
// Salvar estado
function serializeCanvas(canvas: fabric.Canvas): CanvasState {
  return {
    objects: canvas.toJSON(['selectable', 'opacity', 'globalCompositeOperation']),
    zoom: canvas.getZoom(),
    viewportTransform: canvas.viewportTransform,
    timestamp: Date.now(),
  };
}

// Restaurar estado
function deserializeCanvas(canvas: fabric.Canvas, state: CanvasState) {
  canvas.loadFromJSON(state.objects, () => {
    canvas.setZoom(state.zoom);
    canvas.setViewportTransform(state.viewportTransform);
    canvas.renderAll();
  });
}
```

### Ações Rastreáveis:
- Adicionar layer
- Remover layer
- Reordenar layers
- Mudar opacidade
- Mudar blend mode
- Toggle visibilidade
- Lock/unlock layer
- Editar propriedades de objeto

### Ações NÃO Rastreáveis (performance):
- Zoom (muito frequente)
- Pan (muito frequente)
- Hover states
- UI toggles

### UI Toolbar:
```
┌────────────────────────────────┐
│ [↶ Undo]  [↷ Redo]  |  [💾 Save] │
│  Ctrl+Z    Ctrl+Shift+Z         │
└────────────────────────────────┘
```

### Future Enhancements:
- History panel com lista nomeada de ações
- Branches de histórico (timeline alternativo)
- Persistência em localStorage/IndexedDB
- Named snapshots (checkpoints manuais)
