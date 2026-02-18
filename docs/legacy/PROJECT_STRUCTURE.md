# VISIONFLOW - Project Structure

## 📁 Recommended Folder Structure

```
visionflow/
├── README.md
├── ARCHITECTURE.md
├── IMPLEMENTATION_GUIDE.md
├── package.json
├── tsconfig.json
├── .gitignore
├── .eslintrc.js
├── .prettierrc
│
├── app/                          # React Native app entry
│   ├── index.tsx
│   ├── App.tsx
│   └── app.json
│
├── src/
│   ├── core/                     # Core processing modules
│   │   ├── analysis/
│   │   │   ├── exifReader.ts
│   │   │   ├── histogramAnalyzer.ts
│   │   │   ├── lightMapGenerator.ts
│   │   │   └── structureAnalyzer.ts
│   │   │
│   │   ├── separation/           # Layer separation engine
│   │   │   ├── segmentation.ts
│   │   │   ├── depthEstimation.ts
│   │   │   ├── materialDetection.ts
│   │   │   ├── maskGenerator.ts
│   │   │   └── edgeRefinement.ts
│   │   │
│   │   ├── color/                # Colorimetry module
│   │   │   ├── colorSpaces.ts
│   │   │   ├── whiteBalance.ts
│   │   │   ├── curves.ts
│   │   │   ├── deltaE.ts
│   │   │   └── saturation.ts
│   │   │
│   │   ├── depth/                # Depth control & bokeh
│   │   │   ├── depthMap.ts
│   │   │   ├── bokehSimulator.ts
│   │   │   ├── focusControl.ts
│   │   │   └── dofCalculator.ts
│   │   │
│   │   ├── lens/                 # Lens simulation
│   │   │   ├── lensProfiles.ts
│   │   │   ├── distortion.ts
│   │   │   ├── chromaticAberration.ts
│   │   │   ├── vignette.ts
│   │   │   └── flare.ts
│   │   │
│   │   ├── texture/              # Texture & refinement
│   │   │   ├── frequencySeparation.ts
│   │   │   ├── sharpening.ts
│   │   │   ├── microContrast.ts
│   │   │   └── filmGrain.ts
│   │   │
│   │   └── export/               # Look builder & export
│   │       ├── lutGenerator.ts
│   │       ├── lutExporter.ts
│   │       ├── presetManager.ts
│   │       └── colorGrading.ts
│   │
│   ├── processing/               # WebGL/GPU processing
│   │   ├── shaders/
│   │   │   ├── bokeh.glsl
│   │   │   ├── colorGrade.glsl
│   │   │   ├── distortion.glsl
│   │   │   ├── grain.glsl
│   │   │   └── sharpen.glsl
│   │   ├── webgl/
│   │   │   ├── webglRenderer.ts
│   │   │   ├── shaderCompiler.ts
│   │   │   └── textureManager.ts
│   │   └── workers/
│   │       ├── imageProcessor.worker.ts
│   │       ├── depthEstimation.worker.ts
│   │       └── colorCorrection.worker.ts
│   │
│   ├── io/                       # Input/Output
│   │   ├── imageLoader.ts
│   │   ├── rawDecoder.ts
│   │   ├── heicDecoder.ts
│   │   ├── imageExporter.ts
│   │   └── formatConverter.ts
│   │
│   ├── state/                    # State management
│   │   ├── store.ts
│   │   ├── slices/
│   │   │   ├── imageSlice.ts
│   │   │   ├── editorSlice.ts
│   │   │   ├── layersSlice.ts
│   │   │   ├── historySlice.ts
│   │   │   └── settingsSlice.ts
│   │   └── middleware/
│   │       └── historyMiddleware.ts
│   │
│   ├── ui/                       # User Interface
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── EditorScreen.tsx
│   │   │   ├── LibraryScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── Canvas/
│   │   │   │   ├── ImageCanvas.tsx
│   │   │   │   ├── LayerPreview.tsx
│   │   │   │   └── DepthVisualization.tsx
│   │   │   │
│   │   │   ├── Controls/
│   │   │   │   ├── CurveEditor.tsx
│   │   │   │   ├── SliderControl.tsx
│   │   │   │   ├── ColorPicker.tsx
│   │   │   │   ├── MaskEditor.tsx
│   │   │   │   └── LensProfileSelector.tsx
│   │   │   │
│   │   │   ├── Panels/
│   │   │   │   ├── AnalysisPanel.tsx
│   │   │   │   ├── ColorPanel.tsx
│   │   │   │   ├── DepthPanel.tsx
│   │   │   │   ├── LensPanel.tsx
│   │   │   │   ├── TexturePanel.tsx
│   │   │   │   └── LookBuilderPanel.tsx
│   │   │   │
│   │   │   └── Common/
│   │   │       ├── Button.tsx
│   │   │       ├── Slider.tsx
│   │   │       ├── Dropdown.tsx
│   │   │       └── Modal.tsx
│   │   │
│   │   ├── navigation/
│   │   │   ├── AppNavigator.tsx
│   │   │   └── TabNavigator.tsx
│   │   │
│   │   └── theme/
│   │       ├── colors.ts
│   │       ├── typography.ts
│   │       └── spacing.ts
│   │
│   ├── utils/                    # Utilities
│   │   ├── math/
│   │   │   ├── bezier.ts
│   │   │   ├── matrix.ts
│   │   │   └── interpolation.ts
│   │   ├── image/
│   │   │   ├── colorConversion.ts
│   │   │   ├── histogram.ts
│   │   │   └── kernels.ts
│   │   ├── storage/
│   │   │   ├── cache.ts
│   │   │   ├── database.ts
│   │   │   └── filesystem.ts
│   │   └── validation/
│   │       ├── imageValidator.ts
│   │       └── formatValidator.ts
│   │
│   ├── types/                    # TypeScript types
│   │   ├── image.types.ts
│   │   ├── layer.types.ts
│   │   ├── color.types.ts
│   │   ├── lens.types.ts
│   │   └── export.types.ts
│   │
│   └── constants/                # Constants
│       ├── imageFormats.ts
│       ├── lensProfiles.ts
│       ├── colorSpaces.ts
│       └── presets.ts
│
├── assets/                       # Static assets
│   ├── luts/                     # LUT files
│   │   ├── aces/
│   │   ├── cinematic/
│   │   └── analog/
│   ├── lens-profiles/            # Lens profile database
│   │   ├── arri/
│   │   ├── cooke/
│   │   └── zeiss/
│   ├── icons/
│   └── fonts/
│
├── native/                       # Native modules (if needed)
│   ├── android/
│   └── ios/
│
├── wasm/                         # WebAssembly modules
│   ├── opencv/
│   ├── color-science/
│   └── depth-estimation/
│
├── tests/                        # Tests
│   ├── unit/
│   │   ├── core/
│   │   ├── processing/
│   │   └── utils/
│   ├── integration/
│   └── e2e/
│
├── docs/                         # Documentation
│   ├── api/
│   ├── user-guide/
│   └── technical/
│
└── scripts/                      # Build & dev scripts
    ├── build-wasm.sh
    ├── generate-luts.js
    └── setup-opencv.sh
```

