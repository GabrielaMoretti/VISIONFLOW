# VISIONFLOW - Libraries & Dependencies Guide

## 📚 Detailed Library Integration Guide

This document provides in-depth information about each library, integration strategies, and alternatives.

---

## 🎨 Image Processing Libraries

### 1. OpenCV.js (Computer Vision)

**Purpose**: Advanced image processing, segmentation, edge detection, feature extraction

**Installation**:
```bash
npm install opencv.js
# OR build from source for React Native
npm install react-native-opencv3
```

**Key Features**:
- Edge detection (Canny, Sobel)
- Image segmentation (GrabCut, Watershed)
- Feature detection (SIFT, SURF, ORB)
- Morphological operations
- Filtering (Bilateral, Gaussian, Median)

**Usage Example**:
```typescript
import cv from 'opencv.js';

// Edge detection
const src = cv.imread('canvas');
const dst = new cv.Mat();
cv.Canny(src, dst, 50, 150);
cv.imshow('outputCanvas', dst);

// GrabCut segmentation
const mask = new cv.Mat();
const bgdModel = new cv.Mat();
const fgdModel = new cv.Mat();
const rect = new cv.Rect(50, 50, 200, 200);
cv.grabCut(src, mask, rect, bgdModel, fgdModel, 1, cv.GC_INIT_WITH_RECT);
```

**React Native Integration**:
- Use `react-native-opencv3` for native bindings
- Fallback to opencv.js via WebView for complex operations

**Repository**: https://github.com/opencv/opencv

---

### 2. Sharp (High-Performance Image Processing)

**Purpose**: Fast image resizing, format conversion, basic transformations

**Installation**:
```bash
npm install sharp
```

**Key Features**:
- Fast resizing algorithms (lanczos, cubic, etc.)
- Format conversion (JPEG, PNG, WebP, TIFF, RAW)
- Color space conversion
- Image composition
- Metadata manipulation

**Usage Example**:
```typescript
import sharp from 'sharp';

// Resize and convert
await sharp('input.jpg')
  .resize(1920, 1080, { fit: 'inside' })
  .toFormat('png')
  .toFile('output.png');

// Extract metadata
const metadata = await sharp('input.jpg').metadata();

// Color space conversion
await sharp('input.jpg')
  .toColorspace('lab')
  .toBuffer();
```

**Performance**: 4-5x faster than ImageMagick, uses libvips

**Repository**: https://github.com/lovell/sharp

---

### 3. Jimp (Pure JavaScript Image Processing)

**Purpose**: Fallback for environments where native modules aren't available

**Installation**:
```bash
npm install jimp
```

**Key Features**:
- Pure JavaScript (no native dependencies)
- Basic image manipulation
- Filters and effects
- Text rendering
- Cross-platform

**Usage Example**:
```typescript
import Jimp from 'jimp';

// Load and process
const image = await Jimp.read('input.jpg');
image
  .resize(800, Jimp.AUTO)
  .quality(90)
  .greyscale()
  .write('output.jpg');

// Pixel manipulation
image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
  const red = image.bitmap.data[idx];
  const green = image.bitmap.data[idx + 1];
  const blue = image.bitmap.data[idx + 2];
  // Modify pixels
});
```

**Repository**: https://github.com/jimp-dev/jimp

---

## 🌈 Color Science Libraries

### 4. Color.js (Advanced Color Spaces)

**Purpose**: Perceptual color spaces, color conversions, ΔE calculations

**Installation**:
```bash
npm install colorjs.io
```

**Key Features**:
- LAB, LCH, OKLCH color spaces
- ΔE2000 color difference
- Gamut mapping
- Color interpolation
- CSS Color Level 4 support

**Usage Example**:
```typescript
import Color from 'colorjs.io';

// Color space conversion
const color = new Color('srgb', [1, 0.5, 0]);
const lab = color.to('lab');

// ΔE2000 calculation
const color1 = new Color('lab', [50, 20, 30]);
const color2 = new Color('lab', [55, 25, 35]);
const deltaE = color1.deltaE2000(color2);

// Color interpolation
const range = Color.range('oklch', ['red', 'blue']);
const midpoint = range(0.5);
```

**Repository**: https://github.com/LeaVerou/color.js

---

### 5. Culori (Fast Color Manipulation)

**Purpose**: Fast color space conversions and color utilities

**Installation**:
```bash
npm install culori
```

