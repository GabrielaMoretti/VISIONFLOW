/**
 * Image Analysis System
 * Extracts color science metrics from images for mood-driven adjustments
 * Uses Canvas API for client-side processing
 */

import { MoodAdjustment } from './moodMapping';

export interface ImageMetrics {
  temperature: number; // -50 to 50 (cold to warm)
  saturation: number; // 0 to 100
  contrast: number; // 0 to 100
  lightness: number; // 0 to 100
  sharpness: number; // 0 to 100
  dominantColors: string[];
  vignette: number; // 0 to 100 (amount detected)
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
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

export function extractDominantColors(imageData: ImageData, count: number = 5): string[] {
  const data = imageData.data;
  const pixels: [number, number, number][] = [];

  // Sample every Nth pixel for performance
  const step = Math.max(1, Math.floor(Math.sqrt(data.length / 4 / 500)));

  for (let i = 0; i < data.length; i += step * 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a > 128) {
      pixels.push([r, g, b]);
    }
  }

  if (pixels.length === 0) return [];

  // Simple k-means clustering
  const clusters: [number, number, number][][] = Array.from({ length: count }, () => []);
  let centroids = pixels.slice(0, count);

  for (let iter = 0; iter < 5; iter++) {
    // Reset clusters
    clusters.forEach(c => {
      c.length = 0;
    });

    // Assign pixels to nearest centroid
    pixels.forEach(pixel => {
      let minDist = Infinity;
      let nearestCluster = 0;

      centroids.forEach((centroid, i) => {
        const dist =
          Math.pow(pixel[0] - centroid[0], 2) +
          Math.pow(pixel[1] - centroid[1], 2) +
          Math.pow(pixel[2] - centroid[2], 2);

        if (dist < minDist) {
          minDist = dist;
          nearestCluster = i;
        }
      });

      clusters[nearestCluster].push(pixel);
    });

    // Recalculate centroids
    centroids = clusters.map(cluster => {
      if (cluster.length === 0) {
        return [Math.random() * 255, Math.random() * 255, Math.random() * 255] as [number, number, number];
      }

      const avg = [0, 0, 0];
      cluster.forEach(pixel => {
        avg[0] += pixel[0];
        avg[1] += pixel[1];
        avg[2] += pixel[2];
      });

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
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // Sample corners
  const corners = [
    { x: 0, y: 0 }, // top-left
    { x: width - 1, y: 0 }, // top-right
    { x: 0, y: height - 1 }, // bottom-left
    { x: width - 1, y: height - 1 }, // bottom-right
  ];

  let cornerBrightness = 0;
  corners.forEach(({ x, y }) => {
    const idx = (y * width + x) * 4;
    const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    cornerBrightness += brightness;
  });
  cornerBrightness /= corners.length;

  // Sample center
  let centerBrightness = 0;
  const samplePoints = [
    { x: Math.floor(width * 0.5), y: Math.floor(height * 0.5) },
    { x: Math.floor(width * 0.3), y: Math.floor(height * 0.3) },
    { x: Math.floor(width * 0.7), y: Math.floor(height * 0.3) },
    { x: Math.floor(width * 0.3), y: Math.floor(height * 0.7) },
    { x: Math.floor(width * 0.7), y: Math.floor(height * 0.7) },
  ];

  samplePoints.forEach(({ x, y }) => {
    const idx = (y * width + x) * 4;
    const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    centerBrightness += brightness;
  });
  centerBrightness /= samplePoints.length;

  const diff = Math.max(0, centerBrightness - cornerBrightness);
  return Math.min(100, (diff / 255) * 100 * 1.5);
}

export function estimateSharpness(imageData: ImageData): number {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  let edgeSum = 0;
  let sampleCount = 0;

  // Sample random pixels to estimate sharpness via edge detection
  for (let i = 0; i < Math.min(500, width * height); i++) {
    const idx = Math.floor(Math.random() * (width * height));
    const x = idx % width;
    const y = Math.floor(idx / width);

    if (x < width - 1 && y < height - 1) {
      const pixelIdx = (y * width + x) * 4;
      const rightIdx = (y * width + x + 1) * 4;
      const downIdx = ((y + 1) * width + x) * 4;

      const brightness = (data[pixelIdx] + data[pixelIdx + 1] + data[pixelIdx + 2]) / 3;
      const rightBrightness = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
      const downBrightness = (data[downIdx] + data[downIdx + 1] + data[downIdx + 2]) / 3;

      const edgeX = Math.abs(brightness - rightBrightness);
      const edgeY = Math.abs(brightness - downBrightness);

      edgeSum += edgeX + edgeY;
      sampleCount++;
    }
  }

  const averageEdge = edgeSum / (sampleCount * 2);
  return Math.min(100, (averageEdge / 255) * 100 * 1.2);
}

export function analyzeReferenceImage(canvas: HTMLCanvasElement, image: HTMLImageElement): ImageMetrics {
  const ctx = canvas.getContext('2d')!;
  canvas.width = image.width;
  canvas.height = image.height;

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Extract colors and analyze
  const colors: [number, number, number][] = [];
  const hslValues: [number, number, number][] = [];

  const step = Math.max(1, Math.floor(Math.sqrt(data.length / 4 / 500)));

  for (let i = 0; i < data.length; i += step * 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a > 128) {
      colors.push([r, g, b]);
      hslValues.push(rgbToHsl(r, g, b));
    }
  }

  // Calculate metrics
  const avgH = hslValues.reduce((sum, [h]) => sum + h, 0) / hslValues.length;
  const avgS = hslValues.reduce((sum, [, s]) => sum + s, 0) / hslValues.length;
  const avgL = hslValues.reduce((sum, [, , l]) => sum + l, 0) / hslValues.length;

  // Temperature: red/orange is warm (positive), blue is cold (negative)
  const warmHues = [0, 30, 350, 360]; // red-orange
  const coldHues = [180, 240]; // blue-cyan
  let temperature = 0;

  if (warmHues.some(h => Math.abs(avgH - h) < 30)) {
    temperature = 30;
  } else if (coldHues.some(h => Math.abs(avgH - h) < 30)) {
    temperature = -30;
  }

  // Contrast: measure variation in lightness
  const variance = hslValues.reduce((sum, [, , l]) => sum + Math.pow(l - avgL, 2), 0) / hslValues.length;
  const contrast = Math.min(100, Math.sqrt(variance) * 2);

  // Vignette detection
  const vignette = detectVignette(imageData);

  const metrics: ImageMetrics = {
    temperature,
    saturation: Math.min(100, avgS),
    contrast,
    lightness: Math.min(100, avgL),
    sharpness: estimateSharpness(imageData),
    dominantColors: extractDominantColors(imageData, 5),
    vignette,
  };

  return metrics;
}

export function combineAdjustments(
  textAdjustments: MoodAdjustment,
  imageMetrics: ImageMetrics,
  textWeight: number = 50
): MoodAdjustment {
  const imageWeight = 100 - textWeight;

  // Convert image metrics to adjustments
  const imageAdjustments: MoodAdjustment = {
    hslHue: imageMetrics.temperature,
    hslSaturation: (imageMetrics.saturation / 100) * 50 - 25,
    hslLightness: (imageMetrics.lightness / 100) * 20 - 10,
    vignetteAmount: imageMetrics.vignette,
    sharpenAmount: imageMetrics.sharpness,
    splitHighlightHue: (imageMetrics.contrast / 100) * 360,
    splitHighlightSat: imageMetrics.saturation,
  };

  // Blend adjustments
  const result: MoodAdjustment = {};

  const keys = new Set<keyof MoodAdjustment>();
  Object.keys(textAdjustments).forEach(k => keys.add(k as keyof MoodAdjustment));
  Object.keys(imageAdjustments).forEach(k => keys.add(k as keyof MoodAdjustment));

  keys.forEach(key => {
    const textVal = (textAdjustments[key] ?? 0) as number;
    const imageVal = (imageAdjustments[key] ?? 0) as number;
    result[key] = Math.round((textVal * textWeight + imageVal * imageWeight) / 100) as any;
  });

  return result;
}