---

## 📦 Key Configuration Files

### package.json (Core Dependencies)

```json
{
  "name": "visionflow",
  "version": "0.1.0",
  "description": "Professional image editor with physical-based processing",
  "main": "app/index.tsx",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build": "expo build",
    "test": "jest",
    "lint": "eslint src/ --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.73.0",
    "react-native-web": "^0.19.0",
    "expo": "^50.0.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "redux-persist": "^6.0.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "exifr": "^7.1.3",
    "culori": "^4.0.0",
    "sharp": "^0.33.0",
    "jimp": "^0.22.0",
    "opencv.js": "^1.2.1",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "gl-matrix": "^3.4.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-native": "^0.73.0",
    "typescript": "^5.3.0",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.4.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-native",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/core/*"],
      "@processing/*": ["src/processing/*"],
      "@io/*": ["src/io/*"],
      "@state/*": ["src/state/*"],
      "@ui/*": ["src/ui/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@constants/*": ["src/constants/*"]
    }
  },
  "include": ["src/**/*", "app/**/*"],
  "exclude": ["node_modules", "dist", "build"]
}
```

### .gitignore

```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build
dist/
build/
.expo/
.expo-shared/

# Native
android/
ios/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local

# Cache
.cache/
*.log

# Tests
coverage/

# Temporary
tmp/
temp/
*.tmp
```

---

## 🏗️ Module Organization Principles

### 1. Separation of Concerns
- **core/**: Pure image processing logic (no UI dependencies)
- **processing/**: GPU/performance-critical operations
- **ui/**: React components and UI logic
- **state/**: Global state management

### 2. Dependency Flow
```
UI Components → State → Core Modules → Processing Layer
```

### 3. Testability
- Core modules should be pure functions when possible
- UI components should be presentational
- Business logic in Redux slices

### 4. Performance
- Heavy operations in Web Workers
- GPU acceleration via WebGL
- WebAssembly for critical algorithms

---

## 🔌 Integration Points

### Core Module Exports

Each core module exports:
1. **Main processing function**
2. **Types/interfaces**
3. **Constants**
4. **Configuration options**

Example:
```typescript
// src/core/color/curves.ts
export interface CurvePoint {
  x: number;
  y: number;
}

export interface CurveConfig {
  points: CurvePoint[];
  interpolation: 'linear' | 'cubic';
}

export function applyCurve(
  imageData: ImageData,
  config: CurveConfig
): ImageData {
  // Implementation
}
```

---

## 📊 Data Flow

```
Image Upload
     ↓
EXIF Extraction
     ↓
Image Analysis (histogram, light map)
     ↓
Redux State Update
     ↓
UI Render
     ↓
User Adjustment
     ↓
Processing Pipeline
     ↓
Canvas Update
     ↓
Export
```

---

## 🎯 Module Dependencies

```
core/analysis        → [exifr]
core/separation      → [opencv.js, workers]
core/color          → [culori, color.js]
core/depth          → [opencv.js, three.js]
core/lens           → [gl-matrix, shaders]
core/texture        → [opencv.js, shaders]
core/export         → [culori, file system]

processing/webgl    → [three.js, regl]
processing/workers  → [comlink]

io/*                → [sharp, jimp, exifr]

ui/*                → [react-native, redux]
```

---

## 🚀 Getting Started

See `IMPLEMENTATION_GUIDE.md` for step-by-step setup instructions.
