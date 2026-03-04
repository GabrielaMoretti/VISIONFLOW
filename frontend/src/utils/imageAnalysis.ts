/**
 * Image Analysis System
 * Extracts color science metrics from images for mood-driven adjustments
 * Uses Canvas API for client-side processing
 */

import { MoodAdjustment } from './moodMapping';

export interface ImageMetrics {
  temperature: number;      // -50 to 50 (cold to warm)
  saturation: number;       // 0 to 100
  contrast: number;         // 0 to 100
  lightness: number;        // 0 to 100
  sharpness: number;        // 0 to 100
  dominantColors: string[];
  vignette: number;         // 0 to 100 (amount detected)
}

// ---------------------------------------------------------------------------
// Conversões de cor
// ---------------------------------------------------------------------------

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
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

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

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

// ---------------------------------------------------------------------------
// Análise de imagem de referência
// ---------------------------------------------------------------------------

export function analyzeReferenceImage(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement
): ImageMetrics {
  const ctx = canvas.getContext('2d')!;
  canvas.width = image.width;
  canvas.height = image.height;

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const hslValues: [number, number, number][] = [];
  const step = Math.max(1, Math.floor(Math.sqrt(data.length / 4 / 500)));

  for (let i = 0; i < data.length; i += step * 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a > 128) {
      hslValues.push(rgbToHsl(r, g, b));
    }
  }

  if (hslValues.length === 0) {
    return {
      temperature: 0, saturation: 50, contrast: 50,
      lightness: 50, sharpness: 50, dominantColors: [], vignette: 0,
    };
  }

  const avgH = hslValues.reduce((sum, [h]) => sum + h, 0) / hslValues.length;
  const avgS = hslValues.reduce((sum, [, s]) => sum + s, 0) / hslValues.length;
  const avgL = hslValues.reduce((sum, [, , l]) => sum + l, 0) / hslValues.length;

  // Temperatura contínua: interpolação baseada no matiz médio
  // Quente (vermelho-laranja ~20°) = +50, Frio (azul ~220°) = -50
  const temperature = computeTemperatureFromHue(avgH, avgS);

  // Contraste: desvio padrão da luminosidade
  const variance = hslValues.reduce((sum, [, , l]) => sum + Math.pow(l - avgL, 2), 0) / hslValues.length;
  const contrast = Math.min(100, Math.sqrt(variance) * 2);

  return {
    temperature,
    saturation: Math.min(100, avgS),
    contrast,
    lightness: Math.min(100, avgL),
    sharpness: estimateSharpness(imageData),
    dominantColors: extractDominantColors(imageData, 5),
    vignette: detectVignette(imageData),
  };
}

/**
 * Calcula temperatura de cor de forma contínua a partir do matiz médio.
 * Elimina o comportamento binário (+30/-30) do código original.
 *
 * Modelo de referência (simplificado do Bradford):
 *   Matizes quentes: 0°–50° e 330°–360° (vermelho, laranja, amarelo)
 *   Matizes frios:   180°–260° (ciano, azul)
 *   Neutro:          resto
 */
function computeTemperatureFromHue(avgH: number, avgS: number): number {
  // Normaliza matiz para 0–360
  const h = ((avgH % 360) + 360) % 360;

  let raw: number;

  if (h <= 50) {
    // Vermelho-laranja: quente máximo próximo de 20°
    raw = 50 * Math.cos(((h - 20) / 50) * (Math.PI / 2));
  } else if (h <= 80) {
    // Amarelo: levemente quente
    raw = 15 * (1 - (h - 50) / 30);
  } else if (h <= 160) {
    // Verde: neutro
    raw = 0;
  } else if (h <= 200) {
    // Ciano: levemente frio
    raw = -10 * ((h - 160) / 40);
  } else if (h <= 260) {
    // Azul: frio máximo em ~220°
    raw = -50 * Math.cos(((h - 220) / 60) * (Math.PI / 2));
  } else if (h <= 300) {
    // Índigo/violeta: levemente frio
    raw = -20 * (1 - (h - 260) / 40);
  } else {
    // Magenta/vermelho: de volta ao quente
    raw = 20 * ((h - 300) / 60);
  }

  // Atenuação pela saturação: imagem dessaturada tem temperatura menos marcada
  const satFactor = Math.min(1, avgS / 40);
  return Math.round(raw * satFactor);
}

