/**
 * Color Spaces Module — Culori + Color.js integration
 *
 * Central hub for all color space operations in VisionFlow.
 * Replaces hand-rolled HSL math with perceptually uniform OKLCH.
 *
 * Why OKLCH?
 *   - Perceptually uniform: ΔC of 0.01 looks the same across the entire hue wheel
 *   - Lightness channel is independent of chroma/hue
 *   - Hue rotations are linear and predictable (unlike HSL where +10° at red ≠ +10° at green)
 *   - Native CSS Color Level 4 support (future-proof)
 *
 * @module colorSpaces
 */

import * as culori from 'culori';

const culoriApi = (culori as any).default ?? (culori as any);
const converter = culoriApi.converter as ((mode: string) => (value: any) => any) | undefined;
const formatHex = culoriApi.formatHex as (value: any) => string | undefined;
const formatCss = culoriApi.formatCss as (value: any) => string | undefined;
const differenceCiede2000 = culoriApi.differenceCiede2000 as () => (a: any, b: any) => number;
const clampChroma = culoriApi.clampChroma as (value: any, mode: string) => any;
const displayable = culoriApi.displayable as (value: any) => boolean;
const parse = culoriApi.parse as (value: string) => any;
const modeOklch = culoriApi.oklch as ((value: any) => any) | undefined;
const modeOklab = culoriApi.oklab as ((value: any) => any) | undefined;
const modeRgb = culoriApi.rgb as ((value: any) => any) | undefined;
const modeHsl = culoriApi.hsl as ((value: any) => any) | undefined;
const modeP3 = culoriApi.p3 as ((value: any) => any) | undefined;

// ---------------------------------------------------------------------------
// Converters (cached for performance)
// ---------------------------------------------------------------------------

const toOklch = converter ? converter('oklch') : modeOklch ?? ((v: any) => v);
const toOklab = converter ? converter('oklab') : modeOklab ?? ((v: any) => v);
const toRgb = converter ? converter('rgb') : modeRgb ?? ((v: any) => v);
const toHsl = converter ? converter('hsl') : modeHsl ?? ((v: any) => v);
const toP3 = converter ? converter('p3') : modeP3 ?? ((v: any) => v);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OklchColor {
  l: number;  // lightness 0–1
  c: number;  // chroma 0–0.4 (practical max ~0.37)
  h: number;  // hue 0–360
  alpha?: number;
}

export interface RgbColor {
  r: number;  // 0–255
  g: number;
  b: number;
  a?: number; // 0–255
}

export interface HslColor {
  h: number;  // 0–360
  s: number;  // 0–100
  l: number;  // 0–100
}

export interface ColorAnalysis {
  oklch: OklchColor;
  hex: string;
  isDisplayable: boolean;   // within sRGB gamut?
  isP3: boolean;            // within Display-P3 gamut?
  perceptualLightness: number; // 0–100 scale
}

// ---------------------------------------------------------------------------
// Core conversions
// ---------------------------------------------------------------------------

/**
 * Convert RGB (0–255 scale) to OKLCH.
 * This is the replacement for rgbToHsl — use this for all mood/grading math.
 */
export function rgbToOklch(r: number, g: number, b: number): OklchColor {
  const color = toOklch({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 });
  return {
    l: color?.l ?? 0,
    c: color?.c ?? 0,
    h: color?.h ?? 0,
  };
}

/**
 * Convert OKLCH back to RGB (0–255 scale), clamping to sRGB gamut.
 */
export function oklchToRgb(l: number, c: number, h: number): RgbColor {
  // Clamp chroma to keep within sRGB gamut
  const clamped = clampChroma({ mode: 'oklch', l, c, h }, 'oklch');
  const color = toRgb(clamped);
  return {
    r: Math.round(Math.max(0, Math.min(255, (color?.r ?? 0) * 255))),
    g: Math.round(Math.max(0, Math.min(255, (color?.g ?? 0) * 255))),
    b: Math.round(Math.max(0, Math.min(255, (color?.b ?? 0) * 255))),
  };
}

/**
 * Convert HSL (legacy scale: h 0–360, s 0–100, l 0–100) to OKLCH.
 */
export function hslToOklch(h: number, s: number, l: number): OklchColor {
  const color = toOklch({ mode: 'hsl', h, s: s / 100, l: l / 100 });
  return {
    l: color?.l ?? 0,
    c: color?.c ?? 0,
    h: color?.h ?? 0,
  };
}

/**
 * Convert OKLCH to HSL (legacy scale for backward compatibility).
 */
