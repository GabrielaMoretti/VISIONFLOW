/**
 * Color Flow Engine — Main barrel export
 *
 * This is the unified entry point for all color science functionality.
 *
 * Quick start:
 *   import { rgbToOklch, filmicTonemap, loadClutFromUrl } from '@/lib/color';
 */

// Color space conversions (Culori-based)
export {
  rgbToOklch,
  oklchToRgb,
  hslToOklch,
  oklchToHsl,
  hexToOklch,
  oklchToHex,
  rotateHue,
  adjustChroma,
  adjustLightness,
  colorDistance,
  isInSrgbGamut,
  gamutMapToSrgb,
  toDisplayP3,
  estimateTemperatureOklch,
  splitToneColor,
  pixelsToOklch,
  hslDeltaToOklchDelta,
  type OklchColor,
  type RgbColor,
  type HslColor,
  type ColorAnalysis,
} from './colorSpaces';

// Filmic tonemapping
export {
  filmicTonemap,
  splitToneCurve,
  srgbToLinear,
  linearToSrgb,
  pixelToLinear,
  linearToPixel,
  applyFilmicPipeline,
  FILMIC_DEFAULT,
  FILMIC_HIGH_CONTRAST,
  FILMIC_VERY_HIGH_CONTRAST,
  FILMIC_LOW_CONTRAST,
  FILMIC_CLASSIC,
  FILMIC_PRESETS,
  SPLIT_TONE_DEFAULT,
  type FilmicCurveParams,
  type SplitToneCurveParams,
  type FilmicPresetName,
} from './toneMapping';

// LUT system (Hald CLUT + .cube)
export {
  generateIdentityClut,
  loadClutFromImage,
  loadClutFromUrl,
  applyHaldClut,
  parseCubeLut,
  applyCubeLut,
  BUILTIN_LUTS,
  type HaldClut,
  type CubeLut,
  type LutMetadata,
} from './lut';
