export type ChromaticAberrationType = 'lateral' | 'longitudinal';

function clampCoord(v: number, max: number): number {
  return Math.max(0, Math.min(max - 1, v));
}

export function applyChromaticAberration(
  imageData: ImageData,
  intensity: number,
  type: ChromaticAberrationType = 'lateral'
): ImageData {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  const src = data;
  const dst = result.data;
  const cx = width / 2;
  const cy = height / 2;
  const maxShift = Math.max(0, Math.min(1, intensity)) * 8;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const shift = dist * maxShift;

      const outward = 1 + shift * 0.01;
      const inward = 1 - shift * 0.01;

      const rx = Math.round(cx + (x - cx) * outward);
      const ry = Math.round(cy + (y - cy) * outward);
      const bx = Math.round(cx + (x - cx) * inward);
      const by = Math.round(cy + (y - cy) * inward);

      const idx = (y * width + x) * 4;
      const rIdx = (clampCoord(ry, height) * width + clampCoord(rx, width)) * 4;
      const bIdx = (clampCoord(by, height) * width + clampCoord(bx, width)) * 4;

      if (type === 'longitudinal') {
        const glow = 1 + dist * intensity * 0.2;
        dst[idx] = Math.min(255, src[rIdx] * glow);
        dst[idx + 1] = src[idx + 1];
        dst[idx + 2] = Math.min(255, src[bIdx + 2] * glow);
      } else {
        dst[idx] = src[rIdx];
        dst[idx + 1] = src[idx + 1];
        dst[idx + 2] = src[bIdx + 2];
      }
      dst[idx + 3] = 255;
    }
  }

  return result;
}
