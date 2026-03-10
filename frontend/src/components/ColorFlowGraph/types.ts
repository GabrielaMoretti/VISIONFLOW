export type NodeType =
  | 'imageInput'
  | 'whiteBalance'
  | 'curves'
  | 'splitToning'
  | 'saturation'
  | 'vignette'
  | 'grain'
  | 'vhs'
  | 'sharpen'
  | 'lut'
  | 'blend'
  | 'mask'
  | 'texture'
  | 'lens'
  | 'output';

export interface ColorFlowNodeData {
  [key: string]: unknown;
  nodeType: NodeType;
  label: string;
  params: Record<string, number | string | boolean | null>;
}

export const NODE_DEFAULTS: Record<NodeType, Record<string, number | string | boolean | null>> = {
  imageInput: {},
  whiteBalance: { temperature: 0, tint: 0 },
  curves: { masterGamma: 1.0, redGain: 1.0, greenGain: 1.0, blueGain: 1.0, contrast: 0 },
  splitToning: { highlightHue: 40, highlightSat: 15, shadowHue: 210, shadowSat: 20, balance: 0 },
  saturation: { saturation: 0, vibrance: 0, hue: 0, lightness: 0 },
  vignette: { amount: 20, feather: 0.5, roundness: 0.5 },
  grain: { amount: 15, size: 1.5, roughness: 0.5 },
  vhs: { distortion: 0, chromaBleed: 0, scanLines: 0 },
  sharpen: { amount: 10, radius: 1.0, threshold: 0 },
  lut: { lutFile: null, strength: 100 },
  blend: { mode: 'normal', opacity: 100 },
  mask: { type: 'luminosity', min: 0, max: 255, feather: 10 },
  texture: { file: null, blendMode: 'overlay', opacity: 30 },
  lens: {
    profileId: 'canon-50-14',
    aperture: 2.8,
    distortionEnabled: true,
    chromaticAberrationEnabled: true,
    vignetteEnabled: true,
  },
  output: {},
};
