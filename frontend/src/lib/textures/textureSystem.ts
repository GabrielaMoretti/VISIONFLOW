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

function clamp255(v: number): number {
  return Math.max(0, Math.min(255, v));
}

function blendChannel(base: number, overlay: number, mode: TextureBlendMode, alpha: number): number {
  let mixed = overlay;
  switch (mode) {
    case 'screen':
      mixed = 255 - ((255 - base) * (255 - overlay)) / 255;
      break;
    case 'multiply':
      mixed = (base * overlay) / 255;
      break;
    case 'soft-light': {
      const b = base / 255;
      const o = overlay / 255;
      mixed = ((1 - 2 * o) * b * b + 2 * o * b) * 255;
      break;
    }
    case 'hard-light':
      mixed = overlay < 128 ? (2 * base * overlay) / 255 : 255 - (2 * (255 - base) * (255 - overlay)) / 255;
      break;
    case 'color-dodge':
      mixed = overlay >= 255 ? 255 : Math.min(255, (base * 255) / (255 - overlay));
      break;
    case 'overlay':
    default:
      mixed = base < 128 ? (2 * base * overlay) / 255 : 255 - (2 * (255 - base) * (255 - overlay)) / 255;
      break;
  }
  return clamp255(base * (1 - alpha) + mixed * alpha);
}

export function applyTextureStack(imageData: ImageData, layers: TextureLayer[]): ImageData {
  if (!layers.length) return imageData;

  const out = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
  const { data, width, height } = out;

  for (const layer of layers) {
    const alpha = Math.max(0, Math.min(1, layer.opacity / 100));

    switch (layer.category) {
      case 'film_grain': {
        const amount = Math.max(0, Number(layer.params.amount ?? 20));
        const roughness = Math.max(0, Math.min(1, Number(layer.params.roughness ?? 0.5)));
        for (let i = 0; i < data.length; i += 4) {
          const mono = (Math.random() - 0.5) * amount * 2;
          const r = data[i] + mono * (roughness > 0.5 ? 0.9 + Math.random() * 0.2 : 1);
          const g = data[i + 1] + mono;
          const b = data[i + 2] + mono * (roughness > 0.5 ? 0.9 + Math.random() * 0.2 : 1);
          data[i] = blendChannel(data[i], r, layer.blendMode, alpha);
          data[i + 1] = blendChannel(data[i + 1], g, layer.blendMode, alpha);
          data[i + 2] = blendChannel(data[i + 2], b, layer.blendMode, alpha);
        }
        break;
      }
      case 'halation': {
        const intensity = Math.max(0, Number(layer.params.intensity ?? 25));
        const threshold = Math.max(0, Math.min(255, Number(layer.params.threshold ?? 190)));
        for (let i = 0; i < data.length; i += 4) {
          const luma = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          if (luma > threshold) {
            const glow = ((luma - threshold) / Math.max(1, 255 - threshold)) * intensity * 1.8;
            data[i] = blendChannel(data[i], data[i] + glow, 'screen', alpha);
            data[i + 1] = blendChannel(data[i + 1], data[i + 1] + glow * 0.4, 'screen', alpha * 0.8);
            data[i + 2] = blendChannel(data[i + 2], data[i + 2], 'screen', alpha * 0.4);
          }
        }
        break;
      }
      case 'vhs': {
        const distortion = Math.max(0, Math.min(1, Number(layer.params.distortion ?? 0.3)));
        const chromaBleed = Math.max(0, Math.min(1, Number(layer.params.chromaBleed ?? 0.4)));
        const scanLines = Math.max(0, Math.min(1, Number(layer.params.scanLines ?? 0.5)));
        const source = new Uint8ClampedArray(data);
        const maxShift = Math.round(distortion * 8);
        const chromaPx = Math.round(chromaBleed * 3);
        for (let y = 0; y < height; y++) {
          const shift = Math.round(Math.sin((y / Math.max(1, height)) * Math.PI * 8) * maxShift);
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const sx = Math.max(0, Math.min(width - 1, x + shift));
            const rX = Math.max(0, Math.min(width - 1, sx + chromaPx));
            const bX = Math.max(0, Math.min(width - 1, sx - chromaPx));
            const sIdx = (y * width + sx) * 4;
            const rIdx = (y * width + rX) * 4;
            const bIdx = (y * width + bX) * 4;

            const targetR = source[rIdx];
            const targetG = source[sIdx + 1];
            const targetB = source[bIdx + 2];

            data[idx] = blendChannel(data[idx], targetR, 'overlay', alpha);
            data[idx + 1] = blendChannel(data[idx + 1], targetG, 'overlay', alpha);
            data[idx + 2] = blendChannel(data[idx + 2], targetB, 'overlay', alpha);

            if (scanLines > 0 && y % 2 === 0) {
              data[idx] = clamp255(data[idx] * (1 - scanLines * 0.18));
              data[idx + 1] = clamp255(data[idx + 1] * (1 - scanLines * 0.18));
              data[idx + 2] = clamp255(data[idx + 2] * (1 - scanLines * 0.18));
            }
          }
        }
        break;
      }
      default:
        break;
    }
  }

  return out;
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
