/**
 * VisionFlow Canvas Processor
 * Self-contained client-side image processing engine using Canvas API.
 * No external dependencies — all color math is inlined.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProcessingParams {
  temperature: number;          // -50 to 50
  hue: number;                  // -30 to 30
  saturation: number;           // -80 to 25
  lightness: number;            // -15 to 15
  contrast: number;             // -20 to 20
  vignette: number;             // 0 to 40
  sharpen: number;              // -20 to 40
  splitHighlightHue?: number;   // 0–360
  splitHighlightSat?: number;   // 0–30
  splitShadowHue?: number;      // 0–360
  splitShadowSat?: number;      // 0–35
}

export const DEFAULT_PARAMS: ProcessingParams = {
  temperature: 0, hue: 0, saturation: 0, lightness: 0,
  contrast: 0, vignette: 0, sharpen: 0,
};

export interface QuickAnalysis {
  temperature: number;
  saturation: number;
  lightness: number;
  contrast: number;
  dominantColors: string[];
}

export interface MoodPreset {
  name: string;
  keywords: string[];
  params: ProcessingParams;
  category: string;
  accent: string;
}

// ─── HSL Conversion (self-contained) ─────────────────────────────────────────

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

// ─── Pixel Processing ────────────────────────────────────────────────────────

export function processImageData(source: ImageData, params: ProcessingParams): ImageData {
  const w = source.width, h = source.height;
  const out = new ImageData(new Uint8ClampedArray(source.data), w, h);
  const d = out.data;
  const cx = w / 2, cy = h / 2;

  const hasTemp = params.temperature !== 0;
  const hasHSL = params.hue !== 0 || params.saturation !== 0 || params.lightness !== 0;
  const hasContrast = params.contrast !== 0;
  const hasVignette = params.vignette > 0;
  const hasSplitHi = params.splitHighlightSat != null && params.splitHighlightSat > 0;
  const hasSplitSh = params.splitShadowSat != null && params.splitShadowSat > 0;

  // Pre-compute constants
  const tR = params.temperature * 1.4;
  const tB = -params.temperature * 1.4;
  const tG = params.temperature * 0.25;
  const cFactor = hasContrast ? 1 + params.contrast / 40 : 1;

  let hiR = 0, hiG = 0, hiB = 0;
  let shR = 0, shG = 0, shB = 0;
  if (hasSplitHi) [hiR, hiG, hiB] = hslToRgb(params.splitHighlightHue!, 80, 65);
  if (hasSplitSh) [shR, shG, shB] = hslToRgb(params.splitShadowHue!, 70, 35);

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];

    // 1. Temperature shift
    if (hasTemp) {
      r = clamp(r + tR, 0, 255);
      g = clamp(g + tG, 0, 255);
      b = clamp(b + tB, 0, 255);
    }

    // 2. HSL adjustments
    if (hasHSL) {
      let [hh, ss, ll] = rgbToHsl(r, g, b);
      hh = (hh + params.hue + 360) % 360;
      ss = clamp(ss + params.saturation, 0, 100);
      ll = clamp(ll + params.lightness, 0, 100);
      [r, g, b] = hslToRgb(hh, ss, ll);
    }

    // 3. Split toning
    const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    if (hasSplitHi && lum > 0.55) {
      const str = (lum - 0.55) / 0.45 * (params.splitHighlightSat! / 80);
      r = clamp(r + (hiR - r) * str, 0, 255);
      g = clamp(g + (hiG - g) * str, 0, 255);
      b = clamp(b + (hiB - b) * str, 0, 255);
    }
    if (hasSplitSh && lum < 0.45) {
      const str = (0.45 - lum) / 0.45 * (params.splitShadowSat! / 80);
      r = clamp(r + (shR - r) * str, 0, 255);
      g = clamp(g + (shG - g) * str, 0, 255);
      b = clamp(b + (shB - b) * str, 0, 255);
    }

    // 4. Contrast (pivot at mid-gray)
    if (hasContrast) {
      r = clamp(128 + (r - 128) * cFactor, 0, 255);
      g = clamp(128 + (g - 128) * cFactor, 0, 255);
      b = clamp(128 + (b - 128) * cFactor, 0, 255);
    }

    // 5. Vignette
    if (hasVignette) {
      const px = (i / 4) % w, py = Math.floor(i / 4 / w);
      const dx = (px - cx) / cx, dy = (py - cy) / cy;
      const vig = Math.max(0, 1 - (dx * dx + dy * dy) * (params.vignette / 50));
      r *= vig; g *= vig; b *= vig;
    }

    d[i] = r; d[i + 1] = g; d[i + 2] = b;
  }
  return out;
}

// ─── Image Loading & Export ──────────────────────────────────────────────────

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

export function imageToCanvas(
  img: HTMLImageElement,
  maxSize: number = 800
): { canvas: HTMLCanvasElement; imageData: ImageData; scale: number } {
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  const scale = maxSize > 0 && Math.max(w, h) > maxSize ? maxSize / Math.max(w, h) : 1;
  w = Math.round(w * scale); h = Math.round(h * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  return { canvas, imageData: ctx.getImageData(0, 0, w, h), scale };
}

export function renderToCanvas(canvas: HTMLCanvasElement, imageData: ImageData): void {
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  canvas.getContext('2d')!.putImageData(imageData, 0, 0);
}

export function exportCanvas(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.92
): void {
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visionflow-export.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, mime, quality);
}

// ─── Quick Analysis ──────────────────────────────────────────────────────────

export function quickAnalyze(imageData: ImageData): QuickAnalysis {
  const data = imageData.data;
  const step = Math.max(1, Math.floor(Math.sqrt(data.length / 4 / 400)));
  const hslVals: [number, number, number][] = [];

  for (let i = 0; i < data.length; i += step * 4) {
    if (data[i + 3] > 128) hslVals.push(rgbToHsl(data[i], data[i + 1], data[i + 2]));
  }
  if (hslVals.length === 0) {
    return { temperature: 0, saturation: 50, lightness: 50, contrast: 50, dominantColors: [] };
  }

  const avgH = hslVals.reduce((s, [h]) => s + h, 0) / hslVals.length;
  const avgS = hslVals.reduce((s, [, ss]) => s + ss, 0) / hslVals.length;
  const avgL = hslVals.reduce((s, [, , l]) => s + l, 0) / hslVals.length;

  const h = ((avgH % 360) + 360) % 360;
  let temp = 0;
  if (h <= 50) temp = 40 * Math.cos(((h - 20) / 50) * (Math.PI / 2));
  else if (h >= 180 && h <= 260) temp = -40 * Math.cos(((h - 220) / 60) * (Math.PI / 2));
  temp *= Math.min(1, avgS / 40);

  const variance = hslVals.reduce((s, [, , l]) => s + (l - avgL) ** 2, 0) / hslVals.length;

  return {
    temperature: Math.round(temp),
    saturation: Math.round(Math.min(100, avgS)),
    lightness: Math.round(Math.min(100, avgL)),
    contrast: Math.round(Math.min(100, Math.sqrt(variance) * 2)),
    dominantColors: kmeansColors(data, step, 5),
  };
}

function kmeansColors(data: Uint8ClampedArray, step: number, k: number): string[] {
  const pixels: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += step * 4) {
    if (data[i + 3] > 128) pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (pixels.length < k) return pixels.map(([r, g, b]) => `rgb(${r},${g},${b})`);

  let centroids = pixels.slice(0, k).map(c => [...c] as [number, number, number]);
  for (let iter = 0; iter < 5; iter++) {
    const clusters: [number, number, number][][] = Array.from({ length: k }, () => []);
    for (const px of pixels) {
      let minD = Infinity, nearest = 0;
      for (let c = 0; c < k; c++) {
        const dd = (px[0] - centroids[c][0]) ** 2 + (px[1] - centroids[c][1]) ** 2 + (px[2] - centroids[c][2]) ** 2;
        if (dd < minD) { minD = dd; nearest = c; }
      }
      clusters[nearest].push(px);
    }
    centroids = clusters.map((cl, i) => {
      if (cl.length === 0) return centroids[i];
      return [
        Math.round(cl.reduce((s, p) => s + p[0], 0) / cl.length),
        Math.round(cl.reduce((s, p) => s + p[1], 0) / cl.length),
        Math.round(cl.reduce((s, p) => s + p[2], 0) / cl.length),
      ] as [number, number, number];
    });
  }
  return centroids.map(([r, g, b]) => `rgb(${r},${g},${b})`);
}

// ─── Mood Presets ────────────────────────────────────────────────────────────

export const MOOD_PRESETS: MoodPreset[] = [
  {
    name: 'cinematic',
    keywords: ['cinematic', 'film', 'movie', 'blockbuster', 'epic', 'cinemático'],
    params: { temperature: -6, hue: 0, saturation: -8, lightness: -3, contrast: 10, vignette: 28, sharpen: 12,
      splitShadowHue: 210, splitShadowSat: 20, splitHighlightHue: 35, splitHighlightSat: 12 },
    category: 'genre', accent: '#38BDF8',
  },
  {
    name: 'lo-fi',
    keywords: ['lo-fi', 'lofi', 'vintage', 'retro', 'analog', 'nostálgico'],
    params: { temperature: 10, hue: 0, saturation: -12, lightness: 4, contrast: -8, vignette: 28, sharpen: -10,
      splitHighlightHue: 42, splitHighlightSat: 14, splitShadowHue: 30, splitShadowSat: 10 },
    category: 'genre', accent: '#D4A373',
  },
  {
    name: 'synthwave',
    keywords: ['synthwave', 'neon', 'cyberpunk', 'vaporwave', 'retro-future'],
    params: { temperature: -5, hue: 0, saturation: 18, lightness: 0, contrast: 12, vignette: 30, sharpen: 15,
      splitHighlightHue: 300, splitHighlightSat: 22, splitShadowHue: 200, splitShadowSat: 28 },
    category: 'genre', accent: '#E040FB',
  },
  {
    name: 'dark',
    keywords: ['dark', 'trap', 'heavy', 'aggressive', 'underground'],
    params: { temperature: -5, hue: 0, saturation: -15, lightness: -8, contrast: 18, vignette: 35, sharpen: 20,
      splitShadowHue: 0, splitShadowSat: 15 },
    category: 'genre', accent: '#B71C1C',
  },
  {
    name: 'ethereal',
    keywords: ['ethereal', 'dreamlike', 'surreal', 'magic', 'celestial', 'etéreo'],
    params: { temperature: -3, hue: 0, saturation: 8, lightness: 8, contrast: -5, vignette: 20, sharpen: -8,
      splitHighlightHue: 270, splitHighlightSat: 15 },
    category: 'emotional', accent: '#CE93D8',
  },
  {
    name: 'noturno',
    keywords: ['noturno', 'night', 'midnight', 'noir', 'nocturne'],
    params: { temperature: -12, hue: 0, saturation: -10, lightness: -10, contrast: 15, vignette: 38, sharpen: 0,
      splitShadowHue: 225, splitShadowSat: 22, splitHighlightHue: 210, splitHighlightSat: 10 },
    category: 'time', accent: '#1A237E',
  },
  {
    name: 'sunset',
    keywords: ['sunset', 'sunrise', 'golden', 'golden hour', 'pôr do sol'],
    params: { temperature: 18, hue: 0, saturation: 12, lightness: 3, contrast: 8, vignette: 20, sharpen: 0,
      splitHighlightHue: 28, splitHighlightSat: 22, splitShadowHue: 350, splitShadowSat: 14 },
    category: 'time', accent: '#FF6F00',
  },
  {
    name: 'luxurious',
    keywords: ['luxury', 'premium', 'rich', 'gold', 'glamour', 'luxuoso'],
    params: { temperature: 12, hue: 0, saturation: 10, lightness: 3, contrast: 8, vignette: 20, sharpen: 18,
      splitHighlightHue: 38, splitHighlightSat: 20 },
    category: 'color', accent: '#FFD700',
  },
  {
    name: 'melancólico',
    keywords: ['melancólico', 'triste', 'saudade', 'nostalgia', 'melancholy', 'sad'],
    params: { temperature: -8, hue: 0, saturation: -8, lightness: -5, contrast: 5, vignette: 22, sharpen: 0,
      splitShadowHue: 215, splitShadowSat: 18, splitHighlightHue: 210, splitHighlightSat: 8 },
    category: 'emotional', accent: '#5C6BC0',
  },
  {
    name: 'calmante',
    keywords: ['calmante', 'relaxante', 'paz', 'serenidade', 'calm', 'peaceful', 'ambient'],
    params: { temperature: -4, hue: 0, saturation: -5, lightness: 4, contrast: -5, vignette: 12, sharpen: -5,
      splitHighlightHue: 185, splitHighlightSat: 10 },
    category: 'emotional', accent: '#80CBC4',
  },
  {
    name: 'gritty',
    keywords: ['gritty', 'raw', 'harsh', 'industrial', 'punk'],
    params: { temperature: 0, hue: 0, saturation: -20, lightness: -6, contrast: 20, vignette: 32, sharpen: 30,
      splitShadowHue: 15, splitShadowSat: 12 },
    category: 'texture', accent: '#6D4C41',
  },
  {
    name: 'black & white',
    keywords: ['black and white', 'b&w', 'preto e branco', 'monochrome'],
    params: { temperature: 0, hue: 0, saturation: -80, lightness: 0, contrast: 15, vignette: 25, sharpen: 15 },
    category: 'color', accent: '#9E9E9E',
  },
  {
    name: 'energético',
    keywords: ['energético', 'vibrante', 'vivo', 'energy', 'pop', 'festa'],
    params: { temperature: 8, hue: 0, saturation: 15, lightness: 5, contrast: 10, vignette: 8, sharpen: 20 },
    category: 'emotional', accent: '#FF5722',
  },
  {
    name: 'forest',
    keywords: ['forest', 'nature', 'green', 'floresta', 'natural'],
    params: { temperature: -3, hue: 0, saturation: 10, lightness: -3, contrast: 6, vignette: 18, sharpen: 0,
      splitHighlightHue: 95, splitHighlightSat: 14, splitShadowHue: 140, splitShadowSat: 16 },
    category: 'environment', accent: '#4CAF50',
  },
  {
    name: 'underwater',
    keywords: ['underwater', 'aquatic', 'deep', 'subaquático'],
    params: { temperature: -15, hue: 0, saturation: 15, lightness: -5, contrast: 5, vignette: 30, sharpen: -5,
      splitHighlightHue: 190, splitHighlightSat: 20, splitShadowHue: 210, splitShadowSat: 25 },
    category: 'environment', accent: '#0097A7',
  },
  {
    name: 'pastel',
    keywords: ['pastel', 'soft', 'delicate', 'light', 'airy', 'delicado'],
    params: { temperature: 5, hue: 0, saturation: -15, lightness: 10, contrast: -10, vignette: 8, sharpen: -5 },
    category: 'color', accent: '#F8BBD0',
  },
];

// ─── Mood Matching ───────────────────────────────────────────────────────────

export function matchMoods(
  text: string,
  intensity: number = 0.65
): { moods: string[]; params: ProcessingParams; confidence: number } {
  const lower = text.toLowerCase();
  const matches: { preset: MoodPreset; count: number }[] = [];

  for (const preset of MOOD_PRESETS) {
    const count = preset.keywords.filter(kw => lower.includes(kw)).length;
    if (count > 0) matches.push({ preset, count });
  }
  matches.sort((a, b) => b.count - a.count);

  const top = matches.slice(0, 2);
  if (top.length === 0) {
    return { moods: ['neutral'], params: { ...DEFAULT_PARAMS }, confidence: 0 };
  }

  const totalWeight = top.reduce((s, m) => s + m.count, 0);
  const blended = { ...DEFAULT_PARAMS } as any;
  const absKeys = new Set(['splitHighlightHue', 'splitShadowHue']);

  for (const key of Object.keys(DEFAULT_PARAMS) as (keyof ProcessingParams)[]) {
    let sum = 0, usedW = 0;
    for (const m of top) {
      const v = m.preset.params[key];
      if (v !== undefined) { sum += (v as number) * m.count; usedW += m.count; }
    }
    if (usedW > 0) blended[key] = Math.round(sum / usedW);
  }

  // Also blend split params from first match
  if (top[0]) {
    const p = top[0].preset.params;
    if (p.splitHighlightHue != null) blended.splitHighlightHue = p.splitHighlightHue;
    if (p.splitHighlightSat != null) blended.splitHighlightSat = Math.round((p.splitHighlightSat ?? 0) * intensity);
    if (p.splitShadowHue != null) blended.splitShadowHue = p.splitShadowHue;
    if (p.splitShadowSat != null) blended.splitShadowSat = Math.round((p.splitShadowSat ?? 0) * intensity);
  }

  // Scale by intensity (except absolute hue positions)
  for (const key of Object.keys(blended) as (keyof ProcessingParams)[]) {
    if (absKeys.has(key)) continue;
    if (key === 'splitHighlightSat' || key === 'splitShadowSat') continue; // already scaled
    const v = blended[key];
    if (typeof v === 'number') blended[key] = Math.round(v * intensity);
  }

  return {
    moods: top.map(m => m.preset.name),
    params: blended as ProcessingParams,
    confidence: Math.min(100, top.reduce((s, m) => s + m.count * 30, 0)),
  };
}
