/**
 * Hald CLUT (Color Lookup Table) System
 *
 * Implements loading and application of Hald CLUT images — the standard format
 * used by professional editors like Darktable and RawTherapee.
 *
 * What is a Hald CLUT?
 *   A Hald CLUT is a 3D LUT encoded as a 2D image. A Level-N Hald CLUT is an
 *   image of (N*N)×(N*N) pixels where each pixel represents a mapping from
 *   one RGB color to another. Common sizes: Level 8 (64×64 pixels → 512×512 image),
 *   Level 12 (144×144 pixels → 1728×1728 image).
 *
 * Why Hald CLUTs?
 *   - Immediate professional results (cinematic LUT packs are freely available)
 *   - Format is just a PNG — no special parser needed
 *   - RawTherapee Creative LUTs Pack is an excellent free starting point
 *   - Can be blended with strength slider for subtle application
 *
 * @module lut
 */

import { srgbToLinear, linearToSrgb } from './toneMapping';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HaldClut {
  /** The loaded CLUT pixel data */
  data: Uint8ClampedArray;
  /** CLUT level (e.g., 8 means 8³ = 512 entries per axis) */
  level: number;
  /** Image dimensions (width = height = level²) */
  size: number;
  /** Human-readable name */
  name: string;
}

export interface LutMetadata {
  name: string;
  category: 'cinematic' | 'analog' | 'bw' | 'creative' | 'correction' | 'custom';
  description?: string;
  author?: string;
}

// ---------------------------------------------------------------------------
// Identity CLUT generation
// ---------------------------------------------------------------------------

/**
 * Generate an identity Hald CLUT (no-op transform).
 * This is the starting point — applying this CLUT produces the original image.
 * You can also open this in Photoshop/GIMP, apply your grading, and save as a new CLUT.
 *
 * @param level — CLUT precision level (8 is standard, 12 is high-quality)
 */
export function generateIdentityClut(level: number = 8): HaldClut {
  const cubeSize = level * level; // number of entries per color axis
  const imageSize = cubeSize;     // image is cubeSize × cubeSize
  const data = new Uint8ClampedArray(imageSize * imageSize * 4);

  for (let y = 0; y < imageSize; y++) {
    for (let x = 0; x < imageSize; x++) {
      const index = (y * imageSize + x) * 4;

      // Calculate the 3D position in the color cube
      const pixelIndex = y * imageSize + x;

      const r = (pixelIndex % cubeSize) / (cubeSize - 1);
      const g = (Math.floor(pixelIndex / cubeSize) % cubeSize) / (cubeSize - 1);
      const b = Math.floor(pixelIndex / (cubeSize * cubeSize)) / (cubeSize - 1);

      data[index] = Math.round(r * 255);
      data[index + 1] = Math.round(g * 255);
      data[index + 2] = Math.round(b * 255);
      data[index + 3] = 255;
    }
  }

  return {
    data,
    level,
    size: imageSize,
    name: 'Identity',
  };
}

// ---------------------------------------------------------------------------
// CLUT loading
// ---------------------------------------------------------------------------

/**
 * Load a Hald CLUT from an HTMLImageElement.
 * The image must be square and its side length must be a perfect square
 * (e.g., 64 = 8², 512 = cubeSize² where level=8).
 */
export function loadClutFromImage(
  image: HTMLImageElement,
  name: string = 'Custom LUT'
): HaldClut {
  const canvas = document.createElement('canvas');
  const size = image.width;
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, size, size);

  // Determine level: size = level²
  const level = Math.round(Math.sqrt(size));
  if (level * level !== size) {
    throw new Error(
      `Invalid Hald CLUT size: ${size}×${size}. ` +
      `Must be a perfect square (e.g., 64×64 for level 8).`
    );
  }

  return {
    data: imageData.data,
    level,
    size,
    name,
  };
}

/**
 * Load a Hald CLUT from a URL path.
 * Returns a promise that resolves when the CLUT is loaded and parsed.
 */