// ---------------------------------------------------------------------------
// Combine: texto domina, imagem apenas compensa
// ---------------------------------------------------------------------------

/**
 * Combina ajustes de mood textual com métricas da imagem de referência.
 *
 * Filosofia:
 *   - O texto expressa a INTENÇÃO do usuário → peso dominante (padrão 75%)
 *   - A imagem de referência informa COMPENSAÇÕES sutis → peso menor (25%)
 *   - A imagem não gera novos ajustes — apenas nuança os existentes
 *   - Vinheta não é somada: usa-se a maior entre mood e imagem detectada
 *
 * @param textAdjustments  — ajustes vindos de analyzeTextMood()
 * @param imageMetrics     — métricas vindas de analyzeReferenceImage()
 * @param textWeight       — peso do texto (0–100, padrão 75)
 */
export function combineAdjustments(
  textAdjustments: MoodAdjustment,
  imageMetrics: ImageMetrics,
  textWeight: number = 75
): MoodAdjustment {
  const tw = Math.max(0, Math.min(100, textWeight)) / 100;
  const iw = 1 - tw;

  // Compensações derivadas da imagem (escala conservadora)
  // Objetivo: adaptar o mood à imagem, não sobrescrever
  const imageCompensation: Partial<MoodAdjustment> = {
    hslSaturation: imageMetrics.saturation > 65
      ? Math.round(-6 * iw)   // imagem já saturada: recua um pouco
      : imageMetrics.saturation < 20
      ? Math.round(4 * iw)    // imagem dessaturada: empurra levemente
      : 0,
    hslLightness: imageMetrics.lightness > 72
      ? Math.round(-4 * iw)   // imagem clara: escurece um toque
      : imageMetrics.lightness < 28
      ? Math.round(4 * iw)    // imagem escura: abre um toque
      : 0,
    contrastDelta: imageMetrics.contrast < 25
      ? Math.round(5 * iw)    // imagem de baixo contraste: adiciona um pouco
      : imageMetrics.contrast > 80
      ? Math.round(-4 * iw)   // imagem de alto contraste: recua um pouco
      : 0,
    temperatureDelta: Math.round(imageMetrics.temperature * 0.15 * iw),
  };

  // Monta resultado: texto é a base, compensação da imagem é aplicada em cima
  const result: MoodAdjustment = { ...textAdjustments };

  (Object.keys(imageCompensation) as (keyof MoodAdjustment)[]).forEach(key => {
    if (key === 'vignetteAmount') return; // tratado separado abaixo
    const comp = imageCompensation[key] as number | undefined;
    if (comp === undefined || comp === 0) return;
    const existing = (result[key] ?? 0) as number;
    result[key] = Math.round(existing + comp) as any;
  });

  // Vinheta: não soma — usa a maior entre a do mood e 40% da detectada na imagem
  const moodVig = textAdjustments.vignetteAmount ?? 0;
  const imageVigContrib = Math.round(imageMetrics.vignette * 0.4);
  result.vignetteAmount = Math.max(moodVig, imageVigContrib);

  return result;
}

// ---------------------------------------------------------------------------
// Utilitários de análise de imagem
// ---------------------------------------------------------------------------

