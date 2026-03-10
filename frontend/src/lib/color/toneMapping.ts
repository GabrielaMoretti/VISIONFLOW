/**
 * Filmic Tonemapping Module
 *
 * Implements Blender's filmic tonemapping approach for cinematographic results.
 * The key insight: linear color grading + filmic S-curve = professional look.
 *
 * What this solves:
 *   - Highlight rolloff: bright areas compress gracefully instead of clipping to white
 *   - Shadow lift: dark areas retain detail instead of crushing to black
 *   - Mid-tone contrast: the S-curve adds perceived contrast without destroying dynamic range
 *
 * The filmic curve is what gives Hollywood color grading that "cinematic softness"
 * that linear adjustments can never achieve.
 *
 * Reference: Blender's filmic-blender (Troy Sobotka)
 * @module toneMapping
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FilmicCurveParams {
  /** Shoulder compression — how smoothly highlights roll off (0.8–1.0) */
  shoulderStrength: number;
  /** Linear section strength — contrast in midtones (0.1–0.5) */
  linearStrength: number;
  /** Linear section angle — slope of the linear portion (0.05–0.3) */
  linearAngle: number;
  /** Toe strength — how much shadow detail is preserved (0.4–0.7) */
  toeStrength: number;
  /** Toe numerator — shadow lift amount (0.01–0.1) */
  toeNumerator: number;
  /** Toe denominator — shadow curve shape (0.2–0.5) */
  toeDenominator: number;
  /** White point — maximum scene brightness that maps to display white */
  whitePoint: number;
}

