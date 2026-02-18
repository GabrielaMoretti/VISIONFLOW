# VISIONFLOW - Architecture & Technology Stack

## 📋 Executive Summary

VISIONFLOW is a professional image editor focused on physical and optical image processing, providing cinematographic quality editing without AI generation. This document outlines the complete technology stack, architecture, and implementation strategy.

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  React Native / Electron (Cross-Platform Desktop + Mobile) │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│          TypeScript/JavaScript Business Logic               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Processing Layer                           │
│   WebAssembly + Native Modules (C++/Rust)                  │
│   - OpenCV, libraw, OpenColorIO, etc.                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Storage Layer                            │
│      IndexedDB / SQLite / File System                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### 1. Frontend Framework

**Primary Choice: React Native + React Native Web**
- **Why**: Cross-platform (iOS, Android, Web, Desktop via Electron)
- **UI Library**: React Native Paper or NativeBase
- **State Management**: Redux Toolkit + Redux Persist
- **Alternative**: Tauri (Rust-based, lighter than Electron)

**Key Dependencies:**
```json
{
  "react": "^18.2.0",
  "react-native": "^0.73.0",
  "react-native-web": "^0.19.0",
  "expo": "^50.0.0",
  "@reduxjs/toolkit": "^2.0.0",
  "react-redux": "^9.0.0"
}
```

### 2. Image Processing Core

**Primary Libraries:**

#### a) **OpenCV.js / OpenCV Native**
- **Purpose**: Image analysis, edge detection, feature extraction
- **Usage**: Layer separation, depth mapping, segmentation
- **Integration**: 
  - Web: opencv.js (WebAssembly)
  - Native: react-native-opencv3

```javascript
// Example repository to reference:
// https://github.com/opencv/opencv
// https://github.com/adamgf/react-native-opencv3
```

#### b) **Sharp (Node.js) / Jimp**
- **Purpose**: Fast image manipulation, format conversion
- **Usage**: Basic transformations, resizing, format handling
```javascript
// Repository: https://github.com/lovell/sharp
```

#### c) **libraw / dcraw**
- **Purpose**: RAW image processing
- **Usage**: RAW file import and demosaicing
```javascript
// Repository: https://github.com/LibRaw/LibRaw
```

#### d) **Exiv2**
- **Purpose**: EXIF metadata reading/writing
- **Usage**: Camera data extraction, lens profiles
```javascript
// Repository: https://github.com/Exiv2/exiv2
// JS Wrapper: exifr or piexifjs
```

### 3. Color Science & Color Management

#### a) **OpenColorIO (OCIO)**
- **Purpose**: Professional color management, LUT application
- **Usage**: Color grading, ACES workflow, LUT export
```javascript
// Repository: https://github.com/AcademySoftwareFoundation/OpenColorIO
// WebAssembly build needed or use color.js for web
```

#### b) **Color.js / Culori**
- **Purpose**: Perceptual color spaces (LAB, LCH, OKLCH)
- **Usage**: ΔE2000 calculations, color harmony
```javascript
// Repository: https://github.com/LeaVerou/color.js
// Repository: https://github.com/Evercoder/culori
```

#### c) **ACES (Academy Color Encoding System)**
- **Purpose**: Industry-standard color pipeline
- **Integration**: Use ACES LUTs and transforms
```javascript
// Reference: https://github.com/ampas/aces-dev
```

### 4. Advanced Image Processing

#### a) **Bilateral Filter & Guided Filter**
- **Purpose**: Edge-preserving smoothing, frequency separation
- **Implementation**: Custom GLSL shaders or OpenCV

#### b) **Depth Estimation**
- **Purpose**: Depth map generation from single images
- **Options**:
  - MiDaS (Depth estimation model - lighter than full AI)
  - Multi-scale frequency analysis approach
  - Stereo depth from EXIF data when available
```javascript
// Repository: https://github.com/isl-org/MiDaS
```

