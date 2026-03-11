import React from 'react';
import type { PlatformSpec } from '../../lib/campaign/platformSpecs';

interface SafeZoneOverlayProps {
  spec: PlatformSpec;
  containerWidth: number;
  containerHeight: number;
}

export function SafeZoneOverlay({ spec, containerWidth, containerHeight }: SafeZoneOverlayProps) {
  const top = (spec.safeZone.top / 100) * containerHeight;
  const right = (spec.safeZone.right / 100) * containerWidth;
  const bottom = (spec.safeZone.bottom / 100) * containerHeight;
  const left = (spec.safeZone.left / 100) * containerWidth;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 11,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top,
          left,
          right,
          bottom,
          border: '2px dashed rgba(239,68,68,0.9)',
          borderRadius: 6,
          boxShadow: '0 0 0 9999px rgba(127,29,29,0.2)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          background: 'rgba(127,29,29,0.8)',
          color: '#fecaca',
          fontSize: 10,
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 999,
          letterSpacing: 0.5,
        }}
      >
        SAFE ZONE: {spec.name}
      </div>
    </div>
  );
}