export interface SplitToneCurveParams {
  /** Shadow lift — raises the black point (0–0.15) */
  shadowLift: number;
  /** Shadow gamma — shadow curve shape (0.7–1.3, <1 = darker shadows) */
  shadowGamma: number;
  /** Highlight compression — lowers the white point (0.85–1.0) */
  highlightCompress: number;
  /** Highlight gamma — highlight curve shape (0.7–1.3, >1 = softer highlights) */
  highlightGamma: number;
  /** Midtone pivot — where shadows meet highlights (0.1–0.6) */
  midtonePivot: number;
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

/** Default filmic curve — balanced, natural look */
export const FILMIC_DEFAULT: FilmicCurveParams = {
  shoulderStrength: 0.22,
  linearStrength: 0.30,
  linearAngle: 0.10,
  toeStrength: 0.20,
  toeNumerator: 0.01,
  toeDenominator: 0.30,
  whitePoint: 11.2,
};

/** High contrast filmic — punchy, commercial look */
export const FILMIC_HIGH_CONTRAST: FilmicCurveParams = {
  shoulderStrength: 0.15,
  linearStrength: 0.50,
  linearAngle: 0.10,
  toeStrength: 0.20,
  toeNumerator: 0.02,
  toeDenominator: 0.30,
  whitePoint: 11.2,
};

/** Very high contrast — drama, noir */
export const FILMIC_VERY_HIGH_CONTRAST: FilmicCurveParams = {
  shoulderStrength: 0.10,
  linearStrength: 0.60,
  linearAngle: 0.15,
  toeStrength: 0.30,
  toeNumerator: 0.02,
  toeDenominator: 0.35,
  whitePoint: 11.2,
};

/** Low contrast — soft, editorial */
export const FILMIC_LOW_CONTRAST: FilmicCurveParams = {
  shoulderStrength: 0.30,
  linearStrength: 0.18,
  linearAngle: 0.08,
  toeStrength: 0.15,
  toeNumerator: 0.005,
  toeDenominator: 0.25,
  whitePoint: 11.2,
};

/** Classic film stock emulation */
export const FILMIC_CLASSIC: FilmicCurveParams = {
  shoulderStrength: 0.25,
  linearStrength: 0.25,
  linearAngle: 0.12,
  toeStrength: 0.25,
  toeNumerator: 0.015,
  toeDenominator: 0.32,
  whitePoint: 11.2,
};

/** Default split-tone curve — cinematic shadows/highlights */
export const SPLIT_TONE_DEFAULT: SplitToneCurveParams = {
  shadowLift: 0.02,
  shadowGamma: 0.9,
  highlightCompress: 0.95,
  highlightGamma: 1.1,
  midtonePivot: 0.35,
};

// ---------------------------------------------------------------------------
// Core tonemapping functions
// ---------------------------------------------------------------------------

/**
 * Uchimura / Filmic tonemap operator.
 * Based on the formulation used in Blender's filmic and John Hable's
 * Uncharted 2 operator, adapted for per-channel application.
 *
 * This S-curve compresses highlights while lifting shadows,
 * producing the characteristic filmic look.
 *
 * @param x — linear scene value (0–∞, typically 0–1 for normalized input)
 * @param params — curve parameters
 * @returns display value (0–1)
 */
export function filmicTonemap(
  x: number,
  params: FilmicCurveParams = FILMIC_DEFAULT
): number {
  const {
    shoulderStrength: A,
    linearStrength: B,
    linearAngle: C,
    toeStrength: D,
    toeNumerator: E,
    toeDenominator: F,
    whitePoint: W,
  } = params;

  // Hable's formula: ((x*(A*x+C*B)+D*E) / (x*(A*x+B)+D*F)) - E/F
  const numerator = (x * (A * x + C * B) + D * E);
  const denominator = (x * (A * x + B) + D * F);
  const result = numerator / denominator - E / F;

  // Apply same formula to white point for normalization
  const whiteNumerator = (W * (A * W + C * B) + D * E);
  const whiteDenominator = (W * (A * W + B) + D * F);
  const whiteResult = whiteNumerator / whiteDenominator - E / F;

  return Math.max(0, Math.min(1, result / whiteResult));
}

/**
 * Apply split-tone luminance curve.
 * This is how professional colorists control shadows and highlights independently.
 *
 * Inspired by Darktable's colorbalancergb module:
 *   - Shadow zone uses power curve below the pivot
 *   - Highlight zone uses power curve above the pivot
 *   - Both zones blend smoothly at the pivot point
 *
 * @param luminance — input luminance (0–1)
 * @param params — curve parameters
 * @returns adjusted luminance (0–1)
 */
export function splitToneCurve(
  luminance: number,
  params: SplitToneCurveParams = SPLIT_TONE_DEFAULT
): number {
  const { shadowLift, shadowGamma, highlightCompress, highlightGamma, midtonePivot } = params;

  let result: number;

  if (luminance <= midtonePivot) {
    // Shadow zone: remap 0–pivot to 0–1, apply gamma, remap back
    const normalized = luminance / midtonePivot;
    const curved = Math.pow(normalized, shadowGamma);
    // Apply shadow lift: black point goes from 0 to shadowLift
    result = shadowLift + curved * (midtonePivot - shadowLift);
  } else {
    // Highlight zone: remap pivot–1 to 0–1, apply gamma, remap back
    const normalized = (luminance - midtonePivot) / (1 - midtonePivot);
    const curved = Math.pow(normalized, highlightGamma);
    // Apply highlight compression: white point goes from 1 to highlightCompress
    result = midtonePivot + curved * (highlightCompress - midtonePivot);
  }

  return Math.max(0, Math.min(1, result));
}

// ---------------------------------------------------------------------------
// sRGB linearization (critical for correct color grading)
// ---------------------------------------------------------------------------

/**
 * Convert sRGB gamma-encoded value to linear light.
 * ALL color math should happen in linear space — gamma-encoded math
 * is the primary cause of results looking "heavy" and "filtered".
 */
export function srgbToLinear(v: number): number {
  if (v <= 0.04045) {
    return v / 12.92;
  }
  return Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Convert linear light value back to sRGB gamma-encoded.
 */
export function linearToSrgb(v: number): number {
  if (v <= 0.0031308) {
    return v * 12.92;
  }
  return 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

/**
 * Convert RGB pixel [0–255] to linear [0–1].
 */
export function pixelToLinear(r: number, g: number, b: number): [number, number, number] {
  return [
    srgbToLinear(r / 255),
    srgbToLinear(g / 255),
    srgbToLinear(b / 255),
  ];
}

/**
 * Convert linear [0–1] back to RGB pixel [0–255].
 */
export function linearToPixel(r: number, g: number, b: number): [number, number, number] {
  return [
    Math.round(Math.max(0, Math.min(255, linearToSrgb(r) * 255))),
    Math.round(Math.max(0, Math.min(255, linearToSrgb(g) * 255))),
    Math.round(Math.max(0, Math.min(255, linearToSrgb(b) * 255))),
  ];
}

// ---------------------------------------------------------------------------
// Integrated filmic pipeline (for Canvas-based processing)
// ---------------------------------------------------------------------------

/**
 * Apply the full filmic pipeline to an ImageData buffer:
 *   1. Linearize (remove gamma)
 *   2. Apply split-tone curve for shadow/highlight control
 *   3. Apply filmic tonemap for natural highlight rolloff
 *   4. Re-encode to sRGB gamma
 *
 * This is the CPU fallback; the GPU version is in the GLSL shader.
 *
 * @param imageData — Canvas ImageData to process (modified in-place)
 * @param filmicParams — filmic curve settings
 * @param splitParams — split-tone curve settings
 * @param strength — blend factor 0–1 (0 = bypass, 1 = full effect)
 */
export function applyFilmicPipeline(
  imageData: ImageData,
  filmicParams: FilmicCurveParams = FILMIC_DEFAULT,
  splitParams: SplitToneCurveParams = SPLIT_TONE_DEFAULT,
  strength: number = 1.0
): void {
  const data = imageData.data;
  const s = Math.max(0, Math.min(1, strength));

  for (let i = 0; i < data.length; i += 4) {
    // 1. Linearize
    let r = srgbToLinear(data[i] / 255);
    let g = srgbToLinear(data[i + 1] / 255);
    let b = srgbToLinear(data[i + 2] / 255);

    // 2. Compute luminance (Rec. 709 coefficients)
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // 3. Apply split-tone curve to luminance
    const adjustedLum = splitToneCurve(lum, splitParams);
    const lumRatio = lum > 0.001 ? adjustedLum / lum : 1;

    r *= lumRatio;
    g *= lumRatio;
    b *= lumRatio;

    // 4. Apply filmic tonemap per channel
    r = filmicTonemap(r, filmicParams);
    g = filmicTonemap(g, filmicParams);
    b = filmicTonemap(b, filmicParams);

    // 5. Back to sRGB + blend with original
    const [outR, outG, outB] = linearToPixel(r, g, b);

    data[i] = Math.round(data[i] * (1 - s) + outR * s);
    data[i + 1] = Math.round(data[i + 1] * (1 - s) + outG * s);
    data[i + 2] = Math.round(data[i + 2] * (1 - s) + outB * s);
    // Alpha stays unchanged
  }
}

// ---------------------------------------------------------------------------
// Preset map for easy access
// ---------------------------------------------------------------------------

export const FILMIC_PRESETS = {
  default: FILMIC_DEFAULT,
  highContrast: FILMIC_HIGH_CONTRAST,
  veryHighContrast: FILMIC_VERY_HIGH_CONTRAST,
  lowContrast: FILMIC_LOW_CONTRAST,
  classic: FILMIC_CLASSIC,
} as const;

export type FilmicPresetName = keyof typeof FILMIC_PRESETS;
