/**
 * Texture System — procedural cinematic texture layers.
 */

export type TextureCategory =
  | 'film_grain'
  | 'halation'
  | 'light_leak'
  | 'dust_scratch'
  | 'paper'
  | 'lens_flare'
  | 'chromatic_aberration'
  | 'vhs'
  | 'infrared';

export type TextureBlendMode =
  | 'overlay'
  | 'screen'
  | 'multiply'
  | 'soft-light'
  | 'hard-light'
  | 'color-dodge';

export interface TextureLayer {
  id: string;
  category: TextureCategory;
  name: string;
  blendMode: TextureBlendMode;
  opacity: number;
  params: Record<string, number>;
}

export function generateFilmGrain(
  canvas: HTMLCanvasElement,
  options: {
    amount: number;
    size: number;
    roughness: number;
    filmType: '8mm' | '16mm' | '35mm' | 'digital';
  }
): ImageData {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  const { width, height } = canvas;
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const grainScale = {
    '8mm': 2.5,
    '16mm': 1.8,
    '35mm': 1.2,
    digital: 0.8,
  }[options.filmType];

  const amount = Math.max(0, Math.min(100, options.amount));
  const roughness = Math.max(0, Math.min(1, options.roughness));

  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * amount * grainScale * 2.55;
    if (roughness < 0.5) {
      const v = 128 + grain;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    } else {
      data[i] = 128 + grain * (0.8 + Math.random() * 0.4);
      data[i + 1] = 128 + grain * (0.8 + Math.random() * 0.4);
      data[i + 2] = 128 + grain * (0.8 + Math.random() * 0.4);
    }
    data[i + 3] = 255;
  }

  return imageData;
}

export function applyHalation(
  ctx: CanvasRenderingContext2D,
  options: {
    intensity: number;
    radius: number;
    hue: number;
    threshold: number;
  }
): void {
  const intensity = Math.max(0, Math.min(100, options.intensity));
  const radius = Math.max(1, Math.min(80, options.radius));
  const hue = Math.max(0, Math.min(60, options.hue));
  const threshold = Math.max(0, Math.min(255, options.threshold));

  const { width, height } = ctx.canvas;
  const source = ctx.getImageData(0, 0, width, height);
  const mask = ctx.createImageData(width, height);

  for (let i = 0; i < source.data.length; i += 4) {
    const r = source.data[i];
    const g = source.data[i + 1];
    const b = source.data[i + 2];
    const luma = r * 0.299 + g * 0.587 + b * 0.114;
    const k = luma >= threshold ? 1 : 0;
    mask.data[i] = r * k;
    mask.data[i + 1] = g * k;
    mask.data[i + 2] = b * k;
    mask.data[i + 3] = 255;
  }

  const tmp = document.createElement('canvas');
  tmp.width = width;
  tmp.height = height;
  const tctx = tmp.getContext('2d');
  if (!tctx) return;

  tctx.putImageData(mask, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = (intensity / 100) * 0.45;
  ctx.filter = `blur(${radius}px) hue-rotate(${hue}deg) saturate(150%)`;
  ctx.drawImage(tmp, 0, 0);
  ctx.restore();
}