export function loadClutFromUrl(
  url: string,
  name?: string
): Promise<HaldClut> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const clutName = name ?? url.split('/').pop()?.replace(/\.\w+$/, '') ?? 'Custom LUT';
        resolve(loadClutFromImage(img, clutName));
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = () => reject(new Error(`Failed to load CLUT image: ${url}`));
    img.src = url;
  });
}

// ---------------------------------------------------------------------------
// CLUT application
// ---------------------------------------------------------------------------

/**
 * Apply a Hald CLUT to an ImageData buffer.
 *
 * How it works:
 *   For each pixel, the RGB values are used as coordinates in the 3D color cube.
 *   The CLUT provides the mapped output color at those coordinates.
 *   Trilinear interpolation ensures smooth transitions between CLUT entries.
 *
 * @param imageData — source ImageData (modified in-place)
 * @param clut — the Hald CLUT to apply
 * @param strength — 0.0 (no effect) to 1.0 (full CLUT application)
 * @param linearSpace — if true, apply in linear light (more accurate but slower)
 */
export function applyHaldClut(
  imageData: ImageData,
  clut: HaldClut,
  strength: number = 1.0,
  linearSpace: boolean = false
): void {
  const data = imageData.data;
  const clutData = clut.data;
  const cubeSize = clut.level * clut.level;
  const s = Math.max(0, Math.min(1, strength));

  if (s === 0) return; // no-op

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] / 255;
    let g = data[i + 1] / 255;
    let b = data[i + 2] / 255;

    // CLUT lookup always uses sRGB-gamma coordinates (the CLUT was built in sRGB).
    // Do NOT linearize before lookup — the CLUT itself maps gamma→gamma.

    // Scale to CLUT coordinates
    const rScaled = r * (cubeSize - 1);
    const gScaled = g * (cubeSize - 1);
    const bScaled = b * (cubeSize - 1);

    // Floor indices for trilinear interpolation
    const r0 = Math.floor(rScaled);
    const g0 = Math.floor(gScaled);
    const b0 = Math.floor(bScaled);
    const r1 = Math.min(r0 + 1, cubeSize - 1);
    const g1 = Math.min(g0 + 1, cubeSize - 1);
    const b1 = Math.min(b0 + 1, cubeSize - 1);

    // Fractional parts
    const rFrac = rScaled - r0;
    const gFrac = gScaled - g0;
    const bFrac = bScaled - b0;

    // Sample 8 corners of the interpolation cube
    const c000 = sampleClut(clutData, clut.size, r0, g0, b0, cubeSize);
    const c100 = sampleClut(clutData, clut.size, r1, g0, b0, cubeSize);
    const c010 = sampleClut(clutData, clut.size, r0, g1, b0, cubeSize);
    const c110 = sampleClut(clutData, clut.size, r1, g1, b0, cubeSize);
    const c001 = sampleClut(clutData, clut.size, r0, g0, b1, cubeSize);
    const c101 = sampleClut(clutData, clut.size, r1, g0, b1, cubeSize);
    const c011 = sampleClut(clutData, clut.size, r0, g1, b1, cubeSize);
    const c111 = sampleClut(clutData, clut.size, r1, g1, b1, cubeSize);

    // Trilinear interpolation
    for (let ch = 0; ch < 3; ch++) {
      const c00 = c000[ch] * (1 - rFrac) + c100[ch] * rFrac;
      const c01 = c001[ch] * (1 - rFrac) + c101[ch] * rFrac;
      const c10 = c010[ch] * (1 - rFrac) + c110[ch] * rFrac;
      const c11 = c011[ch] * (1 - rFrac) + c111[ch] * rFrac;

      const c0 = c00 * (1 - gFrac) + c10 * gFrac;
      const c1 = c01 * (1 - gFrac) + c11 * gFrac;

      let mapped = c0 * (1 - bFrac) + c1 * bFrac;

      // CLUT sample is in sRGB gamma. If operating in linear space,
      // convert mapped result from gamma to linear for blending, then
      // convert back to gamma for storage.
      if (linearSpace) {
        mapped = srgbToLinear(mapped);
      }

      // Blend with original (both in same space: gamma if !linearSpace, linear if linearSpace)
      const original = linearSpace
        ? srgbToLinear(data[i + ch] / 255)
        : data[i + ch] / 255;
      const blended = original * (1 - s) + mapped * s;

      // Store back as gamma-encoded sRGB
      const finalValue = linearSpace ? linearToSrgb(blended) : blended;
      data[i + ch] = Math.round(Math.max(0, Math.min(255, finalValue * 255)));
    }
    // Alpha unchanged
  }
}

