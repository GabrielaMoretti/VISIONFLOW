## 📝 Description

Implementar sistema de exportação de imagens em múltiplos formatos (PNG, JPG) com controle de qualidade.

## 🎯 Acceptance Criteria

- [ ] Exportar canvas como PNG
- [ ] Exportar canvas como JPG (com controle de qualidade)
- [ ] Escolher resolução de exportação (1x, 2x, custom)
- [ ] Preservar transparência em PNG
- [ ] Download automático do arquivo

## ✅ Implementation Checklist

### Frontend Components
- [ ] Modal de exportação com opções
- [ ] Seletor de formato (PNG/JPG)
- [ ] Slider de qualidade JPG (1-100%)
- [ ] Radio buttons ou dropdown de resolução (1x, 2x, custom)
- [ ] Input de resolução customizada (width x height)
- [ ] Preview de tamanho estimado do arquivo
- [ ] Botão "Exportar"
- [ ] Loading state durante exportação
- [ ] Feedback de sucesso/erro

### Canvas Processing
- [ ] Método para renderizar canvas em resolução específica
- [ ] Conversão para Blob (PNG ou JPEG)
- [ ] Trigger de download usando URL.createObjectURL()
- [ ] Nome de arquivo automático com timestamp
- [ ] Limpeza de object URLs após download

### Export Options
- [ ] Preservar aspect ratio ao escalar
- [ ] Aplicar todas as layers visíveis
- [ ] Respeitar blend modes e opacidades
- [ ] Opcional: watermark customizável

### Backend (opcional para futuro)
- [ ] Endpoint POST /api/images/export
- [ ] Processamento server-side para formatos RAW
- [ ] Otimização de compressão
- [ ] Geração de múltiplos tamanhos em batch

### Testing
- [ ] Testar exportação PNG com transparência
- [ ] Testar exportação JPG com diferentes qualidades
- [ ] Testar resolução customizada
- [ ] Testar com múltiplas layers
- [ ] Validar tamanho de arquivo gerado

## 📚 Libraries/Dependencies

### Frontend
- Apenas browser APIs nativas (Canvas toBlob, URL.createObjectURL)
- Opcional: `file-saver` - Simplifica downloads

## 🔗 Dependencies

- **Depends on**: #3 (Canvas Editor)
- **Depends on**: #4 (Layer System)

## 📊 Complexity Estimate

**Complexity**: Baixa (1-2 dias)

## 📌 Additional Context

### Export Function Exemplo:
```typescript
async function exportCanvas(
  canvas: fabric.Canvas,
  options: ExportOptions
): Promise<void> {
  const { format, quality, scale } = options;
  
  // Clonar canvas para exportação sem afetar o original
  const exportCanvas = document.createElement('canvas');
  const originalWidth = canvas.width;
  const originalHeight = canvas.height;
  
  exportCanvas.width = originalWidth * scale;
  exportCanvas.height = originalHeight * scale;
  
  const ctx = exportCanvas.getContext('2d');
  
  // Renderizar em alta resolução
  canvas.setZoom(scale);
  const dataURL = canvas.toDataURL({
    format: format === 'jpg' ? 'jpeg' : 'png',
    quality: format === 'jpg' ? quality / 100 : 1,
    multiplier: 1,
  });
  canvas.setZoom(1); // Restaurar zoom
  
  // Converter para Blob e fazer download
  const blob = await fetch(dataURL).then(r => r.blob());
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `visionflow-${Date.now()}.${format}`;
  link.click();
  
  // Cleanup
  URL.revokeObjectURL(url);
}
```

### Export Options Interface:
```typescript
interface ExportOptions {
  format: 'png' | 'jpg';
  quality: number; // 1-100, apenas para JPG
  scale: number; // 1x, 2x, 3x, ou custom
  customWidth?: number;
  customHeight?: number;
  maintainAspectRatio: boolean;
  includeWatermark?: boolean;
  watermarkText?: string;
}
```

### UI Modal Layout:
```
┌─────────────────────────────┐
│  Export Image          [X]  │
├─────────────────────────────┤
│  Format:                    │
│  ○ PNG   ● JPG              │
│                             │
│  Quality: [====░░░░] 75%    │
│  (Only for JPG)             │
│                             │
│  Resolution:                │
│  ○ 1x (Original)            │
│  ● 2x (Double)              │
│  ○ Custom                   │
│                             │
│  Estimated size: 4.2 MB     │
│                             │
│  [Cancel]  [Export]         │
└─────────────────────────────┘
```

### Formatos Futuros:
- TIFF (lossless, 16-bit)
- WebP (compressão moderna)
- AVIF (compressão de próxima geração)
- PDF (para impressão)
