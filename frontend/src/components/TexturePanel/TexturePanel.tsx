import React, { useMemo, useState } from 'react';
import type { TextureBlendMode, TextureLayer } from '../../lib/textures/textureSystem';

const BLEND_MODES: TextureBlendMode[] = ['overlay', 'screen', 'multiply', 'soft-light', 'hard-light', 'color-dodge'];

const TEXTURE_PRESETS: TextureLayer[] = [
  {
    id: 'preset-35mm',
    category: 'film_grain',
    name: '35mm Kodak',
    blendMode: 'overlay',
    opacity: 40,
    params: { amount: 25, size: 1.2, roughness: 0.4 },
  },
  {
    id: 'preset-8mm',
    category: 'film_grain',
    name: '8mm Super 8',
    blendMode: 'overlay',
    opacity: 55,
    params: { amount: 45, size: 2.2, roughness: 0.7 },
  },
  {
    id: 'preset-halation',
    category: 'halation',
    name: 'Analog Halation',
    blendMode: 'screen',
    opacity: 30,
    params: { intensity: 45, radius: 35, hue: 20, threshold: 180 },
  },
  {
    id: 'preset-vhs',
    category: 'vhs',
    name: 'VHS Tape',
    blendMode: 'overlay',
    opacity: 50,
    params: { distortion: 0.3, chromaBleed: 0.4, scanLines: 0.5 },
  },
];

interface TexturePanelProps {
  onApply: (layer: TextureLayer) => void;
}

export function TexturePanel({ onApply }: TexturePanelProps) {
  const [activeLayers, setActiveLayers] = useState<TextureLayer[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<TextureLayer | null>(null);

  const canAdd = useMemo(() => !!selectedPreset, [selectedPreset]);

  const addLayer = () => {
    if (!selectedPreset) return;
    const layer = { ...selectedPreset, id: `layer-${Date.now()}` };
    setActiveLayers((prev) => [...prev, layer]);
    onApply(layer);
  };

  return (
    <div style={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12, padding: 14 }}>
      <h3 style={{ color: '#fafafa', fontWeight: 600, margin: '0 0 10px 0', fontSize: 14 }}>🎞️ Texturas Cinematográficas</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {TEXTURE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setSelectedPreset({ ...preset })}
            style={{
              borderRadius: 8,
              border: `1px solid ${selectedPreset?.id === preset.id ? '#8b5cf6' : '#3f3f46'}`,
              background: selectedPreset?.id === preset.id ? '#6d28d9' : '#27272a',
              color: '#e4e4e7',
              textAlign: 'left',
              padding: 8,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600 }}>{preset.name}</div>
            <div style={{ fontSize: 10, color: '#a1a1aa' }}>{preset.category}</div>
          </button>
        ))}
      </div>

      {selectedPreset && (
        <div style={{ border: '1px solid #3f3f46', borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ color: '#a1a1aa', fontSize: 12, marginBottom: 8 }}>Ajustar: {selectedPreset.name}</div>

          <label style={{ color: '#a1a1aa', fontSize: 12 }}>Opacidade: {selectedPreset.opacity}%</label>
          <input
            type="range"
            min={0}
            max={100}
            value={selectedPreset.opacity}
            onChange={(e) => setSelectedPreset({ ...selectedPreset, opacity: Number(e.target.value) })}
            style={{ width: '100%', margin: '4px 0 10px 0', accentColor: '#8b5cf6' }}
          />

          <label style={{ color: '#a1a1aa', fontSize: 12 }}>Blend Mode</label>
          <select
            value={selectedPreset.blendMode}
            onChange={(e) => setSelectedPreset({ ...selectedPreset, blendMode: e.target.value as TextureBlendMode })}
            style={{ width: '100%', marginTop: 4, background: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46', borderRadius: 6, padding: 6 }}
          >
            {BLEND_MODES.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>

          <button
            onClick={addLayer}
            disabled={!canAdd}
            style={{
              width: '100%', marginTop: 10, border: 'none', borderRadius: 8,
              background: canAdd ? '#6d28d9' : '#3f3f46', color: '#ffffff',
              padding: '8px 10px', fontSize: 12, cursor: canAdd ? 'pointer' : 'default',
            }}
          >
            + Adicionar ao Stack
          </button>
        </div>
      )}

      {activeLayers.length > 0 && (
        <div>
          <div style={{ color: '#71717a', fontSize: 12, marginBottom: 6 }}>Stack ativo ({activeLayers.length})</div>
          {activeLayers.map((layer) => (
            <div key={layer.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#27272a', borderRadius: 6, padding: '6px 8px', marginBottom: 6 }}>
              <span style={{ color: '#e4e4e7', fontSize: 12, flex: 1 }}>{layer.name}</span>
              <span style={{ color: '#a1a1aa', fontSize: 11 }}>{layer.opacity}%</span>
              <button
                onClick={() => setActiveLayers((prev) => prev.filter((l) => l.id !== layer.id))}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
