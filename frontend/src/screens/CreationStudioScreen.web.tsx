/**
 * VisionFlow — Creation Studio (Web Demo)
 *
 * Full-featured image editor running 100% in the browser.
 * Uses Canvas API for real-time mood-driven color grading.
 *
 * This file is web-only (.web.tsx) — Metro resolves it for Platform.OS === 'web'.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
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

// ─── Slider sub-component ───────────────────────────────────────────────────

function Slider({ label, value, min, max, onChange, unit = '' }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{ color: C.textSecondary, fontSize: 12, width: 90, flexShrink: 0 }}>{label}</span>
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

  // Refs
  const origImgRef = useRef<HTMLImageElement | null>(null);
  const origDataRef = useRef<ImageData | null>(null);
  const origCanvasRef = useRef<HTMLCanvasElement>(null);
  const procCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Process image when params change ─────────────────────────────────────

  const processAndRender = useCallback((data: ImageData, p: ProcessingParams) => {
    if (origCanvasRef.current) renderToCanvas(origCanvasRef.current, data);
    if (procCanvasRef.current) {
      const processed = processImageData(data, p);
      renderToCanvas(procCanvasRef.current, processed);
    }
  }, []);

  useEffect(() => {
    if (!origDataRef.current || !hasImage) return;
    processAndRender(origDataRef.current, params);
  }, [params, hasImage, processAndRender]);

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

  // ─── File handling ────────────────────────────────────────────────────────

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const img = await loadImage(file);
      origImgRef.current = img;
      setFileName(file.name);
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
    const result = matchMoods(moodText, intensity / 100);
    setActiveMoods(result.moods);
    setConfidence(result.confidence);
    setParams(result.params);
  }, [moodText, intensity]);

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
    setParams(scaled);
  }, [intensity]);

  const handleReset = useCallback(() => {
    setParams({ ...DEFAULT_PARAMS });
    setActiveMoods([]); setConfidence(0); setMoodText('');
  }, []);

  const handleExport = useCallback((format: 'png' | 'jpeg') => {
    if (!origImgRef.current) return;
    const { canvas, imageData } = imageToCanvas(origImgRef.current, 0);
    const processed = processImageData(imageData, params);
    renderToCanvas(canvas, processed);
    exportCanvas(canvas, format);
  }, [params]);

  const handleParamChange = useCallback((key: keyof ProcessingParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

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
                  clipPath: `inset(0 ${Math.round((1 - sliderPos) * 100)}% 0 0)`,
                }} />

              {/* Divider */}
              <div
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
              </div>

              {/* Labels */}
              <div style={{ ...S.canvasLabel, left: 12 }}>ORIGINAL</div>
              <div style={{ ...S.canvasLabel, right: 12 }}>EDITADA</div>
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

            {/* ─── Mood System ─── */}
            <section style={S.section}>
              <h3 style={S.sectionTitle}>MOOD SYSTEM</h3>

              {/* Text input */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input
                  type="text"
                  value={moodText}
                  onChange={e => setMoodText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAnalyzeMood()}
                  placeholder="Ex: cinematic melancholic sunset"
                  style={S.textInput}
                />
                <button onClick={handleAnalyzeMood} style={S.accentBtn}>Analisar</button>
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
                onChange={v => handleParamChange('temperature', v)} unit="°" />
              <Slider label="Saturação" value={params.saturation} min={-80} max={25}
                onChange={v => handleParamChange('saturation', v)} />
              <Slider label="Contraste" value={params.contrast} min={-20} max={20}
                onChange={v => handleParamChange('contrast', v)} />
              <Slider label="Luminosidade" value={params.lightness} min={-15} max={15}
                onChange={v => handleParamChange('lightness', v)} />
              <Slider label="Vinheta" value={params.vignette} min={0} max={40}
                onChange={v => handleParamChange('vignette', v)} />
              <Slider label="Matiz" value={params.hue} min={-30} max={30}
                onChange={v => handleParamChange('hue', v)} unit="°" />
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
          </div>
        </div>
      </div>

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

  // Analysis bar
  analysisBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: C.bgSurface, borderRadius: 10, padding: '10px 16px',
    border: `1px solid ${C.border}`,
  },
  metricChip: {
    color: C.textSecondary, fontSize: 12,
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
};