**Key Features**:
- Multiple color spaces (RGB, HSL, LAB, LCH, OKLCH)
- Fast conversions
- Color mixing and interpolation
- Gamut checking
- Color parsing

**Usage Example**:
```typescript
import { rgb, lab, interpolate, differenceEuclidean } from 'culori';

// Convert between spaces
const rgbColor = rgb('red');
const labColor = lab(rgbColor);

// Interpolate colors
const interpolator = interpolate(['red', 'blue'], 'oklch');
const midColor = interpolator(0.5);

// Color difference
const diff = differenceEuclidean('red', 'blue');
```

**Repository**: https://github.com/Evercoder/culori

---

## 🎥 Metadata & RAW Processing

### 6. exifr (EXIF Metadata)

**Purpose**: Fast, comprehensive EXIF/IPTC/XMP metadata extraction

**Installation**:
```bash
npm install exifr
```

**Key Features**:
- Fast parsing (3-50x faster than alternatives)
- Supports TIFF, EXIF, IPTC, XMP, ICC
- GPS data extraction
- Lens information
- Camera settings

**Usage Example**:
```typescript
import exifr from 'exifr';

// Extract all metadata
const metadata = await exifr.parse('photo.jpg');

// Extract specific tags
const camera = await exifr.parse('photo.jpg', {
  pick: ['Make', 'Model', 'LensModel', 'FocalLength', 'FNumber']
});

// Extract GPS
const gps = await exifr.gps('photo.jpg');
// Returns: { latitude: 50.08, longitude: 14.43 }
```

**Repository**: https://github.com/MikeKovarik/exifr

---

### 7. libraw (RAW Image Processing)

**Purpose**: Decode RAW images from digital cameras

**Installation**:
```bash
# Via WebAssembly
npm install libraw-js

# Or native module for Node.js
npm install raw-loader
```

**Key Features**:
- Supports 700+ camera RAW formats
- Demosaicing algorithms
- White balance
- Exposure adjustment
- DNG support

**Usage Example**:
```typescript
// Note: libraw-js may need custom WebAssembly build
import libraw from 'libraw-js';

const rawBuffer = await fs.readFile('image.cr2');
const decoded = await libraw.decode(rawBuffer);

// Access RGB data
const { width, height, data } = decoded;
```

**Alternative**: Use Sharp with libraw support:
```typescript
import sharp from 'sharp';

const buffer = await sharp('image.cr2')
  .raw()
  .toBuffer({ resolveWithObject: true });
```

**Repository**: https://github.com/LibRaw/LibRaw

---

## 🎮 GPU & WebGL Libraries

### 8. Three.js (WebGL Framework)

**Purpose**: 3D rendering, shader-based image processing

**Installation**:
```bash
npm install three
npm install @react-three/fiber  # React integration
```

**Key Features**:
- WebGL abstraction
- Shader materials
- Post-processing effects
- Texture management
- Render targets

**Usage Example**:
```typescript
import * as THREE from 'three';

// Create shader material
const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse: { value: null },
    bokehStrength: { value: 1.0 }
  },
  vertexShader: vertexShaderCode,
  fragmentShader: fragmentShaderCode
});

// Apply to plane
const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, shaderMaterial);
```

**Repository**: https://github.com/mrdoob/three.js

---

### 9. gpu.js (GPU Computing)

**Purpose**: General-purpose GPU computing in JavaScript

**Installation**:
```bash
npm install gpu.js
```

**Key Features**:
- Automatic GPU/CPU fallback
- Parallel processing
- Custom kernels
- Matrix operations

**Usage Example**:
```typescript
import { GPU } from 'gpu.js';

const gpu = new GPU();

// Create convolution kernel
const convolve = gpu.createKernel(function(image, kernel) {
  let sum = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      sum += image[this.thread.y + i][this.thread.x + j] * kernel[i][j];
    }
  }
  return sum;
}).setOutput([width, height]);

const result = convolve(imageArray, sharpenKernel);
```

**Repository**: https://github.com/gpujs/gpu.js

---

### 10. regl (Functional WebGL)

**Purpose**: Simplified, functional WebGL API

**Installation**:
```bash
npm install regl
```

**Key Features**:
- Functional API
- Automatic state management
- Batch rendering
- Resource management

