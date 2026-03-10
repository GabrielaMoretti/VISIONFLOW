import React from 'react';
import type { ColorFlowNodeData } from './types';

interface NodeInspectorProps {
  node: any;
  onUpdate: (params: Record<string, number | string | boolean | null>) => void;
  onClose: () => void;
}

const PARAM_CONFIG: Record<string, { label: string; min: number; max: number; step: number }> = {
  temperature: { label: 'Temperatura', min: -50, max: 50, step: 1 },
  tint: { label: 'Tint', min: -50, max: 50, step: 1 },
  masterGamma: { label: 'Gamma', min: 0.2, max: 2.5, step: 0.01 },
  redGain: { label: 'Red', min: 0.5, max: 1.5, step: 0.01 },
  greenGain: { label: 'Green', min: 0.5, max: 1.5, step: 0.01 },
  blueGain: { label: 'Blue', min: 0.5, max: 1.5, step: 0.01 },
  highlightHue: { label: 'Highlight Hue', min: 0, max: 360, step: 1 },
  highlightSat: { label: 'Highlight Sat', min: 0, max: 50, step: 1 },
  shadowHue: { label: 'Shadow Hue', min: 0, max: 360, step: 1 },
  shadowSat: { label: 'Shadow Sat', min: 0, max: 50, step: 1 },
  balance: { label: 'Balance', min: -100, max: 100, step: 1 },
  saturation: { label: 'Saturation', min: -100, max: 100, step: 1 },
  vibrance: { label: 'Vibrance', min: -50, max: 50, step: 1 },
  amount: { label: 'Amount', min: 0, max: 100, step: 1 },
  feather: { label: 'Feather', min: 0, max: 1, step: 0.01 },
  size: { label: 'Size', min: 0.5, max: 3, step: 0.1 },
  roughness: { label: 'Roughness', min: 0, max: 1, step: 0.01 },
  intensity: { label: 'Intensity', min: 0, max: 100, step: 1 },
  radius: { label: 'Radius', min: 1, max: 80, step: 1 },
};

export function NodeInspector({ node, onUpdate, onClose }: NodeInspectorProps) {
  const data = node.data as unknown as ColorFlowNodeData;
  const params = data?.params ?? {};

  return (
    <div style={{ width: 280, background: '#09090b', borderLeft: '1px solid #3f3f46', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #3f3f46' }}>
        <span style={{ color: '#fafafa', fontSize: 13, fontWeight: 600 }}>✦ {data?.label ?? data?.nodeType}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {Object.entries(params).map(([key, value]) => {
          const cfg = PARAM_CONFIG[key];
          if (!cfg || typeof value !== 'number') return null;
          return (
            <div key={key} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#a1a1aa', fontSize: 12 }}>{cfg.label}</span>
                <span style={{ color: '#71717a', fontSize: 12, fontFamily: 'monospace' }}>{value.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={cfg.min}
                max={cfg.max}
                step={cfg.step}
                value={value}
                onChange={(e) => onUpdate({ ...params, [key]: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#8b5cf6' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
