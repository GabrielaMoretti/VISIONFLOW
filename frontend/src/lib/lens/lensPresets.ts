/**
 * Lens Presets — one-click cinematic setups.
 */

import type { MoodAdjustment } from '../../utils/moodMapping';

export interface LensPreset {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  lensProfileId: string;
  aperture: number;
  toggles: {
    distortion: boolean;
    chromaticAberration: boolean;
    vignette: boolean;
    bokeh: boolean;
  };
  suggestedColorGrading?: MoodAdjustment;
  tags: string[];
}

export const LENS_PRESETS: LensPreset[] = [
  {
    id: 'preset-wide',
    name: 'Wide Angle',
    emoji: '🌍',
    tagline: 'Ambiente e arquitetura com distorcao dramatica.',
    lensProfileId: 'sigma-14-18',
    aperture: 5.6,
    toggles: { distortion: true, chromaticAberration: true, vignette: true, bokeh: false },
    suggestedColorGrading: {
      temperatureDelta: -4,
      hslSaturation: -5,
      contrastDelta: 12,
      vignetteAmount: 30,
      splitShadowHue: 210,
      splitShadowSat: 15,
    },
    tags: ['wide', 'landscape', 'architecture', 'urban', 'editorial'],
  },
  {
    id: 'preset-portrait',
    name: 'Portrait',
    emoji: '🎭',
    tagline: 'Retrato com look cremoso e pele suave.',
    lensProfileId: 'canon-50-14',
    aperture: 1.8,
    toggles: { distortion: false, chromaticAberration: false, vignette: true, bokeh: true },
    suggestedColorGrading: {
      temperatureDelta: 6,
      hslSaturation: -3,
      hslLightness: 2,
      contrastDelta: 4,
      vignetteAmount: 18,
      splitHighlightHue: 35,
      splitHighlightSat: 8,
    },
    tags: ['portrait', 'people', 'skin', 'bokeh', 'fashion'],
  },
  {
    id: 'preset-cinema-clean',
    name: 'Cinema Clean',
    emoji: '🎬',
    tagline: 'Cooke look limpo e profissional.',
    lensProfileId: 'cooke-s4-32',
    aperture: 2.8,
    toggles: { distortion: false, chromaticAberration: false, vignette: true, bokeh: true },
    suggestedColorGrading: {
      temperatureDelta: -5,
      hslSaturation: -8,
      contrastDelta: 8,
      vignetteAmount: 20,
      splitShadowHue: 210,
      splitShadowSat: 18,
      splitHighlightHue: 38,
      splitHighlightSat: 10,
    },
    tags: ['cinema', 'film', 'cooke', 'professional', 'narrative'],
  },
  {
    id: 'preset-anamorphic',
    name: 'Anamorphic',
    emoji: '📽️',
    tagline: 'Look blockbuster com assinatura anamorfica.',
    lensProfileId: 'anamorphic-40',
    aperture: 2.0,
    toggles: { distortion: true, chromaticAberration: true, vignette: true, bokeh: true },
    suggestedColorGrading: {
      temperatureDelta: -6,
      hslSaturation: -6,
      contrastDelta: 12,
      vignetteAmount: 28,
      splitShadowHue: 200,
      splitShadowSat: 22,
      splitHighlightHue: 35,
      splitHighlightSat: 14,
    },
    tags: ['anamorphic', 'cinema', 'widescreen', 'blockbuster', 'epic'],
  },
  {
    id: 'preset-vintage',
    name: 'Vintage',
    emoji: '📷',
    tagline: 'Visual retro com Helios e personalidade.',
    lensProfileId: 'helios-44',
    aperture: 2.0,
    toggles: { distortion: true, chromaticAberration: true, vignette: true, bokeh: true },
    suggestedColorGrading: {
      temperatureDelta: 12,
      hslSaturation: -12,
      hslLightness: 3,
      contrastDelta: -6,
      vignetteAmount: 38,
      splitHighlightHue: 42,
      splitHighlightSat: 16,
      splitShadowHue: 28,
      splitShadowSat: 12,
    },
    tags: ['vintage', 'analog', 'helios', 'swirl', 'retro', 'film'],
  },
  {
    id: 'preset-zeiss-editorial',
    name: 'Editorial Sharp',
    emoji: '✦',
    tagline: 'Nitidez editorial com assinatura Zeiss.',
    lensProfileId: 'zeiss-planar-50',
    aperture: 2.8,
    toggles: { distortion: false, chromaticAberration: false, vignette: true, bokeh: true },
    suggestedColorGrading: {
      temperatureDelta: -2,
      hslSaturation: -4,
      contrastDelta: 10,
      sharpenAmount: 20,
      vignetteAmount: 20,
    },
    tags: ['editorial', 'fashion', 'sharp', 'zeiss', 'commercial'],
  },
];

export function getPresetById(id: string): LensPreset | undefined {
  return LENS_PRESETS.find((p) => p.id === id);
}

export function getPresetsByTag(tag: string): LensPreset[] {
  return LENS_PRESETS.filter((p) => p.tags.includes(tag.toLowerCase()));
}
