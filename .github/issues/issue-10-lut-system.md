## 📝 Description

Sistema de aplicação de LUTs (Lookup Tables) para color grading profissional.

## 🎯 Acceptance Criteria

- [ ] Carregar arquivo .cube (LUT)
- [ ] Galeria de LUTs predefinidas (Cinematic, Vintage, etc.)
- [ ] Preview antes de aplicar
- [ ] Intensidade ajustável (0-100%)

## ✅ Implementation Checklist

### Backend
- [ ] Parser de arquivos .cube (Adobe Cube format)
- [ ] Endpoint POST /api/lut/parse
- [ ] Endpoint GET /api/lut/presets (LUTs incluídas)
- [ ] Validação de formato .cube
- [ ] Conversão de LUT para formato JSON

### Frontend Components
- [ ] Upload de LUT customizada (drag & drop)
- [ ] Grid de presets de LUT com thumbnails
- [ ] Slider de intensidade (0-100%)
- [ ] Preview antes de aplicar
- [ ] Botão "Apply LUT"
- [ ] Botão "Remove LUT"

### LUT Processing
- [ ] Aplicar LUT via WebGL shader (3D texture lookup)
- [ ] Interpolação trilinear para precisão
- [ ] Blending de intensidade (mix original + LUT)
- [ ] Suporte para diferentes tamanhos de LUT (17³, 33³, 65³)

### Preset LUTs
- [ ] Cinematic (Teal & Orange)
- [ ] Vintage (Film Fade)
- [ ] High Contrast (Dark & Moody)
- [ ] Low-Fi Nostálgico
- [ ] Warm Sunset
- [ ] Cool Noir

### State Management
- [ ] Armazenar LUT ativa
- [ ] Armazenar intensidade
- [ ] Integrar com Undo/Redo
- [ ] Cache de LUTs carregadas

### Testing
- [ ] Testar parser com diferentes .cube files
- [ ] Validar aplicação de LUT
- [ ] Testar intensidade em 0%, 50%, 100%
- [ ] Performance com LUT 65³

## 📚 Libraries/Dependencies

### Backend
- Parser customizado para .cube (Python)
- `numpy` - Manipulação de arrays 3D

### Frontend
- WebGL (nativo) para 3D texture lookup
- OU `three.js` para LUT shader

## 🔗 Dependencies

- **Depends on**: #8 (Tone Mapping) - Compartilha infraestrutura WebGL

## 📊 Complexity Estimate

**Complexity**: Alta (4-5 dias)

## 📌 Additional Context

### .cube File Format:
```
# Created by VISIONFLOW
LUT_3D_SIZE 33

0.000000 0.000000 0.000000
0.031373 0.000000 0.000000
0.062745 0.000000 0.000000
...
1.000000 1.000000 1.000000
```

### Python .cube Parser:
```python
import numpy as np

def parse_cube_file(filepath: str):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    size = None
    lut_data = []
    
    for line in lines:
        line = line.strip()
        
        # Skip comments
        if line.startswith('#') or not line:
            continue
        
        # Parse size
        if line.startswith('LUT_3D_SIZE'):
            size = int(line.split()[1])
            continue
        
        # Parse RGB values
        values = line.split()
        if len(values) == 3:
            r, g, b = map(float, values)
            lut_data.append([r, g, b])
    
    # Reshape to 3D cube
    lut_array = np.array(lut_data).reshape(size, size, size, 3)
    
    return {
        'size': size,
        'data': lut_array.tolist()
    }
```

