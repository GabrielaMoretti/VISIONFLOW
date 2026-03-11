/**
 * VisionFlow — Creation Studio (Web Demo)
 *
 * Full-featured image editor running 100% in the browser.
 * Uses Canvas API for real-time mood-driven color grading.
 *
 * This file is web-only (.web.tsx) — Metro resolves it for Platform.OS === 'web'.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useEdgesState, useNodesState } from '@xyflow/react';
import {
  processImageData,
  loadImage,
  imageToCanvas,
  renderToCanvas,
  exportCanvas,
  quickAnalyze,
  matchMoods,
  MOOD_PRESETS,
  DEFAULT_PARAMS,
  type ProcessingParams,
  type QuickAnalysis,
  type MoodPreset,
} from '../processing/canvasProcessor';
import { analyzeTextMoodEnhanced, blendMoodAdjustments } from '../utils/moodMapping';
import {
  ColorFlowGraph,
  COLOR_FLOW_INITIAL_EDGES,
  COLOR_FLOW_INITIAL_NODES,
} from '../components/ColorFlowGraph/ColorFlowGraph';
import { TexturePanel } from '../components/TexturePanel/TexturePanel';
import { VirtualLensPanel } from '../components/VirtualLensPanel';
import { CampaignWizard } from '../components/Campaign/CampaignWizard';
import { SafeZoneOverlay } from '../components/Preview/SafeZoneOverlay';
import { HistogramDisplay } from '../components/HistogramDisplay';
import { InfoTooltip } from '../components/InfoTooltip';
import type { TextureLayer } from '../lib/textures/textureSystem';
import type { MoodAdjustment } from '../utils/moodMapping';
import { loadImageAsImageData, exportCanvasAsBlob } from '../lib/colorflow/imageLoader';
import { useColorFlowRenderer } from '../hooks/useColorFlowRenderer';
import { applyMoodToNodes } from '../lib/colorflow/moodToNodes';
import { getSpecById } from '../lib/campaign/platformSpecs';

// ─── Theme (inlined for zero-dep web component) ─────────────────────────────

const C = {
  bg: '#0A0A12', bgSurface: '#12121E', bgElevated: '#1A1A2E', bgCard: '#16162A',
  accent: '#E8943A', accentLight: '#F2B76E', accentMuted: 'rgba(232,148,58,0.15)',
  teal: '#38BDF8',
  textPrimary: '#F0EDE8', textSecondary: '#9A95A6', textMuted: '#5C5870',
  border: '#2A2A40', borderLight: '#3A3A55',
  success: '#4ADE80', error: '#F87171',
} as const;

const PREVIEW_MAX = 800;

const NODE_BADGE_COLORS: Record<string, string> = {
  imageInput: '#64748b',
  whiteBalance: '#38bdf8',
  curves: '#22c55e',
  splitToning: '#14b8a6',
  saturation: '#a855f7',
  vignette: '#71717a',
  sharpen: '#facc15',
  grain: '#a16207',
  vhs: '#eab308',
  lens: '#f97316',
  output: '#0d9488',
};

function applyMoodAdjustment(base: ProcessingParams, mood: MoodAdjustment): ProcessingParams {
  return {
    ...base,
    temperature: typeof mood.temperatureDelta === 'number' ? mood.temperatureDelta : base.temperature,
    saturation: typeof mood.hslSaturation === 'number' ? mood.hslSaturation : base.saturation,
    lightness: typeof mood.hslLightness === 'number' ? mood.hslLightness : base.lightness,
    contrast: typeof mood.contrastDelta === 'number' ? mood.contrastDelta : base.contrast,
    vignette: typeof mood.vignetteAmount === 'number' ? mood.vignetteAmount : base.vignette,
    hue: typeof mood.hslHueDelta === 'number' ? mood.hslHueDelta : base.hue,
    sharpen: typeof mood.sharpenAmount === 'number' ? mood.sharpenAmount : base.sharpen,
    splitHighlightHue: mood.splitHighlightHue,
    splitHighlightSat: mood.splitHighlightSat,
    splitShadowHue: mood.splitShadowHue,
    splitShadowSat: mood.splitShadowSat,
  };
}

function applyPanelParamsToNodes(nodes: any[], params: ProcessingParams): any[] {
  return nodes.map((node) => {
    const data = (node.data ?? {}) as { nodeType?: string; params?: Record<string, unknown> };
    const nextParams = { ...(data.params ?? {}) };
    switch (data.nodeType) {
      case 'whiteBalance':
        nextParams.temperature = params.temperature;
        break;
      case 'curves':
        nextParams.contrast = params.contrast;
        break;
      case 'splitToning':
        nextParams.highlightHue = params.splitHighlightHue ?? 40;
        nextParams.highlightSat = params.splitHighlightSat ?? 15;
        nextParams.shadowHue = params.splitShadowHue ?? 210;
        nextParams.shadowSat = params.splitShadowSat ?? 20;
        break;
      case 'saturation':
        nextParams.saturation = params.saturation;
        nextParams.hue = params.hue;
        nextParams.lightness = params.lightness;
        break;
      case 'vignette':
        nextParams.amount = params.vignette;
        break;
      case 'sharpen':
        nextParams.amount = params.sharpen;
        break;
      default:
        break;
    }
    return { ...node, data: { ...data, params: nextParams } };
  });
}

function processingParamsToMoodAdjustment(params: ProcessingParams): MoodAdjustment {
  return {
    temperatureDelta: params.temperature,
    hslSaturation: params.saturation,
    hslLightness: params.lightness,
    contrastDelta: params.contrast,
    vignetteAmount: params.vignette,
    hslHueDelta: params.hue,
    sharpenAmount: params.sharpen,
    splitHighlightHue: params.splitHighlightHue,
    splitHighlightSat: params.splitHighlightSat,
    splitShadowHue: params.splitShadowHue,
    splitShadowSat: params.splitShadowSat,
  };
}

// ─── Slider sub-component ───────────────────────────────────────────────────

function Slider({ label, value, min, max, onChange, unit = '', tooltipKey }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; unit?: string; tooltipKey?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{ color: C.textSecondary, fontSize: 12, width: 90, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>{label}</span>
        {tooltipKey ? <InfoTooltip tooltipKey={tooltipKey} /> : null}
      </span>
      <input type="range" min={min} max={max} value={value} step={1}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: C.accent, height: 4, cursor: 'pointer' }} />
      <span style={{ color: C.textPrimary, fontSize: 12, width: 44, textAlign: 'right', fontFamily: 'monospace' }}>
        {value > 0 ? `+${value}` : `${value}`}{unit}
      </span>
    </div>
  );
}

// ─── Mood Card sub-component ────────────────────────────────────────────────

function MoodCard({ preset, active, onClick }: {
  preset: MoodPreset; active: boolean; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
        background: active ? C.accentMuted : C.bgCard,
        border: `1px solid ${active ? C.accent : C.border}`,
        borderLeft: `3px solid ${preset.accent}`,
        transition: 'all 0.15s ease',
        minWidth: 100,
      }}
    >
      <div style={{ color: C.textPrimary, fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
        {preset.name}
      </div>
      <div style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>{preset.category}</div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function CreationStudioScreen() {
  // State
  const [params, setParams] = useState<ProcessingParams>({ ...DEFAULT_PARAMS });
  const [moodText, setMoodText] = useState('');
  const [activeMoods, setActiveMoods] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [analysis, setAnalysis] = useState<QuickAnalysis | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [fileName, setFileName] = useState('');
  const [imgDims, setImgDims] = useState({ w: 0, h: 0 });
  const [intensity, setIntensity] = useState(65);
  const [sliderPos, setSliderPos] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [modelTag, setModelTag] = useState<'semantic-ai' | 'keyword-fallback' | 'keyword'>('keyword');
  const [activeTab, setActiveTab] = useState<'editor' | 'flow' | 'textures' | 'campaign'>('editor');
  const [lastTexture, setLastTexture] = useState<TextureLayer | null>(null);
  const [textureStack, setTextureStack] = useState<TextureLayer[]>([]);
  const [isFlowDrawerOpen, setIsFlowDrawerOpen] = useState(true);
  const [isFlowDrawerExpanded, setIsFlowDrawerExpanded] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [statusBadge, setStatusBadge] = useState<'ORIGINAL' | 'PROCESSADO' | null>(null);
  const [showMoodSuggestions, setShowMoodSuggestions] = useState(false);
  const [activePlatformId, setActivePlatformId] = useState<string | null>(null);
  const [lastMoodAdjustment, setLastMoodAdjustment] = useState<MoodAdjustment | null>(null);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [processedImageData, setProcessedImageData] = useState<ImageData | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    COLOR_FLOW_INITIAL_NODES.map((n) => ({
      ...n,
      data: { ...n.data, params: { ...(n.data?.params ?? {}) } },
    }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState([...COLOR_FLOW_INITIAL_EDGES]);

  // Refs
  const origImgRef = useRef<HTMLImageElement | null>(null);
  const origDataRef = useRef<ImageData | null>(null);
  const origCanvasRef = useRef<HTMLCanvasElement>(null);
  const procCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moodInputRef = useRef<HTMLInputElement>(null);
  const moodSuggestionsRef = useRef<HTMLDivElement>(null);

  const filteredMoodSuggestions = useMemo(() => {
    const q = moodText.trim().toLowerCase();
    const base = q
      ? MOOD_PRESETS.filter((preset) =>
          preset.name.toLowerCase().includes(q) || preset.keywords.some((k) => k.toLowerCase().includes(q))
        )
      : MOOD_PRESETS;
    return base.slice(0, 12);
  }, [moodText]);

  const groupedMoodSuggestions = useMemo(() => {
    const groups = new Map<string, MoodPreset[]>();
    filteredMoodSuggestions.forEach((preset) => {
      const bucket = preset.category || 'outros';
      const current = groups.get(bucket) ?? [];
      current.push(preset);
      groups.set(bucket, current);
    });
    return Array.from(groups.entries());
  }, [filteredMoodSuggestions]);

  const { renderState, forceRender } = useColorFlowRenderer({
    canvasRef: procCanvasRef,
    originalImageData,
    nodes,
    edges,
    textureLayers: textureStack,
    debounceMs: 120,
  });

  // ─── Render base/original layer ───────────────────────────────────────────

  const drawOriginal = useCallback((data: ImageData) => {
    if (origCanvasRef.current) renderToCanvas(origCanvasRef.current, data);
  }, []);

  useEffect(() => {
    if (!origDataRef.current || !hasImage) return;
    drawOriginal(origDataRef.current);
  }, [hasImage, drawOriginal]);

  useEffect(() => {
    if (!procCanvasRef.current || !hasImage) return;
    const ctx = procCanvasRef.current.getContext('2d');
    if (!ctx) return;
    try {
      const captured = ctx.getImageData(0, 0, procCanvasRef.current.width, procCanvasRef.current.height);
      setProcessedImageData(captured);
    } catch {
      // Keep previous histogram if canvas is not ready yet.
    }
  }, [renderState.lastRenderTime, hasImage]);

  // ─── Before/After drag ────────────────────────────────────────────────────

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      setSliderPos(Math.max(0.02, Math.min(0.98, (e.clientX - rect.left) / rect.width)));
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [isDragging]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'o') {
        setShowOriginal(true);
      }
      if (e.key === 'Escape') {
        setShowMoodSuggestions(false);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'o') {
        setShowOriginal(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    setStatusBadge(showOriginal ? 'ORIGINAL' : 'PROCESSADO');
    const t = setTimeout(() => setStatusBadge(null), 1000);
    return () => clearTimeout(t);
  }, [showOriginal]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (moodInputRef.current?.contains(target) || moodSuggestionsRef.current?.contains(target)) return;
      setShowMoodSuggestions(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // ─── File handling ────────────────────────────────────────────────────────

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const img = await loadImage(file);
      const fullRes = await loadImageAsImageData(file);
      origImgRef.current = img;
      setFileName(file.name);
      setOriginalImageData(fullRes);

      const { imageData } = imageToCanvas(img, PREVIEW_MAX);
      origDataRef.current = imageData;
      setImgDims({ w: imageData.width, h: imageData.height });
      setAnalysis(quickAnalyze(imageData));
      setHasImage(true);
      setSliderPos(0.5);
    } catch (err) {
      console.error('Image load error:', err);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  // ─── Mood handlers ───────────────────────────────────────────────────────

  const handleAnalyzeMood = useCallback(() => {
    if (!moodText.trim()) return;
    void (async () => {
      if (useAI) {
        const enhanced = await analyzeTextMoodEnhanced(moodText, intensity / 100, true);
        if ('modelUsed' in enhanced) {
          setModelTag(enhanced.modelUsed);
          setActiveMoods([enhanced.topAnchor]);
          setConfidence(Math.round(enhanced.similarity * 100));
          setLastMoodAdjustment(enhanced.adjustments);
          setParams((prev) => applyMoodAdjustment(prev, enhanced.adjustments));
          setNodes((prev: any[]) => applyMoodToNodes(prev, enhanced.adjustments));
          return;
        }
      }
      const result = matchMoods(moodText, intensity / 100);
      setModelTag('keyword');
      setActiveMoods(result.moods);
      setConfidence(result.confidence);
      setLastMoodAdjustment(processingParamsToMoodAdjustment(result.params));
      setParams(result.params);
      setNodes((prev: any[]) => applyPanelParamsToNodes(prev, result.params));
    })();
  }, [moodText, intensity, useAI, setNodes]);

  const handleMoodPreset = useCallback((name: string) => {
    const preset = MOOD_PRESETS.find(p => p.name === name);
    if (!preset) return;
    setActiveMoods([name]);
    setConfidence(100);
    setMoodText(name);
    // Scale params by intensity
    const scaled = { ...preset.params };
    const absKeys = new Set(['splitHighlightHue', 'splitShadowHue']);
    const factor = intensity / 100;
    for (const key of Object.keys(scaled) as (keyof ProcessingParams)[]) {
      if (absKeys.has(key)) continue;
      const v = scaled[key];
      if (typeof v === 'number') (scaled as any)[key] = Math.round(v * factor);
    }
    setLastMoodAdjustment(processingParamsToMoodAdjustment(scaled));
    setParams(scaled);
    setNodes((prev: any[]) => applyPanelParamsToNodes(prev, scaled));
  }, [intensity, setNodes]);

  const handleReset = useCallback(() => {
    setParams({ ...DEFAULT_PARAMS });
    setActiveMoods([]); setConfidence(0); setMoodText('');
    setNodes(
      COLOR_FLOW_INITIAL_NODES.map((n) => ({
        ...n,
        data: { ...n.data, params: { ...(n.data?.params ?? {}) } },
      }))
    );
    setEdges([...COLOR_FLOW_INITIAL_EDGES]);
  }, [setNodes, setEdges]);

  const handleExport = useCallback(async (format: 'png' | 'jpeg') => {
    await forceRender();
    if (!procCanvasRef.current) return;
    const blob = await exportCanvasAsBlob(
      procCanvasRef.current,
      format === 'png' ? 'image/png' : 'image/jpeg',
      0.95
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = format === 'png' ? 'visionflow_export.png' : 'visionflow_export.jpg';
    a.click();
    URL.revokeObjectURL(url);
  }, [forceRender]);

  const handleParamChange = useCallback((key: keyof ProcessingParams, value: number) => {
    setParams((prev) => {
      const next = { ...prev, [key]: value };
      setNodes((nodesPrev: any[]) => applyPanelParamsToNodes(nodesPrev, next));
      return next;
    });
  }, [setNodes]);

  const handleTextureStackChange = useCallback((layers: TextureLayer[]) => {
    setTextureStack(layers);
    setLastTexture(layers.length ? layers[layers.length - 1] : null);

    const lastFilmGrain = [...layers].reverse().find((l) => l.category === 'film_grain');
    const lastHalation = [...layers].reverse().find((l) => l.category === 'halation');
    const lastVhs = [...layers].reverse().find((l) => l.category === 'vhs');

    const grainAmount = lastFilmGrain ? Number(lastFilmGrain.params.amount ?? 15) : 0;
    const grainRoughness = lastFilmGrain ? Number(lastFilmGrain.params.roughness ?? 0.5) : 0.5;

    const halationIntensity = lastHalation ? Number(lastHalation.params.intensity ?? 20) : 0;

    const vhsDistortion = lastVhs ? Number(lastVhs.params.distortion ?? 0.3) : 0;
    const vhsChromaBleed = lastVhs ? Number(lastVhs.params.chromaBleed ?? 0.4) : 0;
    const vhsScanLines = lastVhs ? Number(lastVhs.params.scanLines ?? 0.5) : 0;

    setParams((prev) => ({
      ...prev,
      sharpen: lastFilmGrain ? Math.min(40, Math.round(grainAmount * 0.5)) : DEFAULT_PARAMS.sharpen,
      lightness: lastHalation ? Math.min(15, Math.round(halationIntensity / 12)) : DEFAULT_PARAMS.lightness,
    }));

    setNodes((prev: any[]) => prev.map((n) => {
      const d = n.data ?? {};
      if (d.nodeType === 'grain') {
        return {
          ...n,
          data: {
            ...d,
            params: {
              ...(d.params ?? {}),
              amount: grainAmount,
              roughness: grainRoughness,
            },
          },
        };
      }
      if (d.nodeType === 'vhs') {
        return {
          ...n,
          data: {
            ...d,
            params: {
              ...(d.params ?? {}),
              distortion: vhsDistortion,
              chromaBleed: vhsChromaBleed,
              scanLines: vhsScanLines,
            },
          },
        };
      }
      return n;
    }));
  }, [setNodes]);

  const handleApplyTexture = useCallback((layer: TextureLayer) => {
    setLastTexture(layer);
  }, []);

  const handleAddLensToFlow = useCallback((payload: {
    profileId: string;
    aperture: number;
    distortionEnabled: boolean;
    chromaticAberrationEnabled: boolean;
    vignetteEnabled: boolean;
  }) => {
    const lensNodeId = `lens-${Date.now()}`;
    const outputNode = nodes.find((n) => (n.data as any)?.nodeType === 'output');
    const sourceNode = outputNode
      ? nodes.find((n) => n.id !== outputNode.id && edges.some((e) => e.target === outputNode.id && e.source === n.id))
      : undefined;

    setNodes((prev) => [
      ...prev,
      {
        id: lensNodeId,
        type: 'colorNode',
        position: {
          x: (sourceNode?.position?.x ?? 800) + 160,
          y: sourceNode?.position?.y ?? 150,
        },
        data: {
          nodeType: 'lens',
          label: 'Lens',
          params: {
            profileId: payload.profileId,
            aperture: payload.aperture,
            distortionEnabled: payload.distortionEnabled,
            chromaticAberrationEnabled: payload.chromaticAberrationEnabled,
            vignetteEnabled: payload.vignetteEnabled,
          },
        },
      },
    ]);

    if (outputNode && sourceNode) {
      setEdges((prev) => {
        const withoutOld = prev.filter((e) => !(e.source === sourceNode.id && e.target === outputNode.id));
        return [
          ...withoutOld,
          { id: `e-${sourceNode.id}-${lensNodeId}`, source: sourceNode.id, target: lensNodeId },
          { id: `e-${lensNodeId}-${outputNode.id}`, source: lensNodeId, target: outputNode.id },
        ];
      });
    }
  }, [nodes, edges, setNodes, setEdges]);

  const handleLensPresetColorGrading = useCallback((adjustment: MoodAdjustment) => {
    const blended = lastMoodAdjustment
      ? blendMoodAdjustments(lastMoodAdjustment, adjustment, 0.4)
      : adjustment;
    setNodes((prev) => applyMoodToNodes(prev, blended));
    setParams((prev) => applyMoodAdjustment(prev, blended));
  }, [setNodes, lastMoodAdjustment]);

  const handleCampaignApplyLook = useCallback((adjustment: MoodAdjustment) => {
    setLastMoodAdjustment(adjustment);
    setNodes((prev) => applyMoodToNodes(prev, adjustment));
    setParams((prev) => applyMoodAdjustment(prev, adjustment));
    setActiveTab('editor');
  }, [setNodes]);

  // ─── Render ───────────────────────────────────────────────────────────────

  const aspectRatio = imgDims.w && imgDims.h ? imgDims.w / imgDims.h : 16 / 10;

  return (
    <div style={S.root}>
      {/* ─── Header ─── */}
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ color: C.accent, fontSize: 18, fontWeight: 800, letterSpacing: 2 }}>VISIONFLOW</span>
          <span style={{ color: C.textSecondary, fontSize: 13, fontWeight: 400 }}>STUDIO</span>
        </div>
        {fileName && <span style={{ color: C.textMuted, fontSize: 12 }}>{fileName}</span>}
        {activeMoods.length > 0 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {activeMoods.map(m => (
              <span key={m} style={{
                background: C.accentMuted, color: C.accent, fontSize: 11,
                padding: '3px 10px', borderRadius: 12, fontWeight: 600, textTransform: 'capitalize',
              }}>{m}</span>
            ))}
            <span style={{ color: C.textMuted, fontSize: 11 }}>{confidence}% match</span>
            <span style={{ color: C.teal, fontSize: 11 }}>
              {modelTag === 'semantic-ai' ? 'semantic-ai' : modelTag === 'keyword-fallback' ? 'fallback' : 'keyword'}
            </span>
          </div>
        )}
      </header>

      {/* ─── Main Layout ─── */}
      <div style={S.main}>

        {/* ─── LEFT: Image Panel ─── */}
        <div style={S.leftPanel}>
          {!hasImage ? (
            /* Upload Zone */
            <div
              style={{
                ...S.uploadZone,
                borderColor: isDragOver ? C.accent : C.border,
                background: isDragOver ? C.accentMuted : C.bgSurface,
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>📷</div>
              <div style={{ color: C.textPrimary, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                Arraste uma imagem aqui
              </div>
              <div style={{ color: C.textSecondary, fontSize: 13 }}>
                ou clique para selecionar • PNG, JPG, WebP
              </div>
            </div>
          ) : (
            /* Before/After Canvas */
            <div
              ref={containerRef}
              style={{
                ...S.canvasContainer,
                aspectRatio: `${aspectRatio}`,
              }}
            >
              {/* Original (bottom layer) */}
              <canvas ref={origCanvasRef} width={imgDims.w} height={imgDims.h} style={S.canvasBase} />

              {/* Processed (top layer, clipped) */}
              <canvas ref={procCanvasRef} width={imgDims.w} height={imgDims.h}
                style={{
                  ...S.canvasBase, ...S.canvasOverlay,
                  clipPath: showOriginal ? 'inset(0 100% 0 0)' : `inset(0 ${Math.round((1 - sliderPos) * 100)}% 0 0)`,
                  opacity: showOriginal ? 0 : 1,
                  transition: 'opacity 0.3s ease',
                }} />

              {/* Divider */}
              {!showOriginal && <div
                style={{
                  position: 'absolute', top: 0, bottom: 0, width: 2,
                  left: `${sliderPos * 100}%`, transform: 'translateX(-1px)',
                  background: C.accent, cursor: 'ew-resize', zIndex: 10,
                }}
                onMouseDown={() => setIsDragging(true)}
              >
                {/* Handle */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 32, height: 32, borderRadius: 16,
                  background: C.accent, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  pointerEvents: 'none',
                }}>
                  <span style={{ color: C.bg, fontSize: 14, fontWeight: 800 }}>⟨⟩</span>
                </div>
              </div>}

              <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 12, display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setActivePlatformId(null)}
                  style={{ ...S.platformToggleBtn, ...(activePlatformId === null ? S.platformToggleBtnActive : {}) }}
                >
                  Off
                </button>
                <button
                  onClick={() => setActivePlatformId('ig-post-portrait')}
                  style={{ ...S.platformToggleBtn, ...(activePlatformId === 'ig-post-portrait' ? S.platformToggleBtnActive : {}) }}
                >
                  IG Post
                </button>
                <button
                  onClick={() => setActivePlatformId('ig-story')}
                  style={{ ...S.platformToggleBtn, ...(activePlatformId === 'ig-story' ? S.platformToggleBtnActive : {}) }}
                >
                  IG Story
                </button>
                <button
                  onClick={() => setActivePlatformId('yt-thumbnail')}
                  style={{ ...S.platformToggleBtn, ...(activePlatformId === 'yt-thumbnail' ? S.platformToggleBtnActive : {}) }}
                >
                  YT
                </button>
                <button
                  onClick={() => setActivePlatformId('spotify-canvas')}
                  style={{ ...S.platformToggleBtn, ...(activePlatformId === 'spotify-canvas' ? S.platformToggleBtnActive : {}) }}
                >
                  Spotify
                </button>
                <button
                  onClick={() => setShowOriginal(false)}
                  style={{ ...S.modeToggleBtn, ...(showOriginal ? {} : S.modeToggleBtnActive) }}
                >
                  Editado
                </button>
                <button
                  onClick={() => setShowOriginal(true)}
                  style={{ ...S.modeToggleBtn, ...(showOriginal ? S.modeToggleBtnActive : {}) }}
                >
                  Original
                </button>
              </div>

              {/* Labels */}
              <div style={{ ...S.canvasLabel, left: 12 }}>ORIGINAL</div>
              <div style={{ ...S.canvasLabel, right: 12 }}>EDITADA</div>
              {statusBadge && (
                <div style={{ ...S.renderBadge, ...(statusBadge === 'ORIGINAL' ? S.renderBadgeOriginal : S.renderBadgeProcessed) }}>
                  {statusBadge}
                </div>
              )}
              {activePlatformId !== null && (() => {
                const spec = getSpecById(activePlatformId);
                if (!spec) return null;
                return (
                  <SafeZoneOverlay
                    spec={spec}
                    containerWidth={imgDims.w || 1}
                    containerHeight={imgDims.h || 1}
                  />
                );
              })()}
            </div>
          )}

          {/* Analysis Bar */}
          {analysis && hasImage && (
            <div style={S.analysisBar}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {analysis.dominantColors.map((c, i) => (
                  <div key={i} style={{
                    width: 20, height: 20, borderRadius: 4, background: c,
                    border: `1px solid ${C.borderLight}`,
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={S.metricChip}>🌡️ {analysis.temperature > 0 ? '+' : ''}{analysis.temperature}°</span>
                <span style={S.metricChip}>🎨 {analysis.saturation}%</span>
                <span style={S.metricChip}>☀️ {analysis.lightness}%</span>
                <span style={S.metricChip}>◐ {analysis.contrast}%</span>
              </div>
            </div>
          )}

          {hasImage && (
            <div style={S.histogramWrap}>
              <div style={S.histogramLabel}>HISTOGRAMA</div>
              <HistogramDisplay imageData={showOriginal ? originalImageData : (processedImageData ?? originalImageData)} height={64} />
            </div>
          )}

          {hasImage && (
            <div style={S.pipelineStatusBar}>
              <div style={S.pipelineNodesRow}>
                {renderState.nodesExecuted.map((nodeType, idx) => (
                  <React.Fragment key={`${nodeType}-${idx}`}>
                    <span
                      style={{
                        ...S.pipelineNodeBadge,
                        borderColor: NODE_BADGE_COLORS[nodeType] ?? C.border,
                        color: NODE_BADGE_COLORS[nodeType] ?? C.textSecondary,
                        opacity: renderState.isRendering ? 0.88 : 1,
                      }}
                    >
                      ■ {nodeType}
                    </span>
                    {idx < renderState.nodesExecuted.length - 1 && <span style={S.pipelineArrow}>→</span>}
                  </React.Fragment>
                ))}
              </div>
              {renderState.lastRenderTime !== null && (
                <span
                  style={{
                    ...S.pipelineTime,
                    color: renderState.lastRenderTime < 100 ? '#4ADE80' : renderState.lastRenderTime < 500 ? '#FBBF24' : C.error,
                  }}
                >
                  ⚡ {renderState.lastRenderTime.toFixed(0)}ms
                </span>
              )}
              {renderState.error && <span style={{ color: C.error }}>⚠ pipeline error: {renderState.error}</span>}
              <button
                onClick={() => {
                  void handleExport('jpeg');
                }}
                style={S.pipelineExportBtn}
              >
                Exportar
              </button>
            </div>
          )}

          {/* New image button */}
          {hasImage && (
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <button onClick={() => fileInputRef.current?.click()} style={S.linkBtn}>
                Trocar imagem
              </button>
            </div>
          )}
        </div>

        {/* ─── RIGHT: Controls Panel ─── */}
        <div style={S.rightPanel}>
          <div style={S.scrollArea}>

            <div style={S.topTabs}>
              <button
                style={{ ...S.topTabBtn, ...(activeTab === 'editor' ? S.topTabBtnActive : {}) }}
                onClick={() => setActiveTab('editor')}
              >
                Editor
              </button>
              <button
                style={{ ...S.topTabBtn, ...(activeTab === 'flow' ? S.topTabBtnActive : {}) }}
                onClick={() => setActiveTab('flow')}
              >
                Color Flow
              </button>
              <button
                style={{ ...S.topTabBtn, ...(activeTab === 'textures' ? S.topTabBtnActive : {}) }}
                onClick={() => setActiveTab('textures')}
              >
                Texturas
              </button>
              <button
                style={{ ...S.topTabBtn, ...(activeTab === 'campaign' ? S.topTabBtnActive : {}) }}
                onClick={() => setActiveTab('campaign')}
              >
                Campaign
              </button>
            </div>

            {activeTab === 'campaign' && (
              <section style={S.section}>
                <h3 style={S.sectionTitle}>CAMPAIGN ENGINE</h3>
                <CampaignWizard onApplyLook={handleCampaignApplyLook} />
              </section>
            )}

            {activeTab === 'flow' && (
              <section style={S.section}>
                <h3 style={S.sectionTitle}>LENS + FLOW (PAINEL GUIA)</h3>
                <div style={{ marginBottom: 12 }}>
                  <VirtualLensPanel
                    onAddToColorFlow={handleAddLensToFlow}
                    onApplyColorGrading={handleLensPresetColorGrading}
                  />
                </div>
                <div style={S.flowHelpBox}>
                  <div>💡 Dica para leigos:</div>
                  <div>Comece com um preset de lente, depois ajuste só 1 ou 2 nós (Saturation e Vignette).</div>
                  <div>Para conectar nós: arraste do ponto roxo (saída) para o ponto cinza (entrada).</div>
                </div>
              </section>
            )}

            {activeTab === 'textures' && (
              <section style={S.section}>
                <h3 style={S.sectionTitle}>SISTEMA DE TEXTURAS</h3>
                <TexturePanel onApply={handleApplyTexture} onStackChange={handleTextureStackChange} />
                {lastTexture && (
                  <div style={{ marginTop: 10, color: C.textMuted, fontSize: 11 }}>
                    Última textura: {lastTexture.name} ({lastTexture.opacity}%)
                  </div>
                )}
                {!lastTexture && textureStack.length === 0 && (
                  <div style={{ marginTop: 10, color: C.textMuted, fontSize: 11 }}>
                    Sem texturas ativas no pipeline.
                  </div>
                )}
              </section>
            )}

            {activeTab === 'editor' && (
              <>

            {/* ─── Mood System ─── */}
            <section style={S.section}>
              <h3 style={S.sectionTitle}>MOOD SYSTEM</h3>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ color: C.textSecondary, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    style={{ accentColor: C.accent }}
                  />
                  Semantic AI (Transformers.js)
                </label>
              </div>

              {/* Text input */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, position: 'relative' }}>
                <input
                  ref={moodInputRef}
                  type="text"
                  value={moodText}
                  onChange={e => setMoodText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      setShowMoodSuggestions(false);
                      handleAnalyzeMood();
                    }
                    if (e.key === 'Escape') {
                      setShowMoodSuggestions(false);
                    }
                  }}
                  onFocus={() => setShowMoodSuggestions(true)}
                  placeholder="Ex: cinematic melancholic sunset"
                  style={S.textInput}
                />
                <button onClick={handleAnalyzeMood} style={S.accentBtn}>Analisar</button>
                {showMoodSuggestions && groupedMoodSuggestions.length > 0 && (
                  <div ref={moodSuggestionsRef} style={S.moodSuggestionsDropdown}>
                    {groupedMoodSuggestions.map(([category, presets]) => (
                      <div key={category} style={{ marginBottom: 8 }}>
                        <div style={S.moodSuggestionsCategory}>{category}</div>
                        {presets.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => {
                              setMoodText(preset.name);
                              setShowMoodSuggestions(false);
                              handleMoodPreset(preset.name);
                            }}
                            style={S.moodSuggestionBtn}
                          >
                            <span style={{ ...S.moodSuggestionDot, background: preset.accent }} />
                            <span style={{ flex: 1, textAlign: 'left' }}>{preset.name}</span>
                            <span style={S.moodSuggestionKeywords}>{preset.keywords.slice(0, 2).join(', ')}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Preset grid */}
              <div style={S.moodGrid}>
                {MOOD_PRESETS.map(preset => (
                  <MoodCard
                    key={preset.name}
                    preset={preset}
                    active={activeMoods.includes(preset.name)}
                    onClick={() => handleMoodPreset(preset.name)}
                  />
                ))}
              </div>
            </section>

            {/* ─── Adjustments ─── */}
            <section style={S.section}>
              <h3 style={S.sectionTitle}>AJUSTES</h3>
              <Slider label="Temperatura" value={params.temperature} min={-50} max={50}
                onChange={v => handleParamChange('temperature', v)} unit="°" tooltipKey="temperature" />
              <Slider label="Saturação" value={params.saturation} min={-80} max={25}
                onChange={v => handleParamChange('saturation', v)} tooltipKey="saturation" />
              <Slider label="Contraste" value={params.contrast} min={-20} max={20}
                onChange={v => handleParamChange('contrast', v)} tooltipKey="contrast" />
              <Slider label="Luminosidade" value={params.lightness} min={-15} max={15}
                onChange={v => handleParamChange('lightness', v)} tooltipKey="lightness" />
              <Slider label="Vinheta" value={params.vignette} min={0} max={40}
                onChange={v => handleParamChange('vignette', v)} tooltipKey="vignette" />
              <Slider label="Matiz" value={params.hue} min={-30} max={30}
                onChange={v => handleParamChange('hue', v)} unit="°" tooltipKey="hue" />
            </section>

            {/* ─── Intensity ─── */}
            <section style={S.section}>
              <h3 style={S.sectionTitle}>INTENSIDADE GLOBAL</h3>
              <Slider label="" value={intensity} min={0} max={100}
                onChange={setIntensity} unit="%" />
              <div style={{ color: C.textMuted, fontSize: 11, marginTop: -4 }}>
                {intensity <= 50 ? 'Sutil / editorial' : intensity <= 75 ? 'Balanceado' : 'Dramático / music video'}
              </div>
            </section>

            {/* ─── Export ─── */}
            <section style={S.section}>
              <h3 style={S.sectionTitle}>EXPORTAR</h3>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={S.exportBtn} onClick={() => handleExport('png')} disabled={!hasImage}>
                  📥 PNG
                </button>
                <button style={S.exportBtn} onClick={() => handleExport('jpeg')} disabled={!hasImage}>
                  📥 JPG
                </button>
                <button style={S.resetBtn} onClick={handleReset}>
                  ↩ Reset
                </button>
              </div>
            </section>
              </>
            )}
          </div>
        </div>
      </div>

      {activeTab === 'flow' && (
        <div
          style={{
            ...S.flowDrawer,
            height: isFlowDrawerOpen ? (isFlowDrawerExpanded ? 420 : 270) : 46,
          }}
        >
          <div style={S.flowDrawerHeader}>
            <div style={{ color: C.textSecondary, fontSize: 12, fontWeight: 600 }}>
              Color Flow Graph {isFlowDrawerOpen ? '(ativo)' : '(minimizado)'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={S.flowDrawerBtn} onClick={() => setIsFlowDrawerExpanded((v) => !v)}>
                {isFlowDrawerExpanded ? 'Compactar' : 'Expandir'}
              </button>
              <button style={S.flowDrawerBtn} onClick={() => setIsFlowDrawerOpen((v) => !v)}>
                {isFlowDrawerOpen ? 'Minimizar' : 'Abrir'}
              </button>
            </div>
          </div>
          {isFlowDrawerOpen && (
            <div style={S.flowDrawerContent}>
              <ColorFlowGraph
                nodes={nodes}
                edges={edges}
                setNodes={setNodes}
                setEdges={setEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
              />
            </div>
          )}
        </div>
      )}

      {/* ─── Hidden file input ─── */}
      <input ref={fileInputRef} type="file" accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.length) handleFile(e.target.files[0]); e.target.value = ''; }} />
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex', flexDirection: 'column',
    height: '100vh', background: C.bg, color: C.textPrimary,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 20,
    padding: '12px 24px',
    background: C.bgSurface,
    borderBottom: `1px solid ${C.border}`,
    flexShrink: 0,
  },
  main: {
    display: 'flex', flex: 1, overflow: 'hidden',
  },

  // Left panel
  leftPanel: {
    flex: 2, display: 'flex', flexDirection: 'column',
    padding: 20, gap: 12,
    minWidth: 0,
  },
  uploadZone: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    border: `2px dashed ${C.border}`, borderRadius: 16,
    cursor: 'pointer', transition: 'all 0.2s ease',
    minHeight: 300,
  },
  canvasContainer: {
    position: 'relative' as const, flex: 1,
    background: '#000', borderRadius: 12, overflow: 'hidden',
    maxHeight: 'calc(100vh - 200px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    userSelect: 'none' as const,
  },
  canvasBase: {
    width: '100%', height: '100%',
    objectFit: 'contain' as const,
    display: 'block',
  },
  canvasOverlay: {
    position: 'absolute' as const, top: 0, left: 0,
  },
  canvasLabel: {
    position: 'absolute' as const, top: 10,
    background: 'rgba(0,0,0,0.6)',
    color: C.textSecondary, fontSize: 10, fontWeight: 700,
    padding: '3px 8px', borderRadius: 4,
    letterSpacing: 1, zIndex: 5,
    userSelect: 'none' as const,
  },
  modeToggleBtn: {
    border: `1px solid ${C.border}`,
    background: 'rgba(10,10,18,0.7)',
    color: C.textSecondary,
    borderRadius: 6,
    fontSize: 11,
    padding: '4px 8px',
    cursor: 'pointer',
  },
  platformToggleBtn: {
    border: `1px solid ${C.border}`,
    background: 'rgba(10,10,18,0.7)',
    color: C.textSecondary,
    borderRadius: 6,
    fontSize: 10,
    padding: '4px 7px',
    cursor: 'pointer',
  },
  platformToggleBtnActive: {
    border: '1px solid rgba(239,68,68,0.8)',
    background: 'rgba(127,29,29,0.5)',
    color: '#fecaca',
  },
  modeToggleBtnActive: {
    border: `1px solid ${C.accent}`,
    background: C.accentMuted,
    color: C.accent,
  },
  renderBadge: {
    position: 'absolute' as const,
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 12,
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 999,
    padding: '4px 10px',
    letterSpacing: 0.8,
    zIndex: 12,
  },
  renderBadgeOriginal: {
    color: '#fecaca',
    background: 'rgba(127,29,29,0.75)',
    border: '1px solid rgba(239,68,68,0.7)',
  },
  renderBadgeProcessed: {
    color: '#bbf7d0',
    background: 'rgba(20,83,45,0.75)',
    border: '1px solid rgba(34,197,94,0.7)',
  },

  // Analysis bar
  analysisBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: C.bgSurface, borderRadius: 10, padding: '10px 16px',
    border: `1px solid ${C.border}`,
  },
  histogramWrap: {
    background: C.bgSurface,
    borderRadius: 10,
    padding: '8px 10px',
    border: `1px solid ${C.border}`,
  },
  histogramLabel: {
    color: C.textMuted,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricChip: {
    color: C.textSecondary, fontSize: 12,
  },
  pipelineStatusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap' as const,
    background: C.bgSurface,
    borderRadius: 10,
    border: `1px solid ${C.border}`,
    padding: '8px 10px',
  },
  pipelineNodesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap' as const,
    flex: 1,
    minWidth: 0,
  },
  pipelineNodeBadge: {
    border: '1px solid',
    borderRadius: 6,
    padding: '2px 6px',
    fontSize: 11,
    fontFamily: 'monospace',
    background: 'rgba(9,9,11,0.75)',
  },
  pipelineArrow: {
    color: C.textMuted,
    fontSize: 11,
  },
  pipelineTime: {
    fontSize: 12,
    fontWeight: 700,
    minWidth: 70,
  },
  pipelineExportBtn: {
    border: `1px solid ${C.border}`,
    background: C.bgElevated,
    color: C.textSecondary,
    borderRadius: 6,
    fontSize: 11,
    padding: '5px 10px',
    cursor: 'pointer',
  },

  // Right panel
  rightPanel: {
    flex: 1, minWidth: 320, maxWidth: 400,
    borderLeft: `1px solid ${C.border}`,
    background: C.bgSurface,
    display: 'flex', flexDirection: 'column',
  },
  scrollArea: {
    flex: 1, overflowY: 'auto' as const,
    padding: 20,
  },
  topTabs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: 8,
    marginBottom: 16,
  },
  topTabBtn: {
    border: `1px solid ${C.border}`,
    background: C.bgElevated,
    color: C.textSecondary,
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  topTabBtnActive: {
    background: C.accentMuted,
    color: C.accent,
    border: `1px solid ${C.accent}`,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: C.textMuted, fontSize: 11, fontWeight: 700,
    letterSpacing: 2, marginBottom: 12, marginTop: 0,
  },

  // Mood grid
  moodGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: 8,
  },

  // Inputs
  textInput: {
    flex: 1, padding: '8px 12px', borderRadius: 8,
    background: C.bgElevated, color: C.textPrimary,
    border: `1px solid ${C.border}`, fontSize: 13,
    outline: 'none',
  },
  moodSuggestionsDropdown: {
    position: 'absolute' as const,
    left: 0,
    right: 84,
    top: 40,
    zIndex: 100,
    maxHeight: 260,
    overflowY: 'auto' as const,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    background: '#18181b',
    padding: 8,
    boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
  },
  moodSuggestionsCategory: {
    color: C.textMuted,
    fontSize: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  moodSuggestionBtn: {
    width: '100%',
    border: `1px solid ${C.border}`,
    background: '#27272a',
    color: '#e4e4e7',
    borderRadius: 6,
    padding: '6px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    fontSize: 12,
  },
  moodSuggestionDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    display: 'inline-block',
    flexShrink: 0,
  },
  moodSuggestionKeywords: {
    color: C.textMuted,
    fontSize: 10,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 110,
  },
  accentBtn: {
    padding: '8px 16px', borderRadius: 8,
    background: C.accent, color: C.bg,
    border: 'none', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap' as const,
  },

  // Export buttons
  exportBtn: {
    flex: 1, padding: '10px 0', borderRadius: 8,
    background: C.accent, color: C.bg,
    border: 'none', fontSize: 13, fontWeight: 700,
    cursor: 'pointer',
  },
  resetBtn: {
    flex: 1, padding: '10px 0', borderRadius: 8,
    background: C.bgElevated, color: C.textSecondary,
    border: `1px solid ${C.border}`, fontSize: 13,
    cursor: 'pointer',
  },
  linkBtn: {
    background: 'none', border: 'none',
    color: C.textMuted, fontSize: 12,
    cursor: 'pointer', textDecoration: 'underline',
  },
  flowHelpBox: {
    background: 'rgba(39,39,42,0.45)',
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: 10,
    color: C.textSecondary,
    fontSize: 11,
    lineHeight: 1.45,
  },
  flowDrawer: {
    position: 'absolute' as const,
    left: 12,
    right: 12,
    bottom: 12,
    background: '#09090b',
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    overflow: 'hidden',
    zIndex: 40,
    transition: 'height 0.2s ease',
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
  },
  flowDrawerHeader: {
    height: 46,
    borderBottom: `1px solid ${C.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    background: '#12121E',
  },
  flowDrawerBtn: {
    border: `1px solid ${C.border}`,
    background: C.bgElevated,
    color: C.textSecondary,
    borderRadius: 6,
    fontSize: 11,
    padding: '5px 8px',
    cursor: 'pointer',
  },
  flowDrawerContent: {
    height: 'calc(100% - 46px)',
    padding: 8,
  },
};