/**
 * Sample a single color from the Hald CLUT at the given 3D coordinates.
 */
function sampleClut(
  clutData: Uint8ClampedArray,
  imageSize: number,
  rIdx: number,
  gIdx: number,
  bIdx: number,
  cubeSize: number
): [number, number, number] {
  const pixelIndex = bIdx * cubeSize * cubeSize + gIdx * cubeSize + rIdx;
  const y = Math.floor(pixelIndex / imageSize);
  const x = pixelIndex % imageSize;
  const dataIdx = (y * imageSize + x) * 4;

  return [
    clutData[dataIdx] / 255,
    clutData[dataIdx + 1] / 255,
    clutData[dataIdx + 2] / 255,
  ];
}

// ---------------------------------------------------------------------------
// .cube LUT parser (industry standard format)
// ---------------------------------------------------------------------------

export interface CubeLut {
  title: string;
  size: number;
  domainMin: [number, number, number];
  domainMax: [number, number, number];
  data: Float32Array; // RGB triplets, size³ × 3
}

/**
 * Parse a .cube LUT file (Adobe/Resolve/ACES format).
 * Supports both 1D and 3D LUTs.
 */
export function parseCubeLut(content: string): CubeLut {
  const lines = content.split('\n');
  let title = 'Untitled';
  let size = 0;
  const domainMin: [number, number, number] = [0, 0, 0];
  const domainMax: [number, number, number] = [1, 1, 1];
  const dataLines: number[][] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;

    if (line.startsWith('TITLE')) {
      title = line.replace(/^TITLE\s+"?/, '').replace(/"?\s*$/, '');
    } else if (line.startsWith('LUT_3D_SIZE') || line.startsWith('LUT_1D_SIZE')) {
      size = parseInt(line.split(/\s+/)[1], 10);
    } else if (line.startsWith('DOMAIN_MIN')) {
      const parts = line.split(/\s+/).slice(1).map(Number);
      domainMin[0] = parts[0]; domainMin[1] = parts[1]; domainMin[2] = parts[2];
    } else if (line.startsWith('DOMAIN_MAX')) {
      const parts = line.split(/\s+/).slice(1).map(Number);
      domainMax[0] = parts[0]; domainMax[1] = parts[1]; domainMax[2] = parts[2];
    } else {
      const vals = line.split(/\s+/).map(Number);
      if (vals.length >= 3 && !isNaN(vals[0])) {
        dataLines.push(vals);
      }
    }
  }

  if (size === 0) {
    size = Math.round(Math.cbrt(dataLines.length));
  }

  const data = new Float32Array(dataLines.length * 3);
  for (let i = 0; i < dataLines.length; i++) {
    data[i * 3] = dataLines[i][0];
    data[i * 3 + 1] = dataLines[i][1];
    data[i * 3 + 2] = dataLines[i][2];
  }

  return { title, size, domainMin, domainMax, data };
}

/**
 * Apply a .cube 3D LUT to ImageData.
 *
 * @param imageData — source ImageData (modified in-place)
 * @param lut — parsed .cube LUT
 * @param strength — 0–1 blend factor
 */