#### c) **Segmentation & Masking**
- **Purpose**: Foreground/background separation
- **Options**:
  - U^2-Net (Salient object detection)
  - Traditional watershed + GrabCut algorithms
```javascript
// Repository: https://github.com/xuebinqin/U-2-Net
// OpenCV GrabCut implementation
```

### 5. GPU Acceleration

#### a) **WebGL / WebGPU**
- **Purpose**: Real-time shader-based processing
- **Libraries**:
  - Three.js (WebGL wrapper)
  - regl (functional WebGL)
  - gpu.js (GPU computation)

```javascript
// Repository: https://github.com/mrdoob/three.js
// Repository: https://github.com/regl-project/regl
// Repository: https://github.com/gpujs/gpu.js
```

#### b) **GLSL Shaders**
- **Purpose**: Custom filters, color grading, optical effects
- **Examples**:
  - Bokeh simulation
  - Lens distortion
  - Chromatic aberration
  - Film grain

### 6. File Format Support

#### Image Formats:
- **JPEG/PNG**: Built-in support
- **HEIC**: heic-convert or libheif
- **RAW**: libraw-js or dcraw-wasm
- **TIFF**: tiff.js
- **DNG**: Adobe DNG SDK or libraw

```javascript
// Repository: https://github.com/catdad-experiments/libraw-js
// Repository: https://github.com/strukturag/libheif
```

### 7. Storage & Caching

- **IndexedDB**: For web-based editor state
- **SQLite**: For desktop apps (via react-native-sqlite-storage)
- **File System**: Direct file access for desktop/mobile

### 8. Performance Optimization

#### a) **WebAssembly**
- **Purpose**: Near-native performance for heavy computations
- **Libraries**: 
  - AssemblyScript
  - Emscripten (C/C++ to WASM)
  - wasm-pack (Rust to WASM)

#### b) **Web Workers / Worker Threads**
- **Purpose**: Non-blocking processing
- **Library**: Comlink (simplified workers)

```javascript
// Repository: https://github.com/GoogleChromeLabs/comlink
```

---

## 📦 Core Module Architecture

### 1. Import & Analysis Module

**Technologies:**
- exifr or piexifjs for EXIF reading
- Sharp or Jimp for image loading
- Custom histogram analyzer (WebGL or Canvas API)

**Key Functions:**
```typescript
interface ImageAnalysis {
  metadata: EXIFData;
  histogram: RGB[];
  lightMap: Float32Array;
  contrastMap: Float32Array;
  structuralData: ImageStructure;
}
```

### 2. Layer Separation Engine

**Technologies:**
- OpenCV.js: Edge detection, watershed segmentation
- GrabCut algorithm for foreground extraction
- Guided filter for mask refinement
- Optional: U^2-Net for deep saliency (pre-trained, inference only)

**Key Functions:**
```typescript
interface LayerSeparation {
  foregroundMask: ImageData;
  depthMap: Float32Array;
  materialMap: MaterialType[];
  illuminationMap: Float32Array;
}
```

### 3. Colorimetry Module

**Technologies:**
- Color.js for color space conversions
- Custom curves implementation (Bézier or cubic splines)
- ΔE2000 calculations for perceptual equality

**Key Functions:**
```typescript
interface ColorCorrection {
  whiteBalance: ColorTemperature;
  tonalCurves: CurveSet;
  saturation: number;
  contrast: number;
}
```

### 4. Depth Control & Bokeh

**Technologies:**
- Depth map from MiDaS or custom frequency analysis
- Custom bokeh shader (GLSL)
- Physically-based circle of confusion calculation

**Key Functions:**
```typescript
interface DepthControl {
  aperture: number; // f-stop
  focalPlane: number; // distance
  bokehShape: BokehKernel;
  vignette: number;
}
```

### 5. Lens Simulation Engine

**Technologies:**
- GLSL shaders for optical effects
- Lens profile database (JSON/SQLite)
- Distortion algorithms (radial + tangential)

**Key Functions:**
```typescript
interface LensProfile {
  distortion: DistortionParams;
  vignette: VignetteParams;
  chromaticAberration: CAParams;
  flare: FlareParams;
}
```