### WebGL LUT Shader:
```glsl
precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uLUTTexture; // 2D texture representando 3D LUT
uniform float uIntensity;      // 0.0 to 1.0
uniform float uLUTSize;        // ex: 33.0

varying vec2 vTexCoord;

// 3D LUT lookup usando 2D texture
vec3 applyLUT(vec3 color, sampler2D lut, float size) {
    // Escalar cor para índice da LUT
    float scale = (size - 1.0) / size;
    float offset = 1.0 / (2.0 * size);
    
    vec3 lutCoord = color * scale + offset;
    
    // Blue slice
    float blueSlice = lutCoord.z * (size - 1.0);
    float blueSliceLower = floor(blueSlice);
    float blueSliceUpper = ceil(blueSlice);
    float blueInterp = fract(blueSlice);
    
    // Calculate 2D coordinates for 3D LUT stored in 2D texture
    // Layout: slices arranged horizontally
    vec2 coord1 = vec2(
        (blueSliceLower + lutCoord.x) / size,
        lutCoord.y
    );
    vec2 coord2 = vec2(
        (blueSliceUpper + lutCoord.x) / size,
        lutCoord.y
    );
    
    // Sample and interpolate
    vec3 color1 = texture2D(lut, coord1).rgb;
    vec3 color2 = texture2D(lut, coord2).rgb;
    
    return mix(color1, color2, blueInterp);
}

void main() {
    vec4 originalColor = texture2D(uTexture, vTexCoord);
    vec3 lutColor = applyLUT(originalColor.rgb, uLUTTexture, uLUTSize);
    
    // Blend original and LUT based on intensity
    vec3 finalColor = mix(originalColor.rgb, lutColor, uIntensity);
    
    gl_FragColor = vec4(finalColor, originalColor.a);
}
```

### Fabric.js Integration:
```typescript
class LUTFilter extends fabric.Image.filters.BaseFilter {
  type = 'LUT';
  lutTexture: WebGLTexture;
  lutSize: number;
  intensity: number;
  
  constructor(options: { lutData: number[][][]; intensity: number }) {
    super();
    this.lutSize = lutData.length;
    this.intensity = options.intensity;
    // Convert 3D LUT to 2D texture
    this.lutTexture = this.createLUTTexture(lutData);
  }
  
  applyTo(options: any) {
    // Apply via WebGL
    const gl = options.context;
    // ... shader application
  }
  
  createLUTTexture(lutData: number[][][]): WebGLTexture {
    // Convert 3D array to 2D texture
    // ...
  }
}
```

### LUT Gallery UI:
```
┌──────────────────────────────────┐
│  LOOKUP TABLES (LUT)             │
├──────────────────────────────────┤
│  [Upload Custom .cube]           │
│                                  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│  │IMG │ │IMG │ │IMG │ │IMG │    │
│  └────┘ └────┘ └────┘ └────┘    │
│  Cinema Vintage HiCon LoFi       │
│                                  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│  │IMG │ │IMG │ │IMG │ │IMG │    │
│  └────┘ └────┘ └────┘ └────┘    │
│  Sunset  Noir  Faded  Film       │
│                                  │
│  Intensity: [=======●-] 75%      │
│                                  │
│  [Apply] [Remove]                │
└──────────────────────────────────┘
```

### Preset LUTs to Include:

1. **Cinematic (Teal & Orange)**
   - Boost teals in shadows
   - Boost oranges in highlights
   - High contrast

2. **Vintage Film**
   - Faded blacks (lifted)
   - Reduced saturation
   - Warm tint

3. **High Contrast (Dark & Moody)**
   - Crushed blacks
   - Preserved highlights
   - Cool tone

4. **Low-Fi Nostálgico**
   - Green/yellow tint
   - Low saturation
   - Soft contrast

5. **Warm Sunset**
   - Orange/red boost
   - Lifted shadows
   - Soft highlights

6. **Cool Noir**
   - Desaturated
   - Blue tint
   - High contrast

### LUT Resources:
- [RocketStock Free LUTs](https://www.rocketstock.com/free-after-effects-templates/35-free-luts-for-color-grading-videos/)
- [Adobe .cube Spec](https://wwwimages2.adobe.com/content/dam/acom/en/products/speedgrade/cc/pdfs/cube-lut-specification-1.0.pdf)

### Future Enhancements:
- 1D LUTs support
- .3dl format support
- LUT marketplace/library
- Create custom LUT from adjustments
- ACES color space LUTs
- Film emulation packs
