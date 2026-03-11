import React, { useMemo, useState } from 'react';
import { TOOLTIPS } from '../lib/ui/tooltips';

interface InfoTooltipProps {
  tooltipKey: string;
  side?: 'top' | 'right';
}

export function InfoTooltip({ tooltipKey, side = 'top' }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const def = useMemo(() => TOOLTIPS[tooltipKey], [tooltipKey]);
  if (!def) return null;

  return (
    <>
      <span
        onMouseEnter={(e) => {
          setPosition({
            x: e.clientX + (side === 'right' ? 14 : 0),
            y: e.clientY + 12,
          });
          setVisible(true);
        }}
        onMouseLeave={() => setVisible(false)}
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          border: '1px solid #5C5870',
          color: '#5C5870',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          cursor: 'help',
          flexShrink: 0,
        }}
      >
        ?
      </span>
      {visible && (
        <div
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 9999,
            background: '#1A1A2E',
            border: '1px solid #3A3A55',
            borderRadius: 8,
            padding: '8px 12px',
            maxWidth: 220,
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
          }}
        >
          <p style={{ color: '#F0EDE8', fontSize: 12, fontWeight: 600, margin: '0 0 4px' }}>{def.short}</p>
          <p style={{ color: '#9A95A6', fontSize: 11, margin: 0, lineHeight: 1.5 }}>{def.learnMore}</p>
        </div>
      )}
    </>
  );
}