**Usage Example**:
```typescript
import createREGL from 'regl';

const regl = createREGL();

const drawImage = regl({
  frag: `
    precision mediump float;
    uniform sampler2D texture;
    varying vec2 uv;
    void main() {
      gl_FragColor = texture2D(texture, uv);
    }
  `,
  vert: `
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = position;
      gl_Position = vec4(2.0 * position - 1.0, 0, 1);
    }
  `,
  attributes: {
    position: [
      [0, 0], [1, 0], [1, 1],
      [0, 0], [1, 1], [0, 1]
    ]
  },
  uniforms: {
    texture: regl.prop('texture')
  },
  count: 6
});
```

**Repository**: https://github.com/regl-project/regl

---

## 📦 File Format Support

### 11. libheif (HEIC/HEIF Support)

**Purpose**: Decode HEIC/HEIF images from iOS devices

**Installation**:
```bash
npm install heic-convert
# OR
npm install libheif-js
```

**Usage Example**:
```typescript
import convert from 'heic-convert';

const heicBuffer = await fs.readFile('photo.heic');
const jpegBuffer = await convert({
  buffer: heicBuffer,
  format: 'JPEG',
  quality: 0.9
});
```

**Repository**: https://github.com/strukturag/libheif

---

## 🧠 Machine Learning (Optional)

### 12. MiDaS (Monocular Depth Estimation)

**Purpose**: Generate depth maps from single images

**Installation**:
```bash
# Use ONNX Runtime for inference
npm install onnxruntime-web

# Download MiDaS model
# https://github.com/isl-org/MiDaS/releases
```

**Usage Example**:
```typescript
import * as ort from 'onnxruntime-web';

// Load model
const session = await ort.InferenceSession.create('midas_v21_small.onnx');

// Prepare input (384x384 RGB)
const inputTensor = new ort.Tensor('float32', preprocessedData, [1, 3, 384, 384]);

// Run inference
const results = await session.run({ input: inputTensor });
const depthMap = results.output.data;
```

**Note**: This adds ~20MB to bundle size. Consider optional download.

**Repository**: https://github.com/isl-org/MiDaS

---

### 13. U^2-Net (Salient Object Detection)

**Purpose**: Foreground/background segmentation

**Installation**:
```bash
npm install @tensorflow/tfjs
# Download U^2-Net model converted to TensorFlow.js
```

**Usage Example**:
```typescript
import * as tf from '@tensorflow/tfjs';

// Load model
const model = await tf.loadGraphModel('u2net/model.json');

// Preprocess image
const input = tf.browser.fromPixels(imageElement)
  .resizeNearestNeighbor([320, 320])
  .toFloat()
  .div(255)
  .expandDims();

// Run prediction
const prediction = model.predict(input);
const mask = await prediction.squeeze().array();
```

**Repository**: https://github.com/xuebinqin/U-2-Net

---

## 🔧 Utilities

### 14. Comlink (Web Workers)

**Purpose**: Simplified Web Workers communication

**Installation**:
```bash
npm install comlink
```

**Usage Example**:
```typescript
// worker.ts
import { expose } from 'comlink';

const api = {
  async processImage(imageData: ImageData) {
    // Heavy processing
    return processedData;
  }
};

expose(api);

// main.ts
import { wrap } from 'comlink';

const worker = new Worker('./worker.ts');
const api = wrap(worker);

const result = await api.processImage(imageData);
```

**Repository**: https://github.com/GoogleChromeLabs/comlink

---

## 📊 Dependency Summary

### Core Dependencies (Required)
```json
{
  "react-native": "^0.73.0",
  "@reduxjs/toolkit": "^2.0.0",
  "exifr": "^7.1.3",
  "culori": "^4.0.0",
  "jimp": "^0.22.0"
}
```

### Enhanced Processing (Recommended)
```json
{
  "sharp": "^0.33.0",
  "opencv.js": "^1.2.1",
  "three": "^0.160.0",
  "gpu.js": "^2.16.0"
}
```

### Advanced Features (Optional)
```json
{
  "heic-convert": "^2.1.0",
  "onnxruntime-web": "^1.16.0",
  "@tensorflow/tfjs": "^4.15.0"
}
```

---

## 🎯 Integration Strategy

### Tier 1: Essential (Week 1-4)
- exifr
- Jimp or Sharp
- Culori
- Redux Toolkit

### Tier 2: Core Features (Week 5-10)
- OpenCV.js
- Three.js
- Comlink (workers)

### Tier 3: Advanced (Week 11-16)
- gpu.js
- HEIC support
- Depth estimation (MiDaS)

### Tier 4: Professional (Week 17-24)
- Segmentation (U^2-Net)
- LUT management
- Performance optimization