export function extractDominantColors(imageData: ImageData, count: number = 5): string[] {
  const data = imageData.data;
  const pixels: [number, number, number][] = [];
  const step = Math.max(1, Math.floor(Math.sqrt(data.length / 4 / 500)));

  for (let i = 0; i < data.length; i += step * 4) {
    if (data[i + 3] > 128) {
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  if (pixels.length === 0) return [];

  // K-means simples
  const clusters: [number, number, number][][] = Array.from({ length: count }, () => []);
  let centroids: [number, number, number][] = pixels.slice(0, count);

  for (let iter = 0; iter < 5; iter++) {
    clusters.forEach(c => { c.length = 0; });

    pixels.forEach(pixel => {
      let minDist = Infinity;
      let nearestCluster = 0;
      centroids.forEach((centroid, i) => {
        const dist =
          Math.pow(pixel[0] - centroid[0], 2) +
          Math.pow(pixel[1] - centroid[1], 2) +
          Math.pow(pixel[2] - centroid[2], 2);
        if (dist < minDist) { minDist = dist; nearestCluster = i; }
      });
      clusters[nearestCluster].push(pixel);
    });

    centroids = clusters.map(cluster => {
      if (cluster.length === 0) {
        return [Math.random() * 255, Math.random() * 255, Math.random() * 255] as [number, number, number];
      }
      const avg = [0, 0, 0];
      cluster.forEach(pixel => { avg[0] += pixel[0]; avg[1] += pixel[1]; avg[2] += pixel[2]; });
      return [
        Math.round(avg[0] / cluster.length),
        Math.round(avg[1] / cluster.length),
        Math.round(avg[2] / cluster.length),
      ] as [number, number, number];
    });
  }

  return centroids.map(([r, g, b]) => `rgb(${r},${g},${b})`);
}

export function detectVignette(imageData: ImageData): number {
  const { width, height, data } = imageData;

  const corners = [
    { x: 0, y: 0 },
    { x: width - 1, y: 0 },
    { x: 0, y: height - 1 },
    { x: width - 1, y: height - 1 },
  ];

  let cornerBrightness = 0;
  corners.forEach(({ x, y }) => {
    const idx = (y * width + x) * 4;
    cornerBrightness += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
  });
  cornerBrightness /= corners.length;

  const samplePoints = [
    { x: Math.floor(width * 0.5), y: Math.floor(height * 0.5) },
    { x: Math.floor(width * 0.3), y: Math.floor(height * 0.3) },
    { x: Math.floor(width * 0.7), y: Math.floor(height * 0.3) },
    { x: Math.floor(width * 0.3), y: Math.floor(height * 0.7) },
    { x: Math.floor(width * 0.7), y: Math.floor(height * 0.7) },
  ];

  let centerBrightness = 0;
  samplePoints.forEach(({ x, y }) => {
    const idx = (y * width + x) * 4;
    centerBrightness += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
  });
  centerBrightness /= samplePoints.length;

  const diff = Math.max(0, centerBrightness - cornerBrightness);
  return Math.min(100, (diff / 255) * 100 * 1.5);
}

export function estimateSharpness(imageData: ImageData): number {
  const { width, height, data } = imageData;
  let edgeSum = 0;
  let sampleCount = 0;

  for (let i = 0; i < Math.min(500, width * height); i++) {
    const idx = Math.floor(Math.random() * (width * height));
    const x = idx % width;
    const y = Math.floor(idx / width);

    if (x < width - 1 && y < height - 1) {
      const pixelIdx = (y * width + x) * 4;
      const rightIdx = (y * width + x + 1) * 4;
      const downIdx  = ((y + 1) * width + x) * 4;

      const brightness      = (data[pixelIdx] + data[pixelIdx + 1] + data[pixelIdx + 2]) / 3;
      const rightBrightness = (data[rightIdx]  + data[rightIdx + 1]  + data[rightIdx + 2])  / 3;
      const downBrightness  = (data[downIdx]   + data[downIdx + 1]   + data[downIdx + 2])   / 3;

      edgeSum += Math.abs(brightness - rightBrightness) + Math.abs(brightness - downBrightness);
      sampleCount++;
    }
  }

  const averageEdge = edgeSum / (sampleCount * 2);
  return Math.min(100, (averageEdge / 255) * 100 * 1.2);
}