export function oklchToHsl(l: number, c: number, h: number): HslColor {
  const clamped = clampChroma({ mode: 'oklch', l, c, h }, 'oklch');
  const color = toHsl(clamped);
  return {
    h: color?.h ?? 0,
    s: (color?.s ?? 0) * 100,
    l: (color?.l ?? 0) * 100,
  };
}

/**
 * Convert hex string to OKLCH.
 */
export function hexToOklch(hex: string): OklchColor {
  const color = toOklch(hex);
  return {
    l: color?.l ?? 0,
    c: color?.c ?? 0,
    h: color?.h ?? 0,
  };
}

/**
 * Convert OKLCH to hex string (gamut-clamped to sRGB).
 */
export function oklchToHex(l: number, c: number, h: number): string {
  const clamped = clampChroma({ mode: 'oklch', l, c, h }, 'oklch');
  return formatHex(clamped) ?? '#000000';
}

// ---------------------------------------------------------------------------
// Perceptual adjustments (the core improvement over HSL)
// ---------------------------------------------------------------------------

/**
 * Apply a perceptually uniform hue rotation.
 * Unlike HSL where +10° at red is visually different from +10° at green,
 * OKLCH hue rotation is perceptually consistent.
 */
export function rotateHue(color: OklchColor, deltaDegrees: number): OklchColor {
  return {
    ...color,
    h: ((color.h + deltaDegrees) % 360 + 360) % 360,
  };
}

/**
 * Adjust chroma (perceptual saturation) by a delta.
 * OKLCH chroma is perceptually uniform — the same delta looks the same everywhere.
 *
 * @param deltaChroma — absolute delta in OKLCH chroma units.
 *   Typical range: -0.05 to +0.05 for subtle edits.
 *   To convert from the old -25 to +25 HSL saturation scale:
 *     deltaChroma ≈ hslSatDelta * 0.002
 */
export function adjustChroma(color: OklchColor, deltaChroma: number): OklchColor {
  return {
    ...color,
    c: Math.max(0, color.c + deltaChroma),
  };
}

/**
 * Adjust lightness by a delta.
 * OKLCH lightness is perceptually linear (unlike HSL's non-uniform L).
 *
 * @param deltaLightness — absolute delta in OKLCH lightness units (0–1 scale).
 *   To convert from the old -15 to +15 HSL lightness scale:
 *     deltaLightness ≈ hslLightDelta * 0.007
 */
export function adjustLightness(color: OklchColor, deltaLightness: number): OklchColor {
  return {
    ...color,
    l: Math.max(0, Math.min(1, color.l + deltaLightness)),
  };
}

// ---------------------------------------------------------------------------
// Color difference (ΔE2000)
// ---------------------------------------------------------------------------

/**
 * Compute CIEDE2000 color difference between two colors.
 * ΔE < 1.0 is imperceptible, ΔE < 3.0 is barely noticeable,
 * ΔE > 5.0 is clearly different.
 */
export function colorDistance(
  a: OklchColor | string,
  b: OklchColor | string
): number {
  const colorA = typeof a === 'string' ? a : { mode: 'oklch' as const, ...a };
  const colorB = typeof b === 'string' ? b : { mode: 'oklch' as const, ...b };
  return differenceCiede2000()(colorA, colorB);
}

// ---------------------------------------------------------------------------
// Gamut handling
// ---------------------------------------------------------------------------

/**
 * Check if an OKLCH color is displayable in sRGB.
 */
export function isInSrgbGamut(color: OklchColor): boolean {
  return displayable({ mode: 'oklch', ...color });
}

/**
 * Gamut-map an OKLCH color to sRGB by reducing chroma (preserving hue/lightness).
 * This is the correct way to handle out-of-gamut colors — never clip RGB channels.
 */
export function gamutMapToSrgb(color: OklchColor): OklchColor {
  const clamped = clampChroma({ mode: 'oklch', ...color }, 'oklch');
  return {
    l: clamped.l,
    c: clamped.c,
    h: clamped.h ?? color.h,
  };
}

/**
 * Convert to Display-P3 CSS string (for wide-gamut displays).
 */
export function toDisplayP3(color: OklchColor): string {
  const p3Color = toP3({ mode: 'oklch', ...color });
  return formatCss(p3Color!) ?? 'color(display-p3 0 0 0)';
}

// ---------------------------------------------------------------------------
// Temperature estimation (perceptual, OKLCH-based)
// ---------------------------------------------------------------------------

/**
 * Estimate perceptual color temperature from OKLCH hue.
 * More accurate than HSL-based estimation because OKLCH hue is perceptually uniform.
 *
 * Returns a value from -50 (cold/blue) to +50 (warm/amber).
 */
