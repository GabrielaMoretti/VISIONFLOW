## 📝 Description

Implementar controle granular de tons (sombras, meios-tons, altas-luzes) usando WebGL shaders.

## 🎯 Acceptance Criteria

- [ ] 3 sliders: Shadows, Midtones, Highlights
- [ ] Preview em tempo real
- [ ] Shader GLSL aplicado no canvas
- [ ] Reset para valores padrão

## ✅ Implementation Checklist

### Frontend Components
- [ ] Componente ToneMappingPanel com 3 sliders
- [ ] Range inputs (-100 a +100 para cada tom)
- [ ] Labels e valores numéricos
- [ ] Botão "Reset"
- [ ] Before/after comparison toggle

### WebGL Integration
- [ ] Instalar pixi.js OU integrar WebGL manualmente
- [ ] Criar shader GLSL para tone mapping
- [ ] Aplicar shader ao Fabric.js canvas via filter
- [ ] Otimizar rendering para 60fps

### Shader Implementation
- [ ] Fragment shader que separa imagem em 3 zonas de luminância
- [ ] Ajuste independente de cada zona
- [ ] Manter cores naturais (evitar oversaturation)
- [ ] Smooth transitions entre zonas

### State Management
- [ ] Armazenar valores de shadows/midtones/highlights
- [ ] Integrar com sistema de Undo/Redo
- [ ] Persistir valores no histórico

### Performance
- [ ] Debounce de updates durante drag do slider
- [ ] GPU acceleration via WebGL
- [ ] Fallback para Canvas 2D se WebGL indisponível

### Testing
- [ ] Testar com imagens escuras (underexposed)
- [ ] Testar com imagens claras (overexposed)
- [ ] Validar performance com imagens 4K
- [ ] Testar reset de valores

## 📚 Libraries/Dependencies

### Frontend
- `pixi.js` - WebGL rendering (ou Three.js)
- OU integração WebGL nativa com Fabric.js
- `glslify` - Shader module bundler (opcional)

## 🔗 Dependencies

- **Depends on**: #3 (Canvas Editor)

## 📊 Complexity Estimate

**Complexity**: Alta (3-5 dias)

## 📌 Additional Context

### GLSL Tone Mapping Shader:
```glsl
precision mediump float;

uniform sampler2D uTexture;
uniform float uShadows;      // -1.0 to 1.0
uniform float uMidtones;     // -1.0 to 1.0
uniform float uHighlights;   // -1.0 to 1.0

varying vec2 vTexCoord;

// Converte RGB para luminância
float getLuminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

// Smooth step para transições suaves
float smoothWeight(float lum, float center, float width) {
    float low = center - width;
    float high = center + width;
    return smoothstep(low, high, lum) * (1.0 - smoothstep(high, high + width, lum));
}

void main() {
    vec4 color = texture2D(uTexture, vTexCoord);
    float lum = getLuminance(color.rgb);
    
    // Calcular pesos para cada zona
    float shadowWeight = smoothWeight(lum, 0.2, 0.15);
    float midtoneWeight = smoothWeight(lum, 0.5, 0.25);
    float highlightWeight = smoothWeight(lum, 0.8, 0.15);
    
    // Aplicar ajustes
    float adjustment = 
        shadowWeight * uShadows +
        midtoneWeight * uMidtones +
        highlightWeight * uHighlights;
    
    // Ajustar brilho mantendo cores
    vec3 adjustedColor = color.rgb * (1.0 + adjustment * 0.5);
    
    // Clamp para evitar valores fora do range
    adjustedColor = clamp(adjustedColor, 0.0, 1.0);
    
    gl_FragColor = vec4(adjustedColor, color.a);
}
```

### Integration with Fabric.js:
```typescript
// Criar custom filter
fabric.Image.filters.ToneMapping = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
  type: 'ToneMapping',
  
  fragmentSource: toneMappingShader,
  
  shadows: 0,
  midtones: 0,
  highlights: 0,
  
  applyTo2d: function(options) {
    // Fallback CPU implementation (simplified)
    // ...
  },
  
  getUniformLocations: function(gl, program) {
    return {
      uShadows: gl.getUniformLocation(program, 'uShadows'),
      uMidtones: gl.getUniformLocation(program, 'uMidtones'),
      uHighlights: gl.getUniformLocation(program, 'uHighlights'),
    };
  },
  
  sendUniformData: function(gl, uniformLocations) {
    gl.uniform1f(uniformLocations.uShadows, this.shadows);
    gl.uniform1f(uniformLocations.uMidtones, this.midtones);
    gl.uniform1f(uniformLocations.uHighlights, this.highlights);
  },
});

// Usar no código
const toneFilter = new fabric.Image.filters.ToneMapping({
  shadows: -0.2,
  midtones: 0.1,
  highlights: 0.3,
});

image.filters.push(toneFilter);
image.applyFilters();
canvas.renderAll();
```

### Tone Mapping Panel UI:
```
┌──────────────────────────┐
│  TONE MAPPING            │
├──────────────────────────┤
│  Shadows                 │
│  [----●------] -20       │
│                          │
│  Midtones                │
│  [------●----] +10       │
│                          │
│  Highlights              │
│  [--------●--] +30       │
│                          │
│  [Reset] [Before/After]  │
└──────────────────────────┘
```

### Luminance Zones:
- **Shadows**: 0% - 33% luminance
- **Midtones**: 33% - 66% luminance
- **Highlights**: 66% - 100% luminance

### Advanced Features (Future):
- Curva customizável de tone mapping
- HDR tone mapping (Reinhard, ACES)
- Preservação de cor (color grading)
- Máscara de luminância para ajustes seletivos