### 6. Texture & Refinement

**Technologies:**
- Bilateral filter (edge-preserving)
- Frequency separation (high/low pass)
- Film grain synthesis (noise generation)

**Key Functions:**
```typescript
interface TextureControl {
  sharpness: number;
  microContrast: number;
  grain: GrainParams;
  clarity: number;
}
```

### 7. Look Builder & LUT Export

**Technologies:**
- OpenColorIO or color.js for LUT generation
- 3D LUT export (Cube format)
- Preset management system

**Key Functions:**
```typescript
interface LookBuilder {
  baseLUT: LUT3D;
  adjustments: ColorGrading;
  exportFormat: 'cube' | 'vlt' | 'look';
}
```

---

## 🔗 Reference Repositories to Study/Integrate

### Image Processing:
1. **OpenCV** - https://github.com/opencv/opencv
2. **Sharp** - https://github.com/lovell/sharp
3. **Jimp** - https://github.com/jimp-dev/jimp
4. **libraw** - https://github.com/LibRaw/LibRaw

### Color Science:
5. **Color.js** - https://github.com/LeaVerou/color.js
6. **Culori** - https://github.com/Evercoder/culori
7. **OpenColorIO** - https://github.com/AcademySoftwareFoundation/OpenColorIO
8. **ACES** - https://github.com/ampas/aces-dev

### Computer Vision:
9. **MiDaS** - https://github.com/isl-org/MiDaS (Depth estimation)
10. **U^2-Net** - https://github.com/xuebinqin/U-2-Net (Salient object detection)

### WebGL/GPU:
11. **Three.js** - https://github.com/mrdoob/three.js
12. **regl** - https://github.com/regl-project/regl
13. **gpu.js** - https://github.com/gpujs/gpu.js

### File Formats:
14. **libheif** - https://github.com/strukturag/libheif (HEIC)
15. **exifr** - https://github.com/MikeKovarik/exifr

### Frameworks:
16. **React Native** - https://github.com/facebook/react-native
17. **Electron** - https://github.com/electron/electron
18. **Tauri** - https://github.com/tauri-apps/tauri

### Image Editors (Reference):
19. **Darktable** - https://github.com/darktable-org/darktable (RAW editor)
20. **RawTherapee** - https://github.com/Beep6581/RawTherapee
21. **Pixelmator** - Study for UX inspiration
22. **Photopea** - Web-based editor (study architecture)

---

## 🚀 Development Phases

### Phase 1: Foundation (Weeks 1-4)
- Set up React Native + Expo project
- Implement basic image import (JPEG, PNG)
- Create UI shell and navigation
- Set up Redux state management
- EXIF metadata reading

### Phase 2: Core Processing (Weeks 5-10)
- Integrate OpenCV.js
- Implement histogram and analysis tools
- Basic color correction (curves, white balance)
- Layer separation prototype
- File format support (RAW, HEIC)

### Phase 3: Advanced Features (Weeks 11-16)
- Depth map generation
- Bokeh simulation
- Lens profiles and optical effects
- Texture refinement tools
- GPU acceleration (WebGL shaders)

### Phase 4: Look Builder (Weeks 17-20)
- LUT generation and export
- Preset system
- Color grading tools
- ACES integration

### Phase 5: Polish & Performance (Weeks 21-24)
- Performance optimization
- WebAssembly compilation
- UI/UX refinement
- Export optimization
- Testing and bug fixes

---

## 🎯 Recommended Starting Point

1. **Initialize React Native + Expo project**
2. **Add Sharp for image manipulation**
3. **Integrate exifr for metadata**
4. **Implement basic UI with image upload**
5. **Add color correction module (curves)**
6. **Integrate OpenCV.js for advanced processing**

---

## 📝 Next Steps

See `IMPLEMENTATION_GUIDE.md` for detailed implementation instructions and `PROJECT_STRUCTURE.md` for folder organization.
