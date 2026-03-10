/**
 * Auto Rescue
 * Aplica correcoes automáticas com base nas RescueActions.
 */

import type { RescueAction } from './photoTriage';

export async function autoRescuePhoto(
  imageData: ImageData,
  actions: RescueAction[],
  intensity: number = 0.8
): Promise<ImageData> {
  const { data, width, height } = imageData;
  const result = new Uint8ClampedArray(data);
  const amount = Math.max(0, Math.min(1, intensity));

  for (const action of actions) {
    switch (action) {
      case 'boost_exposure': {
        const lut = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
          const normalized = i / 255;
          const boosted = Math.pow(normalized, 0.6 - amount * 0.2);
          lut[i] = Math.min(255, Math.round(boosted * 255));
        }
        for (let i = 0; i < result.length; i += 4) {
          result[i] = lut[result[i]];
          result[i + 1] = lut[result[i + 1]];
          result[i + 2] = lut[result[i + 2]];
        }
        break;
      }

      case 'enhance_contrast': {
        const lut = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
          const x = i / 255;
          const s = 1 / (1 + Math.exp(-10 * (x - 0.5)));
          const blended = x * (1 - amount) + s * amount;
          lut[i] = Math.min(255, Math.round(blended * 255));
        }
        for (let i = 0; i < result.length; i += 4) {
          result[i] = lut[result[i]];
          result[i + 1] = lut[result[i + 1]];
          result[i + 2] = lut[result[i + 2]];
        }
        break;
      }

      case 'color_correction': {
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        const count = Math.max(1, result.length / 4);
        for (let i = 0; i < result.length; i += 4) {
          sumR += result[i];
          sumG += result[i + 1];
          sumB += result[i + 2];
        }
        const avgR = sumR / count;
        const avgG = sumG / count;
        const avgB = sumB / count;
        const avgGray = (avgR + avgG + avgB) / 3;
        const rScale = avgGray / Math.max(1, avgR);
        const gScale = avgGray / Math.max(1, avgG);
        const bScale = avgGray / Math.max(1, avgB);

        for (let i = 0; i < result.length; i += 4) {
          result[i] = Math.min(255, result[i] * (1 + (rScale - 1) * amount));
          result[i + 1] = Math.min(255, result[i + 1] * (1 + (gScale - 1) * amount));
          result[i + 2] = Math.min(255, result[i + 2] * (1 + (bScale - 1) * amount));
        }
        break;
      }

      case 'sharpen': {
        const strength = amount * 0.6;
        const original = new Uint8ClampedArray(result);
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
              const idx = (y * width + x) * 4 + c;
              const lap =
                5 * original[idx] -
                original[((y - 1) * width + x) * 4 + c] -
                original[((y + 1) * width + x) * 4 + c] -
                original[(y * width + (x - 1)) * 4 + c] -
                original[(y * width + (x + 1)) * 4 + c];
              result[idx] = Math.min(255, Math.max(0, original[idx] + lap * strength));
            }
          }
        }
        break;
      }

      case 'noise_reduction': {
        const original = new Uint8ClampedArray(result);
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            const luma =
              0.2126 * original[idx] +
              0.7152 * original[idx + 1] +
              0.0722 * original[idx + 2];
            const denoiseWeight = Math.max(0, 1 - luma / 128) * amount;
            if (denoiseWeight > 0.1) {
              for (let c = 0; c < 3; c++) {
                const avg =
                  (original[idx + c] +
                    original[((y - 1) * width + x) * 4 + c] +
                    original[((y + 1) * width + x) * 4 + c] +
                    original[(y * width + (x - 1)) * 4 + c] +
                    original[(y * width + (x + 1)) * 4 + c]) /
                  5;
                result[idx + c] = Math.round(
                  original[idx + c] * (1 - denoiseWeight) + avg * denoiseWeight
                );
              }
            }
          }
        }
        break;
      }

      default:
        break;
    }
  }

  return new ImageData(result, width, height);
}