---

## 📝 Installation Script

Create `scripts/install-dependencies.sh`:

```bash
#!/bin/bash

echo "Installing VISIONFLOW dependencies..."

# Core
npm install react react-native expo
npm install @reduxjs/toolkit react-redux redux-persist
npm install @react-navigation/native @react-navigation/stack

# Image processing
npm install exifr culori jimp

# Optional: Sharp (requires native modules)
if [[ "$PLATFORM" == "node" ]]; then
  npm install sharp
fi

# Optional: OpenCV
if [[ "$INCLUDE_OPENCV" == "true" ]]; then
  npm install opencv.js
fi

# WebGL
npm install three @react-three/fiber

# Utilities
npm install comlink

echo "Dependencies installed successfully!"
```

---

## 🔄 Alternative Libraries

### Image Processing
- **Pillow (Python)**: If considering Python backend
- **ImageMagick**: If shell scripting is acceptable
- **vips**: Alternative to Sharp

### Color Science
- **chroma.js**: Simpler alternative to Culori
- **tinycolor2**: Lightweight color utilities

### GPU Processing
- **WebGPU API**: Next-gen (limited browser support)
- **gl.js**: Alternative to Three.js

---

## 📚 Learning Resources

- [OpenCV.js Tutorial](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [Color Science Primer](https://www.color.org/)
- [ACES Documentation](https://www.oscars.org/science-technology/aces)

---

## ⚡ Newly Integrated Libraries (v2 — OKLCH Pipeline)

### Frontend

#### Culori (npm: culori)
**Purpose**: Core color science — OKLCH, OKLab, Display-P3, ΔE2000
**Status**: ✅ Integrated in `lib/color/colorSpaces.ts`
**Impact**: Replaces hand-rolled HSL math with perceptually uniform OKLCH.
Every hue rotation and saturation adjustment is now visually consistent.

#### Color.js (npm: colorjs.io)
**Purpose**: Gamut mapping, color space conversions, Display-P3 export
**Status**: ✅ Installed, available for wide-gamut workflows

#### regl (npm: regl)
**Purpose**: Functional WebGL abstraction for shader pipeline management
**Status**: ✅ Integrated in `lib/shaders/shaderManager.ts`
**Impact**: Clean API for GPU-based color grading. The `ShaderPipeline` class
connects mood adjustments directly to GLSL shaders via `renderMood()`.

### Backend (Python)

#### colour-science (pip: colour-science)
**Purpose**: Bradford chromatic adaptation, precise CCT (Kelvin), XYZ/xyY
**Status**: ✅ Integrated in `processing/color_flow.py`
**Impact**: `estimateColorTemperature` is now physically accurate instead of
hue-based approximation. Returns real Kelvin values.

#### rembg (pip: rembg)
**Purpose**: Zero-config background removal via U²-Net
**Status**: ✅ Integrated in `processing/segmentation.py`
**Impact**: Background removal works out of the box — model downloads
automatically on first use (~170MB).

#### Real-ESRGAN via ONNX Runtime (pip: onnxruntime)
**Purpose**: AI super-resolution (4x upscaling)
**Status**: ✅ Integrated in `processing/upscaling.py`
**Impact**: ~17MB ONNX model, processes in tiles for memory efficiency.
Includes bicubic fallback when model is unavailable.

### Shader Pipeline

#### GLSL Color Spaces (inline, based on glsl-color-spaces)
**Purpose**: sRGB ↔ Linear, OKLab, OKLCH conversions on GPU
**Status**: ✅ Integrated in `lib/shaders/colorGrading.glsl`
**Impact**: All color grading happens in linear space, eliminating the
"heavy/filtered" look caused by gamma-encoded math.

#### Filmic Tonemapping (Blender-style)
**Purpose**: Cinematic S-curve with highlight rolloff and shadow lift
**Status**: ✅ Implemented in `lib/color/toneMapping.ts` + GLSL
**Impact**: 5 preset curves (default, high contrast, very high contrast,
low contrast, classic film). Automatic preset selection based on mood.

#### Hald CLUT / .cube LUT System
**Purpose**: 3D color lookup tables for instant cinematic grading
**Status**: ✅ Implemented in `lib/color/lut.ts`
**Impact**: Supports both Hald CLUT images (PNG) and .cube files (Adobe/Resolve).
Trilinear interpolation for smooth transitions. Identity CLUT generator included.

---

See `IMPLEMENTATION_GUIDE.md` for integration examples.
