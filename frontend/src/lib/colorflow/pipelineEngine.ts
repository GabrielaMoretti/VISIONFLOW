/**
 * Color Flow Pipeline Engine
 * Executes graph nodes in topological order on an ImageData buffer.
 */

import type { Edge, Node } from '@xyflow/react';
import { getLensProfileById } from '../lens/lensProfiles';
import { applyLensProfile } from '../lens/lensSimulator';

export interface PipelineResult {
  imageData: ImageData;
  executionTime: number;
  nodesExecuted: string[];
}

function clamp255(v: number): number {
  return Math.max(0, Math.min(255, v));
}

function applyTemperature(data: Uint8ClampedArray, delta: number): void {
  const rMult = 1 + (delta / 100) * 0.25;
  const bMult = 1 - (delta / 100) * 0.25;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp255(data[i] * rMult);
    data[i + 2] = clamp255(data[i + 2] * bMult);
  }
}

function applyWhiteBalance(data: Uint8ClampedArray, temperature: number, tint: number): void {
  applyTemperature(data, temperature);
  const gMult = 1 + (tint / 100) * 0.15;
  for (let i = 0; i < data.length; i += 4) {
    data[i + 1] = clamp255(data[i + 1] * gMult);
  }
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function applySplitToning(
  data: Uint8ClampedArray,
  highlightHue: number,
  highlightSat: number,
  shadowHue: number,
  shadowSat: number,
  balance: number
): void {
  const balanceFactor = (balance + 100) / 200;
  const [hr, hg, hb] = hslToRgb(highlightHue, highlightSat, 50);
  const [sr, sg, sb] = hslToRgb(shadowHue, shadowSat, 50);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const t = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    const shadowWeight = Math.max(0, (1 - t) - balanceFactor * 0.3);
    const highlightWeight = Math.max(0, t - (1 - balanceFactor) * 0.3);
    const castStr = 0.5;

    data[i] = clamp255(
      r +
        (hr - 128) * highlightWeight * castStr * (highlightSat / 50) +
        (sr - 128) * shadowWeight * castStr * (shadowSat / 50)
    );
    data[i + 1] = clamp255(
      g +
        (hg - 128) * highlightWeight * castStr * (highlightSat / 50) +
        (sg - 128) * shadowWeight * castStr * (shadowSat / 50)
    );
    data[i + 2] = clamp255(
      b +
        (hb - 128) * highlightWeight * castStr * (highlightSat / 50) +
        (sb - 128) * shadowWeight * castStr * (shadowSat / 50)
    );
  }
}

function applySaturation(
  data: Uint8ClampedArray,
  satDelta: number,
  vibrance: number,
  hueDelta: number,
  lightnessDelta: number
): void {
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    const vibranceMult = vibrance > 0 ? (1 - s / 100) * (vibrance / 100) : 0;
    const newS = Math.max(0, Math.min(100, s + satDelta + vibranceMult * 30));
    const newH = ((h + hueDelta) % 360 + 360) % 360;
    const newL = Math.max(0, Math.min(100, l + lightnessDelta));
    const [nr, ng, nb] = hslToRgb(newH, newS, newL);
    data[i] = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
  }
}

function applyCurves(
  data: Uint8ClampedArray,
  masterGamma: number,
  redGain: number,
  greenGain: number,
  blueGain: number,
  contrastDelta: number
): void {
  const gamma = Math.max(0.2, masterGamma);
  const lut = new Uint8Array(256);
  const contrastFactor = 1 + contrastDelta / 100;
  for (let i = 0; i < 256; i++) {
    const gammaMapped = Math.pow(i / 255, 1 / gamma) * 255;
    lut[i] = clamp255(Math.round((gammaMapped - 128) * contrastFactor + 128));
  }

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp255(lut[data[i]] * redGain);
    data[i + 1] = clamp255(lut[data[i + 1]] * greenGain);
    data[i + 2] = clamp255(lut[data[i + 2]] * blueGain);
  }
}

function applyVhs(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  distortion: number,
  chromaBleed: number,
  scanLines: number
): void {
  if (distortion <= 0 && chromaBleed <= 0 && scanLines <= 0) return;

  const source = new Uint8ClampedArray(data);
  const maxShift = Math.max(0, Math.round(distortion * 10));
  const chromaPx = Math.max(0, Math.round(chromaBleed * 4));
  const scanStrength = Math.max(0, Math.min(1, scanLines));

  for (let y = 0; y < height; y++) {
    const waveShift = maxShift > 0
      ? Math.round(Math.sin((y / Math.max(1, height)) * Math.PI * 10) * maxShift)
      : 0;

    for (let x = 0; x < width; x++) {
      const srcX = Math.max(0, Math.min(width - 1, x + waveShift));
      const baseIdx = (y * width + x) * 4;
      const srcIdx = (y * width + srcX) * 4;

      const rX = Math.max(0, Math.min(width - 1, srcX + chromaPx));
      const bX = Math.max(0, Math.min(width - 1, srcX - chromaPx));
      const rIdx = (y * width + rX) * 4;
      const bIdx = (y * width + bX) * 4;

      data[baseIdx] = source[rIdx];
      data[baseIdx + 1] = source[srcIdx + 1];
      data[baseIdx + 2] = source[bIdx + 2];

      if (scanStrength > 0) {
        const lineDarken = y % 2 === 0 ? 1 - scanStrength * 0.2 : 1;
        data[baseIdx] = clamp255(data[baseIdx] * lineDarken);
        data[baseIdx + 1] = clamp255(data[baseIdx + 1] * lineDarken);
        data[baseIdx + 2] = clamp255(data[baseIdx + 2] * lineDarken);
      }
    }
  }
}

