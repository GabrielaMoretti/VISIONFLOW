export function applyLensDistortion(
  imageData: ImageData,
  k1: number,
  k2: number = 0,
  k3: number = 0
): ImageData {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data.length), width, height);

  const cx = width / 2;
  const cy = height / 2;
  const normFactor = Math.max(cx, cy);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = (x - cx) / normFactor;
      const ny = (y - cy) / normFactor;
      const r2 = nx * nx + ny * ny;
      const r4 = r2 * r2;
      const r6 = r2 * r4;
      const factor = 1 + k1 * r2 + k2 * r4 + k3 * r6;

      const srcX = Math.round(cx + nx * factor * normFactor);
      const srcY = Math.round(cy + ny * factor * normFactor);
      const dstIdx = (y * width + x) * 4;

      if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
        const srcIdx = (srcY * width + srcX) * 4;
        result.data[dstIdx] = data[srcIdx];
        result.data[dstIdx + 1] = data[srcIdx + 1];
        result.data[dstIdx + 2] = data[srcIdx + 2];
        result.data[dstIdx + 3] = 255;
      } else {
        result.data[dstIdx] = 0;
        result.data[dstIdx + 1] = 0;
        result.data[dstIdx + 2] = 0;
        result.data[dstIdx + 3] = 255;
      }
    }
  }

  return result;
}
