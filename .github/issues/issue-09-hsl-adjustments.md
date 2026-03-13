## 📝 Description

Sliders para ajuste de matiz, saturação e luminosidade.

## 🎯 Acceptance Criteria

- [ ] Slider de Hue (-180° a +180°)
- [ ] Slider de Saturation (-100% a +100%)
- [ ] Slider de Lightness (-100% a +100%)
- [ ] Preview em tempo real

## ✅ Implementation Checklist

### Frontend Components
- [ ] Componente HSLPanel
- [ ] 3 sliders com valores numéricos
- [ ] Labels descritivos
- [ ] Reset individual e global
- [ ] Before/after comparison

### Color Processing
- [ ] Conversão RGB → HSL
- [ ] Aplicar ajustes em HSL
- [ ] Conversão HSL → RGB
- [ ] Aplicar via Fabric.js filters ou shader

### Fabric.js Integration
- [ ] Usar fabric.Image.filters.HueRotation (built-in)
- [ ] Criar custom filter para Saturation
- [ ] Criar custom filter para Lightness
- [ ] Combinar múltiplos filters

### State Management
- [ ] Armazenar valores HSL no state
- [ ] Integrar com Undo/Redo
- [ ] Salvar ajustes no histórico de edição

### Performance
- [ ] Debounce de updates (200ms)
- [ ] GPU acceleration se possível
- [ ] Otimizar para imagens grandes

### Testing
- [ ] Testar com imagens coloridas
- [ ] Testar com imagens em preto e branco
- [ ] Validar precisão das conversões
- [ ] Testar extremos (+180° hue, +100% saturation)

## 📚 Libraries/Dependencies

### Frontend
- `culori` - Manipulação de cores e conversões
- OU `chroma-js` - Alternative color library
- Fabric.js built-in filters

## 🔗 Dependencies

- **Depends on**: #3 (Canvas Editor)

## 📊 Complexity Estimate

**Complexity**: Baixa (1-2 dias)

## 📌 Additional Context

### Fabric.js Built-in Filters:
```typescript
// Hue Rotation (built-in)
const hueFilter = new fabric.Image.filters.HueRotation({
  rotation: 0.5, // -1 to 1 (maps to -180° to +180°)
});

// Saturation (built-in)
const saturationFilter = new fabric.Image.filters.Saturation({
  saturation: 0.5, // -1 to 1
});

// Brightness (pode ser usado para Lightness)
const brightnessFilter = new fabric.Image.filters.Brightness({
  brightness: 0.2, // -1 to 1
});

// Aplicar
image.filters = [hueFilter, saturationFilter, brightnessFilter];
image.applyFilters();
canvas.renderAll();
```

### Custom HSL Shader (alternativa):
```glsl
precision mediump float;

uniform sampler2D uTexture;
uniform float uHue;        // -180 to 180
uniform float uSaturation; // -1 to 1
uniform float uLightness;  // -1 to 1

varying vec2 vTexCoord;

// RGB to HSL
vec3 rgb2hsl(vec3 color) {
    float maxC = max(max(color.r, color.g), color.b);
    float minC = min(min(color.r, color.g), color.b);
    float delta = maxC - minC;
    
    float h = 0.0;
    float s = 0.0;
    float l = (maxC + minC) / 2.0;
    
    if (delta > 0.0) {
        s = l < 0.5 ? delta / (maxC + minC) : delta / (2.0 - maxC - minC);
        
        if (color.r == maxC) {
            h = (color.g - color.b) / delta + (color.g < color.b ? 6.0 : 0.0);
        } else if (color.g == maxC) {
            h = (color.b - color.r) / delta + 2.0;
        } else {
            h = (color.r - color.g) / delta + 4.0;
        }
        h /= 6.0;
    }
    
    return vec3(h, s, l);
}

// HSL to RGB
vec3 hsl2rgb(vec3 hsl) {
    float h = hsl.x;
    float s = hsl.y;
    float l = hsl.z;
    
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
    float m = l - c / 2.0;
    
    vec3 rgb;
    if (h < 1.0/6.0) rgb = vec3(c, x, 0.0);
    else if (h < 2.0/6.0) rgb = vec3(x, c, 0.0);
    else if (h < 3.0/6.0) rgb = vec3(0.0, c, x);
    else if (h < 4.0/6.0) rgb = vec3(0.0, x, c);
    else if (h < 5.0/6.0) rgb = vec3(x, 0.0, c);
    else rgb = vec3(c, 0.0, x);
    
    return rgb + m;
}

void main() {
    vec4 color = texture2D(uTexture, vTexCoord);
    vec3 hsl = rgb2hsl(color.rgb);
    
    // Adjust Hue
    hsl.x = mod(hsl.x + uHue / 360.0, 1.0);
    
    // Adjust Saturation
    hsl.y = clamp(hsl.y * (1.0 + uSaturation), 0.0, 1.0);
    
    // Adjust Lightness
    hsl.z = clamp(hsl.z + uLightness * 0.5, 0.0, 1.0);
    
    vec3 adjustedRGB = hsl2rgb(hsl);
    
    gl_FragColor = vec4(adjustedRGB, color.a);
}
```

### HSL Panel UI:
```
┌──────────────────────────┐
│  HSL ADJUSTMENTS         │
├──────────────────────────┤
│  Hue                     │
│  [------●------] 0°      │
│  -180°         +180°     │
│                          │
│  Saturation              │
│  [------●------] 0%      │
│  -100%         +100%     │
│                          │
│  Lightness               │
│  [------●------] 0%      │
│  -100%         +100%     │
│                          │
│  [Reset All]             │
└──────────────────────────┘
```

### Use Cases:
1. **Hue Shift**: Mudar todas as cores (ex: verde → azul)
2. **Desaturate**: Converter para preto e branco (-100% saturation)
3. **Boost Colors**: Aumentar vivacidade (+30% saturation)
4. **Brighten/Darken**: Ajuste global de luminosidade

### Integration with Color Wheel:
```typescript
// Exemplo com culori
import { hsl, rgb } from 'culori';

function adjustHSL(
  rgbColor: { r: number; g: number; b: number },
  adjustments: { h: number; s: number; l: number }
) {
  // Convert to HSL
  const hslColor = hsl(rgbColor);
  
  // Apply adjustments
  const adjusted = {
    h: (hslColor.h + adjustments.h) % 360,
    s: Math.max(0, Math.min(1, hslColor.s + adjustments.s)),
    l: Math.max(0, Math.min(1, hslColor.l + adjustments.l)),
  };
  
  // Convert back to RGB
  return rgb(adjusted);
}
```

### Future Enhancements:
- Selective color adjustment (apenas vermelhos, apenas azuis, etc.)
- Color wheel UI para ajuste visual de Hue
- HSV mode (alternative to HSL)
- OKLCH color space (mais perceptual)
