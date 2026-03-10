import type { ChromaticAberrationType } from './chromaticAberration';

export interface LensProfile {
  id: string;
  name: string;
  manufacturer: string;
  focalLength: number;
  maxAperture: number;
  type: 'prime' | 'zoom' | 'anamorphic' | 'vintage' | 'cinema';
  character: 'sharp' | 'classic' | 'creamy' | 'swirly' | 'clinical';
  distortion: { k1: number; k2: number; k3: number };
  chromaticAberration: { intensity: number; type: ChromaticAberrationType };
  vignette: { amount: number; feather: number; opticalFeel: boolean };
  bokeh: {
    shape: 'circular' | 'hexagonal' | 'octagonal' | 'swirl' | 'oval';
    creaminess: number;
    onionRings: number;
    catEye: number;
  };
  flare: { susceptibility: number; color: string; hasAnamorphicStreak: boolean };
  description: string;
}

export const LENS_PROFILES: LensProfile[] = [
  {
    id: 'canon-50-14',
    name: 'Canon EF 50mm f/1.4 USM',
    manufacturer: 'Canon',
    focalLength: 50,
    maxAperture: 1.4,
    type: 'prime',
    character: 'classic',
    distortion: { k1: -0.01, k2: 0.002, k3: 0 },
    chromaticAberration: { intensity: 0.25, type: 'lateral' },
    vignette: { amount: 35, feather: 0.6, opticalFeel: true },
    bokeh: { shape: 'circular', creaminess: 0.75, onionRings: 0.3, catEye: 0.4 },
    flare: { susceptibility: 0.5, color: '#e8c870', hasAnamorphicStreak: false },
    description: 'Classic nifty fifty with soft bokeh and moderate CA wide open.',
  },
  {
    id: 'zeiss-planar-50',
    name: 'Zeiss Planar T* 50mm f/1.4',
    manufacturer: 'Zeiss',
    focalLength: 50,
    maxAperture: 1.4,
    type: 'prime',
    character: 'creamy',
    distortion: { k1: -0.005, k2: 0.001, k3: 0 },
    chromaticAberration: { intensity: 0.1, type: 'lateral' },
    vignette: { amount: 30, feather: 0.7, opticalFeel: true },
    bokeh: { shape: 'circular', creaminess: 0.9, onionRings: 0.1, catEye: 0.3 },
    flare: { susceptibility: 0.3, color: '#d4a853', hasAnamorphicStreak: false },
    description: 'Creamy Zeiss rendering with very low distortion and CA.',
  },
  {
    id: 'petzval-85',
    name: 'Lomography Petzval 85mm f/2.2',
    manufacturer: 'Lomography',
    focalLength: 85,
    maxAperture: 2.2,
    type: 'vintage',
    character: 'swirly',
    distortion: { k1: -0.02, k2: 0.005, k3: 0 },
    chromaticAberration: { intensity: 0.5, type: 'longitudinal' },
    vignette: { amount: 55, feather: 0.4, opticalFeel: true },
    bokeh: { shape: 'swirl', creaminess: 0.6, onionRings: 0.05, catEye: 0.8 },
    flare: { susceptibility: 0.7, color: '#c8a060', hasAnamorphicStreak: false },
    description: 'Strong swirl character with vintage edge falloff.',
  },
  {
    id: 'canon-35-14',
    name: 'Canon EF 35mm f/1.4L',
    manufacturer: 'Canon',
    focalLength: 35,
    maxAperture: 1.4,
    type: 'prime',
    character: 'classic',
    distortion: { k1: -0.04, k2: 0.008, k3: 0 },
    chromaticAberration: { intensity: 0.35, type: 'lateral' },
    vignette: { amount: 45, feather: 0.55, opticalFeel: true },
    bokeh: { shape: 'circular', creaminess: 0.7, onionRings: 0.25, catEye: 0.5 },
    flare: { susceptibility: 0.55, color: '#ddb060', hasAnamorphicStreak: false },
    description: 'Wide prime with visible barrel and strong wide-open vignette.',
  },
  {
    id: 'sigma-14-18',
    name: 'Sigma 14mm f/1.8 Art',
    manufacturer: 'Sigma',
    focalLength: 14,
    maxAperture: 1.8,
    type: 'prime',
    character: 'sharp',
    distortion: { k1: -0.18, k2: 0.03, k3: 0 },
    chromaticAberration: { intensity: 0.5, type: 'lateral' },
    vignette: { amount: 65, feather: 0.4, opticalFeel: true },
    bokeh: { shape: 'hexagonal', creaminess: 0.5, onionRings: 0.4, catEye: 0.7 },
    flare: { susceptibility: 0.65, color: '#e0c080', hasAnamorphicStreak: false },
    description: 'Ultra-wide dramatic barrel distortion and edge effects.',
  },
  {
    id: 'cooke-s4-32',
    name: 'Cooke S4/i 32mm T2',
    manufacturer: 'Cooke',
    focalLength: 32,
    maxAperture: 2.0,
    type: 'cinema',
    character: 'creamy',
    distortion: { k1: -0.008, k2: 0.001, k3: 0 },
    chromaticAberration: { intensity: 0.05, type: 'lateral' },
    vignette: { amount: 20, feather: 0.8, opticalFeel: true },
    bokeh: { shape: 'circular', creaminess: 0.95, onionRings: 0.0, catEye: 0.2 },
    flare: { susceptibility: 0.25, color: '#c8b890', hasAnamorphicStreak: false },
    description: 'Creamy cinema rendering with subtle optical signature.',
  },
  {
    id: 'anamorphic-40',
    name: 'Anamorphic 40mm 1.33x',
    manufacturer: 'Generic Anamorphic',
    focalLength: 40,
    maxAperture: 2.0,
    type: 'anamorphic',
    character: 'classic',
    distortion: { k1: 0.02, k2: -0.003, k3: 0 },
    chromaticAberration: { intensity: 0.6, type: 'lateral' },
    vignette: { amount: 50, feather: 0.45, opticalFeel: true },
    bokeh: { shape: 'oval', creaminess: 0.7, onionRings: 0.15, catEye: 0.6 },
    flare: { susceptibility: 0.9, color: '#5080d0', hasAnamorphicStreak: true },
    description: 'Oval bokeh and blue streak-like flare behavior.',
  },
  {
    id: 'helios-44',
    name: 'Helios 44-2 58mm f/2',
    manufacturer: 'KMZ (USSR)',
    focalLength: 58,
    maxAperture: 2.0,
    type: 'vintage',
    character: 'swirly',
    distortion: { k1: -0.015, k2: 0.003, k3: 0 },
    chromaticAberration: { intensity: 0.55, type: 'longitudinal' },
    vignette: { amount: 40, feather: 0.5, opticalFeel: true },
    bokeh: { shape: 'swirl', creaminess: 0.65, onionRings: 0.1, catEye: 0.75 },
    flare: { susceptibility: 0.8, color: '#d0a040', hasAnamorphicStreak: false },
    description: 'Iconic Soviet swirl look with strong personality.',
  },
];

export function getLensProfilesByType(type: LensProfile['type']): LensProfile[] {
  return LENS_PROFILES.filter((p) => p.type === type);
}

export function getLensProfileById(id: string): LensProfile | undefined {
  return LENS_PROFILES.find((p) => p.id === id);
}
