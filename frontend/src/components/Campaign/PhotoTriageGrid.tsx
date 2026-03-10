import React from 'react';
import type { TriageDecision, PhotoScore } from '../../lib/campaign/photoTriage';

export interface TriagedPhoto {
  id: string;
  fileName: string;
  previewUrl: string;
  score: PhotoScore;
  bucket: TriageDecision;
}

interface PhotoTriageGridProps {
  photos: TriagedPhoto[];
  onReassign: (photoId: string, bucket: TriageDecision) => void;
}

const BUCKET_META: Record<TriageDecision, { title: string; emoji: string; color: string; bg: string }> = {
  hero: { title: 'HEROIS', emoji: '⭐', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  usable: { title: 'USAVEIS', emoji: '✓', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  rescue: { title: 'RESGATE', emoji: '🔧', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  reject: { title: 'REJEITADAS', emoji: '✕', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

export function PhotoTriageGrid({ photos, onReassign }: PhotoTriageGridProps) {
  const grouped: Record<TriageDecision, TriagedPhoto[]> = {
    hero: photos.filter((p) => p.bucket === 'hero'),
    usable: photos.filter((p) => p.bucket === 'usable'),
    rescue: photos.filter((p) => p.bucket === 'rescue'),
    reject: photos.filter((p) => p.bucket === 'reject'),
  };

  const handleDrop = (e: React.DragEvent, bucket: TriageDecision) => {
    e.preventDefault();
    const photoId = e.dataTransfer.getData('text/photo-id');
    if (photoId) onReassign(photoId, bucket);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
      {(Object.keys(BUCKET_META) as TriageDecision[]).map((bucket) => {
        const meta = BUCKET_META[bucket];
        return (
          <section
            key={bucket}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, bucket)}
            style={{
              border: '1px solid #3f3f46',
              background: '#18181b',
              borderRadius: 10,
              minHeight: 220,
              padding: 10,
            }}
          >
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: meta.color, fontSize: 12, fontWeight: 700 }}>{meta.emoji} {meta.title}</span>
              <span style={{ color: '#a1a1aa', fontSize: 11 }}>{grouped[bucket].length}</span>
            </header>

            <div style={{ display: 'grid', gap: 8 }}>
              {grouped[bucket].map((photo) => (
                <article
                  key={photo.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/photo-id', photo.id)}
                  style={{
                    border: `1px solid ${meta.color}`,
                    background: meta.bg,
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'grab',
                  }}
                >
                  <img
                    src={photo.previewUrl}
                    alt={photo.fileName}
                    style={{ width: '100%', height: 92, objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ padding: 8 }}>
                    <div style={{ color: '#fafafa', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      {photo.fileName}
                    </div>
                    <div style={{ color: '#d4d4d8', fontSize: 11, marginBottom: 4 }}>
                      Score {photo.score.overall} • Exposicao {photo.score.exposure} • Nitidez {photo.score.sharpness}
                    </div>
                    {photo.score.issues.length > 0 && (
                      <div style={{ color: '#f4f4f5', fontSize: 10, opacity: 0.85 }}>
                        {photo.score.issues.slice(0, 2).join(' • ')}
                      </div>
                    )}
                  </div>
                </article>
              ))}
              {grouped[bucket].length === 0 && (
                <div style={{ color: '#71717a', fontSize: 11, border: '1px dashed #3f3f46', borderRadius: 8, padding: 10 }}>
                  Arraste fotos para esta categoria
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
