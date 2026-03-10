import React, { useMemo } from 'react';
import type { CampaignCheckItem } from '../../lib/campaign/campaignPresets';

interface PlatformChecklistProps {
  items: CampaignCheckItem[];
  checked: Record<string, boolean>;
  onToggle: (itemId: string) => void;
}

export function PlatformChecklist({ items, checked, onToggle }: PlatformChecklistProps) {
  const total = items.length;
  const done = useMemo(() => items.filter((item) => checked[item.id]).length, [items, checked]);
  const requiredItems = useMemo(() => items.filter((item) => item.required), [items]);
  const requiredDone = useMemo(
    () => requiredItems.filter((item) => checked[item.id]).length,
    [requiredItems, checked]
  );
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <section style={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 10, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: '#e4e4e7', fontSize: 12, fontWeight: 700 }}>Checklist da campanha</span>
        <span style={{ color: '#a1a1aa', fontSize: 11 }}>{done}/{total}</span>
      </div>

      <div style={{ height: 8, borderRadius: 999, background: '#27272a', overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#22c55e' }} />
      </div>

      <div style={{ color: '#a1a1aa', fontSize: 11, marginBottom: 10 }}>
        Obrigatorios: {requiredDone}/{requiredItems.length}
      </div>

      <div style={{ display: 'grid', gap: 7, maxHeight: 280, overflowY: 'auto' }}>
        {items.map((item) => (
          <label
            key={item.id}
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              border: '1px solid #3f3f46',
              borderRadius: 8,
              padding: 8,
              background: checked[item.id] ? 'rgba(34,197,94,0.1)' : '#111827'
            }}
          >
            <input
              type="checkbox"
              checked={Boolean(checked[item.id])}
              onChange={() => onToggle(item.id)}
              style={{ marginTop: 2, accentColor: '#22c55e' }}
            />
            <div>
              <div style={{ color: '#f4f4f5', fontSize: 12 }}>{item.label}</div>
              <div style={{ color: '#9ca3af', fontSize: 10 }}>
                {item.required ? 'Obrigatorio' : 'Opcional'} • {item.category}
              </div>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