export function estimateTemperatureOklch(color: OklchColor): number {
  const h = ((color.h % 360) + 360) % 360;
  const chromaWeight = Math.min(1, color.c / 0.1); // low chroma → neutral temp

  let raw: number;

  // OKLCH hue wheel:
  //   ~30-70°   → warm (orange/yellow)
  //   ~80-150°  → neutral-warm to neutral (green/yellow-green)
  //   ~150-200° → neutral to cold (green/cyan)
  //   ~200-280° → cold (blue/indigo)
  //   ~280-340° → neutral (violet/magenta)
  //   ~340-30°  → warm (red/orange)
  if (h <= 30 || h > 340) {
    // Red–orange zone: warm
    const normalizedH = h <= 30 ? h : h - 360;
    raw = 40 - Math.abs(normalizedH - 15) * 0.8;
  } else if (h <= 70) {
    // Orange–yellow: warmest
    raw = 50 * Math.cos(((h - 50) / 40) * (Math.PI / 2));
  } else if (h <= 150) {
    // Yellow-green–green: neutral
    raw = 10 * (1 - (h - 70) / 80);
  } else if (h <= 200) {
    // Cyan: transition to cold
    raw = -15 * ((h - 150) / 50);
  } else if (h <= 280) {
    // Blue: coldest at ~240°
    raw = -50 * Math.cos(((h - 240) / 80) * (Math.PI / 2));
  } else {
    // Violet–magenta: back toward neutral
    raw = -15 * (1 - (h - 280) / 60);
  }

  return Math.round(raw * chromaWeight);
}

// ---------------------------------------------------------------------------
// Split-tone color generation in OKLCH
// ---------------------------------------------------------------------------

/**
 * Generate a split-tone color for shadows or highlights.
 * Works in OKLCH so the color cast is perceptually uniform regardless of hue.
 *
 * @param hue — absolute hue in degrees (0–360)
 * @param saturation — intensity (0–35 scale from MoodAdjustment)
 * @param zone — 'shadow' uses lower lightness, 'highlight' uses higher
 */
export function splitToneColor(
  hue: number,
  saturation: number,
  zone: 'shadow' | 'highlight'
): OklchColor {
  const baseL = zone === 'shadow' ? 0.25 : 0.85;
  // Convert saturation (0–35 scale) to OKLCH chroma
  const chroma = (saturation / 35) * 0.15; // max chroma ~0.15 for split toning

  return gamutMapToSrgb({
    l: baseL,
    c: chroma,
    h: hue,
  });
}

// ---------------------------------------------------------------------------
// Batch pixel processing (for image analysis pipelines)
// ---------------------------------------------------------------------------

/**
 * Convert a pixel buffer (RGBA Uint8ClampedArray) to OKLCH values.
 * Uses strided sampling for performance.
 *
 * @param data — RGBA pixel data
 * @param step — sample every Nth pixel (1 = all, 4 = every 4th)
 * @returns Array of [l, c, h] tuples
 */
export function pixelsToOklch(
  data: Uint8ClampedArray,
  step: number = 1
): [number, number, number][] {
  const results: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += step * 4) {
    const a = data[i + 3];
    if (a <= 128) continue; // skip transparent pixels

    const color = toOklch({
      mode: 'rgb',
      r: data[i] / 255,
      g: data[i + 1] / 255,
      b: data[i + 2] / 255,
    });

    if (color) {
      results.push([color.l, color.c ?? 0, color.h ?? 0]);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Legacy compatibility bridge
// ---------------------------------------------------------------------------

/**
 * Bridge: convert old-style HSL-based MoodAdjustment deltas to OKLCH deltas.
 * Use this during the transition period.
 */
export function hslDeltaToOklchDelta(hslDelta: {
  hslHueDelta?: number;
  hslSaturation?: number;
  hslLightness?: number;
}): {
  hueDelta: number;
  chromaDelta: number;
  lightnessDelta: number;
} {
  return {
    // Hue rotation maps roughly 1:1 (OKLCH hue is similar scale)
    hueDelta: hslDelta.hslHueDelta ?? 0,
    // HSL saturation -25 to +25 → OKLCH chroma -0.05 to +0.05
    chromaDelta: (hslDelta.hslSaturation ?? 0) * 0.002,
    // HSL lightness -15 to +15 → OKLCH lightness -0.105 to +0.105
    lightnessDelta: (hslDelta.hslLightness ?? 0) * 0.007,
  };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  toOklch,
  toOklab,
  toRgb,
  toHsl,
  toP3,
  formatHex,
  formatCss,
  clampChroma,
  parse as parseColor,
};