function applyVignette(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  amount: number,
  feather: number
): void {
  const cx = width / 2;
  const cy = height / 2;
  const strength = amount / 100;
  const featherSafe = Math.max(0.001, Math.min(1, feather));
  const vignetteStart = 1 - featherSafe;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;
      const normalizedDist = Math.sqrt(dx * dx + dy * dy) / 1.41421;

      let vigFactor = 0;
      if (normalizedDist > vignetteStart) {
        vigFactor = (normalizedDist - vignetteStart) / featherSafe;
        vigFactor *= vigFactor;
      }

      const mult = 1 - vigFactor * strength;
      const idx = (y * width + x) * 4;
      data[idx] = Math.max(0, data[idx] * mult);
      data[idx + 1] = Math.max(0, data[idx + 1] * mult);
      data[idx + 2] = Math.max(0, data[idx + 2] * mult);
    }
  }
}

function applySharpen(data: Uint8ClampedArray, width: number, height: number, amount: number): void {
  if (amount === 0) return;

  const kernel = [0, -1, 0, -1, 4 + amount / 25, -1, 0, -1, 0];
  const factor = amount / 100;
  const original = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += original[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        const idx = (y * width + x) * 4 + c;
        data[idx] = clamp255(original[idx] + sum * factor * 0.1);
      }
    }
  }
}

function applyGrain(data: Uint8ClampedArray, amount: number, roughness: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const grainMono = (Math.random() - 0.5) * amount * 1.5;
    if (roughness < 0.5) {
      data[i] = clamp255(data[i] + grainMono);
      data[i + 1] = clamp255(data[i + 1] + grainMono);
      data[i + 2] = clamp255(data[i + 2] + grainMono);
    } else {
      data[i] = clamp255(data[i] + (Math.random() - 0.5) * amount * 1.5);
      data[i + 1] = clamp255(data[i + 1] + (Math.random() - 0.5) * amount * 1.5);
      data[i + 2] = clamp255(data[i + 2] + (Math.random() - 0.5) * amount * 1.5);
    }
  }
}

function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  });

  edges.forEach((e) => {
    adj.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  });

  const queue = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0);
  const sorted: Node[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    sorted.push(node);

    const targets = adj.get(node.id) ?? [];
    targets.forEach((targetId) => {
      const deg = (inDegree.get(targetId) ?? 0) - 1;
      inDegree.set(targetId, deg);
      if (deg === 0) {
        const target = nodes.find((n) => n.id === targetId);
        if (target) queue.push(target);
      }
    });
  }

  // If cycle exists, return original order as safe fallback.
  return sorted.length === nodes.length ? sorted : nodes;
}

export async function executePipeline(
  sourceImageData: ImageData,
  nodes: Node[],
  edges: Edge[]
): Promise<PipelineResult> {
  const start = performance.now();

  const workingData = new ImageData(
    new Uint8ClampedArray(sourceImageData.data),
    sourceImageData.width,
    sourceImageData.height
  );

  const data = workingData.data;
  const { width, height } = workingData;
  const sortedNodes = topologicalSort(nodes, edges);
  const executed: string[] = [];

  for (const node of sortedNodes) {
    const nodeData = (node.data ?? {}) as { nodeType?: string; params?: Record<string, number | string | boolean> };
    const type = nodeData.nodeType ?? '';
    const p = nodeData.params ?? {};
    executed.push(type || node.id);

    const num = (v: unknown, fallback: number): number =>
      typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || fallback : fallback;

    switch (type) {
      case 'imageInput':
      case 'output':
        break;
      case 'whiteBalance':
        applyWhiteBalance(data, num(p.temperature, 0), num(p.tint, 0));
        break;
      case 'curves':
        applyCurves(
          data,
          num(p.masterGamma, 1),
          num(p.redGain, 1),
          num(p.greenGain, 1),
          num(p.blueGain, 1),
          num(p.contrast, 0)
        );
        break;
      case 'splitToning':
        applySplitToning(
          data,
          num(p.highlightHue, 40),
          num(p.highlightSat, 15),
          num(p.shadowHue, 210),
          num(p.shadowSat, 20),
          num(p.balance, 0)
        );
        break;
      case 'saturation':
        applySaturation(
          data,
          num(p.saturation, 0),
          num(p.vibrance, 0),
          num(p.hue, 0),
          num(p.lightness, 0)
        );
        break;
      case 'vignette':
        applyVignette(data, width, height, num(p.amount, 20), num(p.feather, 0.5));
        break;
      case 'sharpen':
        applySharpen(data, width, height, num(p.amount, 10));
        break;
      case 'grain':
        applyGrain(data, num(p.amount, 15), num(p.roughness, 0.5));
        break;
      case 'vhs':
        applyVhs(
          data,
          width,
          height,
          num(p.distortion, 0),
          num(p.chromaBleed, 0),
          num(p.scanLines, 0)
        );
        break;
      case 'lens': {
        const profileId = String(p.profileId ?? 'canon-50-14');
        const profile = getLensProfileById(profileId);
        if (!profile) break;
        const lensOut = await applyLensProfile(
          workingData,
          profile,
          Number(p.aperture ?? 2.8),
          {
            distortion: p.distortionEnabled !== false,
            chromaticAberration: p.chromaticAberrationEnabled !== false,
            vignette: p.vignetteEnabled !== false,
          }
        );
        workingData.data.set(lensOut.data);
        break;
      }
      default:
        break;
    }
  }

  return {
    imageData: workingData,
    executionTime: performance.now() - start,
    nodesExecuted: executed,
  };
}
