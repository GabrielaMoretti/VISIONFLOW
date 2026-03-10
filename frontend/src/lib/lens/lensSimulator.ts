import type { LensProfile } from './lensProfiles';
import { applyChromaticAberration } from './chromaticAberration';
import { applyLensDistortion } from './lensDistortion';

function applyVignette(
  imageData: ImageData,
  amount: number,
  feather: number
): ImageData {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  const dst = result.data;

  const cx = width / 2;
  const cy = height / 2;
  const strength = Math.max(0, Math.min(100, amount)) / 100;
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
      dst[idx] = Math.max(0, Math.min(255, dst[idx] * mult));
      dst[idx + 1] = Math.max(0, Math.min(255, dst[idx + 1] * mult));
      dst[idx + 2] = Math.max(0, Math.min(255, dst[idx + 2] * mult));
    }
  }

  return result;
}

function apertureScale(aperture: number): number {
  // Lower f-stop -> stronger optical artifacts.
  const clamped = Math.max(1.4, Math.min(16, aperture));
  return Math.max(0.2, Math.min(1, (16 - clamped) / (16 - 1.4)));
}

export interface LensSimulatorToggles {
  distortion?: boolean;
  chromaticAberration?: boolean;
  vignette?: boolean;
}

export async function applyLensProfile(
  imageData: ImageData,
  profile: LensProfile,
  aperture: number,
  toggles: LensSimulatorToggles = {
    distortion: true,
    chromaticAberration: true,
    vignette: true,
  }
): Promise<ImageData> {
  const scale = apertureScale(aperture);
  let out = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);

  if (toggles.distortion !== false) {
    out = applyLensDistortion(
      out,
      profile.distortion.k1 * scale,
      profile.distortion.k2 * scale,
      profile.distortion.k3 * scale
    );
  }

  if (toggles.chromaticAberration !== false) {
    out = applyChromaticAberration(
      out,
      Math.max(0, Math.min(1, profile.chromaticAberration.intensity * (0.6 + scale * 0.7))),
      profile.chromaticAberration.type
    );
  }

  if (toggles.vignette !== false) {
    out = applyVignette(
      out,
      profile.vignette.amount * (0.6 + scale * 0.8),
      profile.vignette.feather
    );
  }

  return out;
}
