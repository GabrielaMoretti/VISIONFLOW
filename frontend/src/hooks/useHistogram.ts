import { useMemo } from 'react';

export interface HistogramData {
  r: Uint32Array;
  g: Uint32Array;
  b: Uint32Array;
  luma: Uint32Array;
}

export function computeHistogram(imageData: ImageData): HistogramData {
  const r = new Uint32Array(256);
  const g = new Uint32Array(256);
  const b = new Uint32Array(256);
  const luma = new Uint32Array(256);

  const { data, width, height } = imageData;
  const step = 2;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const rv = data[idx];
      const gv = data[idx + 1];
      const bv = data[idx + 2];
      const lv = Math.max(0, Math.min(255, Math.round(rv * 0.2126 + gv * 0.7152 + bv * 0.0722)));
      r[rv] += 1;
      g[gv] += 1;
      b[bv] += 1;
      luma[lv] += 1;
    }
  }

  return { r, g, b, luma };
}

export function useHistogram(imageData: ImageData | null): { histogram: HistogramData | null } {
  const histogram = useMemo(() => {
    if (!imageData) return null;
    return computeHistogram(imageData);
  }, [imageData]);

  return { histogram };
}