export function applyCubeLut(
  imageData: ImageData,
  lut: CubeLut,
  strength: number = 1.0
): void {
  const pixels = imageData.data;
  const s = Math.max(0, Math.min(1, strength));
  if (s === 0) return;

  const { size, domainMin, domainMax, data: lutData } = lut;
  const rangeR = domainMax[0] - domainMin[0];
  const rangeG = domainMax[1] - domainMin[1];
  const rangeB = domainMax[2] - domainMin[2];

  for (let i = 0; i < pixels.length; i += 4) {
    const r = (pixels[i] / 255 - domainMin[0]) / rangeR * (size - 1);
    const g = (pixels[i + 1] / 255 - domainMin[1]) / rangeG * (size - 1);
    const b = (pixels[i + 2] / 255 - domainMin[2]) / rangeB * (size - 1);

    const r0 = Math.max(0, Math.min(size - 2, Math.floor(r)));
    const g0 = Math.max(0, Math.min(size - 2, Math.floor(g)));
    const b0 = Math.max(0, Math.min(size - 2, Math.floor(b)));

    const rFrac = r - r0;
    const gFrac = g - g0;
    const bFrac = b - b0;

    // Trilinear interpolation
    for (let ch = 0; ch < 3; ch++) {
      const c000 = cubeLutSample(lutData, size, r0, g0, b0, ch);
      const c100 = cubeLutSample(lutData, size, r0 + 1, g0, b0, ch);
      const c010 = cubeLutSample(lutData, size, r0, g0 + 1, b0, ch);
      const c110 = cubeLutSample(lutData, size, r0 + 1, g0 + 1, b0, ch);
      const c001 = cubeLutSample(lutData, size, r0, g0, b0 + 1, ch);
      const c101 = cubeLutSample(lutData, size, r0 + 1, g0, b0 + 1, ch);
      const c011 = cubeLutSample(lutData, size, r0, g0 + 1, b0 + 1, ch);
      const c111 = cubeLutSample(lutData, size, r0 + 1, g0 + 1, b0 + 1, ch);

      const c00 = c000 * (1 - rFrac) + c100 * rFrac;
      const c01 = c001 * (1 - rFrac) + c101 * rFrac;
      const c10 = c010 * (1 - rFrac) + c110 * rFrac;
      const c11 = c011 * (1 - rFrac) + c111 * rFrac;

      const c0 = c00 * (1 - gFrac) + c10 * gFrac;
      const c1 = c01 * (1 - gFrac) + c11 * gFrac;

      const mapped = c0 * (1 - bFrac) + c1 * bFrac;
      const original = pixels[i + ch] / 255;

      pixels[i + ch] = Math.round(Math.max(0, Math.min(255,
        (original * (1 - s) + mapped * s) * 255
      )));
    }
  }
}

function cubeLutSample(
  data: Float32Array,
  size: number,
  r: number,
  g: number,
  b: number,
  channel: number
): number {
  const idx = ((b * size * size) + (g * size) + r) * 3 + channel;
  return data[idx] ?? 0;
}

// ---------------------------------------------------------------------------
// LUT catalog (built-in presets)
// ---------------------------------------------------------------------------

/**
 * Built-in LUT presets generated procedurally.
 * These simulate common film looks without needing external files.
 */
export const BUILTIN_LUTS: LutMetadata[] = [
  { name: 'Kodak Portra 400', category: 'analog', description: 'Warm, lifted shadows, gentle highlight rolloff' },
  { name: 'Fuji Pro 400H', category: 'analog', description: 'Clean, natural tones with slight green shift' },
  { name: 'Kodak Ektar 100', category: 'analog', description: 'Vivid, saturated, high contrast' },
  { name: 'Teal & Orange', category: 'cinematic', description: 'Classic Hollywood split-tone' },
  { name: 'Bleach Bypass', category: 'cinematic', description: 'Desaturated, high contrast, metallic feel' },
  { name: 'Cross Process', category: 'creative', description: 'Shifted color channels, experimental' },
  { name: 'Silver Gelatin', category: 'bw', description: 'Classic black and white with full tonal range' },
  { name: 'High Key BW', category: 'bw', description: 'Bright, airy black and white' },
  { name: 'Daylight Correct', category: 'correction', description: 'Balanced daylight white balance' },
  { name: 'Tungsten Correct', category: 'correction', description: 'Compensate warm tungsten lighting' },
];
