import React, { useEffect, useRef } from 'react';
import { useHistogram } from '../hooks/useHistogram';

interface HistogramDisplayProps {
  imageData: ImageData | null;
  width?: number;
  height?: number;
}

function drawChannel(
  ctx: CanvasRenderingContext2D,
  values: Uint32Array,
  color: string,
  width: number,
  height: number
): void {
  const max = Math.max(1, ...Array.from(values));
  ctx.fillStyle = color;
  for (let i = 0; i < 256; i++) {
    const x = (i / 255) * width;
    const barHeight = (values[i] / max) * (height - 1);
    ctx.fillRect(x, height - barHeight, Math.max(1, width / 256), barHeight);
  }
}

export function HistogramDisplay({ imageData, width = 200, height = 64 }: HistogramDisplayProps) {
  const { histogram } = useHistogram(imageData);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0A0A12';
    ctx.fillRect(0, 0, width, height);

    if (!histogram) {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
      return;
    }

    drawChannel(ctx, histogram.luma, 'rgba(255,255,255,0.35)', width, height);
    drawChannel(ctx, histogram.r, 'rgba(255,80,80,0.5)', width, height);
    drawChannel(ctx, histogram.g, 'rgba(80,255,120,0.5)', width, height);
    drawChannel(ctx, histogram.b, 'rgba(80,140,255,0.5)', width, height);

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
  }, [histogram, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: '100%', height, borderRadius: 4, display: 'block' }}
    />
  );
}
