import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { ColorFlowNodeData } from './types';

const BG: Record<string, string> = {
  imageInput: '#1e3a8a',
  whiteBalance: '#92400e',
  curves: '#14532d',
  splitToning: '#581c87',
  saturation: '#134e4a',
  vignette: '#3f3f46',
  grain: '#44403c',
  sharpen: '#164e63',
  lut: '#9a3412',
  blend: '#831843',
  mask: '#7f1d1d',
  texture: '#312e81',
  lens: '#0f766e',
  output: '#065f46',
};

const ICON: Record<string, string> = {
  imageInput: '🖼️', whiteBalance: '🌡️', curves: '〰️', splitToning: '🎨',
  saturation: '🌈', vignette: '⚫', grain: '🎞️', sharpen: '🔪',
  lut: '📦', blend: '🔀', mask: '🎭', texture: '🧵', output: '✅',
  lens: '🔭',
};

export const ColorNode = memo(({ data }: { data: any }) => {
  const d = data as ColorFlowNodeData;
  return (
    <div
      style={{
        border: '2px solid #52525b',
        background: BG[d.nodeType] ?? '#27272a',
        borderRadius: 10,
        minWidth: 130,
        padding: '8px 10px',
        color: '#f4f4f5',
        boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
      }}
    >
      {d.nodeType !== 'imageInput' && (
        <Handle type="target" position={Position.Left} style={{ width: 8, height: 8, background: '#a1a1aa' }} />
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 16 }}>{ICON[d.nodeType] ?? '◆'}</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{d.label}</div>
          <div style={{ fontSize: 10, color: '#d4d4d8' }}>{d.nodeType}</div>
        </div>
      </div>
      {d.nodeType !== 'output' && (
        <Handle type="source" position={Position.Right} style={{ width: 8, height: 8, background: '#a78bfa' }} />
      )}
    </div>
  );
});
