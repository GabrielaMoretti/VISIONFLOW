import { useCallback, useEffect, useRef, useState } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { executePipeline } from '../lib/colorflow/pipelineEngine';

interface UseColorFlowRendererOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  originalImageData: ImageData | null;
  nodes: Node[];
  edges: Edge[];
  debounceMs?: number;
}

interface RenderState {
  isRendering: boolean;
  lastRenderTime: number | null;
  nodesExecuted: string[];
  error: string | null;
}

function downscaleImageData(input: ImageData, scale: number): ImageData {
  const outW = Math.max(1, Math.round(input.width * scale));
  const outH = Math.max(1, Math.round(input.height * scale));

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = input.width;
  srcCanvas.height = input.height;
  srcCanvas.getContext('2d')!.putImageData(input, 0, 0);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext('2d')!;
  outCtx.drawImage(srcCanvas, 0, 0, outW, outH);

  return outCtx.getImageData(0, 0, outW, outH);
}

export function useColorFlowRenderer({
  canvasRef,
  originalImageData,
  nodes,
  edges,
  debounceMs = 120,
}: UseColorFlowRendererOptions) {
  const [renderState, setRenderState] = useState<RenderState>({
    isRendering: false,
    lastRenderTime: null,
    nodesExecuted: [],
    error: null,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);

  const renderToCanvas = useCallback(
    async (previewMode = false) => {
      if (!canvasRef.current || !originalImageData || runningRef.current) return;

      runningRef.current = true;
      setRenderState((s) => ({ ...s, isRendering: true, error: null }));

      try {
        const source = previewMode ? downscaleImageData(originalImageData, 0.25) : originalImageData;
        const result = await executePipeline(source, nodes, edges);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');

        if (previewMode) {
          const tmp = document.createElement('canvas');
          tmp.width = result.imageData.width;
          tmp.height = result.imageData.height;
          tmp.getContext('2d')!.putImageData(result.imageData, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
        } else {
          canvas.width = result.imageData.width;
          canvas.height = result.imageData.height;
          ctx.putImageData(result.imageData, 0, 0);
        }

        setRenderState({
          isRendering: false,
          lastRenderTime: result.executionTime,
          nodesExecuted: result.nodesExecuted,
          error: null,
        });
      } catch (err) {
        setRenderState((s) => ({
          ...s,
          isRendering: false,
          error: err instanceof Error ? err.message : 'Pipeline error',
        }));
      } finally {
        runningRef.current = false;
      }
    },
    [canvasRef, originalImageData, nodes, edges]
  );

  useEffect(() => {
    if (!originalImageData) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      void renderToCanvas(true).then(() => {
        setTimeout(() => {
          void renderToCanvas(false);
        }, 300);
      });
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [nodes, edges, originalImageData, debounceMs, renderToCanvas]);

  return {
    renderState,
    forceRender: () => renderToCanvas(false),
  };
}
