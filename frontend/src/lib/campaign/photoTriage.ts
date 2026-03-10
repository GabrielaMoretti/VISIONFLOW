/**
 * Photo Triage Engine
 * Analisa qualidade tecnica da imagem e sugere acao:
 * 'hero' | 'usable' | 'rescue' | 'reject'
 */

export type TriageDecision = 'hero' | 'usable' | 'rescue' | 'reject';

export type RescueAction =
  | 'boost_exposure'
  | 'enhance_contrast'
  | 'color_correction'
  | 'noise_reduction'
  | 'sharpen'
  | 'auto_crop'
  | 'background_blur'
  | 'upscale_2x';

export interface PhotoScore {
  overall: number;
  exposure: number;
  sharpness: number;
  composition: number;
  colorBalance: number;
  decision: TriageDecision;
  issues: string[];
  fixes: string[];
  rescueActions: RescueAction[];
}

export function triagePhoto(imageData: ImageData): PhotoScore {
  const { data, width, height } = imageData;
  const issues: string[] = [];
  const fixes: string[] = [];
  const rescueActions: RescueAction[] = [];

  let totalLuma = 0;
  let darkPixels = 0;
  let brightPixels = 0;
  const pixelCount = Math.max(1, width * height);

  for (let i = 0; i < data.length; i += 4) {
    const luma = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    totalLuma += luma;
    if (luma < 40) darkPixels++;
    if (luma > 220) brightPixels++;
  }

  const avgLuma = totalLuma / pixelCount;
  const darkRatio = darkPixels / pixelCount;
  const brightRatio = brightPixels / pixelCount;

  let exposureScore = 100;
  if (avgLuma < 60) {
    exposureScore = Math.max(0, avgLuma * 1.2);
    issues.push(`Subexposta (brilho medio: ${Math.round(avgLuma)}/255)`);
    fixes.push('Aumentar exposicao +2 stops');
    rescueActions.push('boost_exposure', 'enhance_contrast');
  } else if (avgLuma > 200) {
    exposureScore = Math.max(0, (255 - avgLuma) * 1.5);
    issues.push('Superexposta / estourada');
    fixes.push('Recuperar highlights');
  }
  if (darkRatio > 0.4) {
    exposureScore -= 20;
    issues.push(`${Math.round(darkRatio * 100)}% dos pixels muito escuros`);
  }
  if (brightRatio > 0.25) {
    exposureScore -= 10;
  }
  exposureScore = Math.max(0, Math.min(100, exposureScore));

  const centerX = Math.floor(width * 0.25);
  const centerY = Math.floor(height * 0.25);
  const sampleW = Math.max(4, Math.floor(width * 0.5));
  const sampleH = Math.max(4, Math.floor(height * 0.5));

  let laplacianSum = 0;
  let laplacianCount = 0;

  for (let y = centerY + 1; y < centerY + sampleH - 1; y += 2) {
    for (let x = centerX + 1; x < centerX + sampleW - 1; x += 2) {
      const idx = (y * width + x) * 4;
      const up = ((y - 1) * width + x) * 4;
      const down = ((y + 1) * width + x) * 4;
      const left = (y * width + (x - 1)) * 4;
      const right = (y * width + (x + 1)) * 4;

      const luma = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const lumaUp = (data[up] + data[up + 1] + data[up + 2]) / 3;
      const lumaDown = (data[down] + data[down + 1] + data[down + 2]) / 3;
      const lumaLeft = (data[left] + data[left + 1] + data[left + 2]) / 3;
      const lumaRight = (data[right] + data[right + 1] + data[right + 2]) / 3;

      const lap = Math.abs(4 * luma - lumaUp - lumaDown - lumaLeft - lumaRight);
      laplacianSum += lap;
      laplacianCount++;
    }
  }

  const sharpnessVar = laplacianCount > 0 ? laplacianSum / laplacianCount : 0;
  let sharpnessScore = Math.min(100, (sharpnessVar / 25) * 100);

  if (sharpnessScore < 30) {
    issues.push('Imagem desfocada / tremida');
    fixes.push('Sharpen agressivo + deconvolution');
    rescueActions.push('sharpen');
    if (sharpnessScore < 15) {
      issues.push('Blur severo - considere rejeitar');
    }
  }
  sharpnessScore = Math.max(0, sharpnessScore);

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  const sampleStep = 4;
  let sampleCount = 0;

  for (let i = 0; i < data.length; i += 4 * sampleStep) {
    sumR += data[i];
    sumG += data[i + 1];
    sumB += data[i + 2];
    sampleCount++;
  }

  const avgR = sumR / Math.max(1, sampleCount);
  const avgG = sumG / Math.max(1, sampleCount);
  const avgB = sumB / Math.max(1, sampleCount);
  const avgAll = Math.max(1, (avgR + avgG + avgB) / 3);

  const maxDev = Math.max(
    Math.abs(avgR - avgAll),
    Math.abs(avgG - avgAll),
    Math.abs(avgB - avgAll)
  );
  const colorCastRatio = maxDev / avgAll;

  let colorScore = Math.max(0, 100 - colorCastRatio * 300);

  if (colorCastRatio > 0.25) {
    const dominant = avgR > avgG && avgR > avgB
      ? 'vermelho/laranja (luz de palco?)'
      : avgG > avgR && avgG > avgB
        ? 'verde (fluorescente/LED?)'
        : 'azul/frio';
    issues.push(`Cast de cor forte: ${dominant}`);
    fixes.push('Auto white balance + color correction');
    rescueActions.push('color_correction');
  }

  let centerLuma = 0;
  let edgeLuma = 0;
  let centerCount = 0;
  let edgeCount = 0;

  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const isCenter = x > width * 0.2 && x < width * 0.8 && y > height * 0.2 && y < height * 0.8;
      const idx = (y * width + x) * 4;
      const luma = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      if (isCenter) {
        centerLuma += luma;
        centerCount++;
      } else {
        edgeLuma += luma;
        edgeCount++;
      }
    }
  }

  const centerAvg = centerLuma / Math.max(1, centerCount);
  const edgeAvg = edgeLuma / Math.max(1, edgeCount);
  const compositionScore = centerAvg > edgeAvg * 0.8 ? 75 : 50;

  if (compositionScore < 60) {
    rescueActions.push('auto_crop');
    fixes.push('Sugerido crop para enquadramento');
  }

  let noiseSum = 0;
  let noiseCount = 0;

  for (let i = 4; i < data.length - 4; i += 16) {
    const diff =
      Math.abs(data[i] - data[i - 4]) +
      Math.abs(data[i + 1] - data[i - 3]) +
      Math.abs(data[i + 2] - data[i - 2]);
    noiseSum += diff;
    noiseCount++;
  }

  const noiseLevel = noiseCount > 0 ? noiseSum / noiseCount : 0;
  if (noiseLevel > 20 && exposureScore < 50) {
    issues.push('Ruido digital alto (ISO elevado + subexposicao)');
    rescueActions.push('noise_reduction');
  }

  if (width < 800 || height < 800) {
    issues.push(`Resolucao baixa (${width}x${height})`);
    fixes.push('Upscale 2x para uso em plataformas');
    rescueActions.push('upscale_2x');
  }

  const overall = Math.round(
    exposureScore * 0.35 +
    sharpnessScore * 0.3 +
    colorScore * 0.25 +
    compositionScore * 0.1
  );

  let decision: TriageDecision;
  if (overall >= 75 && issues.length <= 1) decision = 'hero';
  else if (overall >= 50) decision = 'usable';
  else if (overall >= 25 && rescueActions.length > 0) decision = 'rescue';
  else decision = 'reject';

  return {
    overall,
    exposure: Math.round(exposureScore),
    sharpness: Math.round(sharpnessScore),
    composition: compositionScore,
    colorBalance: Math.round(colorScore),
    decision,
    issues,
    fixes,
    rescueActions: Array.from(new Set(rescueActions)),
  };
}
