import React, { useEffect, useMemo, useState } from 'react';
import { LENS_PROFILES, getLensProfileById } from '../lib/lens/lensProfiles';
import { LENS_PRESETS, getPresetById, type LensPreset } from '../lib/lens/lensPresets';
import type { MoodAdjustment } from '../utils/moodMapping';

interface VirtualLensPanelProps {
  onAddToColorFlow: (payload: {
    profileId: string;
    aperture: number;
    distortionEnabled: boolean;
    chromaticAberrationEnabled: boolean;
    vignetteEnabled: boolean;
  }) => void;
  onApplyColorGrading?: (adjustment: MoodAdjustment) => void;
}

const F_STOPS = [1.4, 1.8, 2, 2.8, 4, 5.6, 8, 11, 16];

export function VirtualLensPanel({ onAddToColorFlow, onApplyColorGrading }: VirtualLensPanelProps) {
  const [profileId, setProfileId] = useState(LENS_PROFILES[0].id);
  const [aperture, setAperture] = useState(2.8);
  const [distortionEnabled, setDistortionEnabled] = useState(true);
  const [chromaticAberrationEnabled, setChromaticAberrationEnabled] = useState(true);
  const [vignetteEnabled, setVignetteEnabled] = useState(true);
  const [lastApplied, setLastApplied] = useState<string | null>(null);

  const profile = useMemo(() => getLensProfileById(profileId) ?? LENS_PROFILES[0], [profileId]);

  const applyPreset = (preset: LensPreset) => {
    setProfileId(preset.lensProfileId);
    setAperture(preset.aperture);
    setDistortionEnabled(preset.toggles.distortion);
    setChromaticAberrationEnabled(preset.toggles.chromaticAberration);
    setVignetteEnabled(preset.toggles.vignette);

    if (preset.suggestedColorGrading && onApplyColorGrading) {
      onApplyColorGrading(preset.suggestedColorGrading);
    }

    setLastApplied(preset.name);
    setTimeout(() => setLastApplied(null), 2000);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('visionflow:lastLensPreset', preset.id);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('visionflow:lastLensPreset');
    if (!saved) return;
    const preset = getPresetById(saved);
    if (preset) applyPreset(preset);
  }, []);

  const bokehShapePreview: Record<string, string> = {
    circular: '●',
    hexagonal: '⬡',
    octagonal: '⯃',
    swirl: '🌀',
    oval: '⬭',
  };

  const distortionLabel =
    profile.distortion.k1 < -0.05
      ? '↔ barrel forte'
      : profile.distortion.k1 < 0
      ? '↔ barrel suave'
      : profile.distortion.k1 > 0.05
      ? '↕ pincushion'
      : '— neutro';

  const caLabel =
    profile.chromaticAberration.intensity > 0.4
      ? '🌈 CA alta'
      : profile.chromaticAberration.intensity > 0.2
      ? '🌈 CA media'
      : '✓ CA baixa';

  return (
    <div style={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12, padding: 14 }}>
      <h3 style={{ color: '#fafafa', margin: '0 0 10px 0', fontSize: 14, fontWeight: 600 }}>🔭 Virtual Lens</h3>

      <p style={{ color: '#a1a1aa', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.1, marginBottom: 8 }}>
        ⚡ Presets Rapidos
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
        {LENS_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            title={preset.tagline}
            style={{
              position: 'relative',
              borderRadius: 8,
              border: '1px solid #3f3f46',
              background: '#27272a',
              color: '#e4e4e7',
              padding: '7px 8px',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
              <span>{preset.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{preset.name}</span>
            </div>
            <div style={{ color: '#71717a', fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {preset.tagline}
            </div>
            <span style={{ position: 'absolute', top: 6, right: 6, color: '#71717a', fontSize: 10, fontFamily: 'monospace' }}>
              f/{preset.aperture}
            </span>
          </button>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #3f3f46', margin: '10px 0' }} />
      <p style={{ color: '#71717a', fontSize: 11, margin: '0 0 8px 0' }}>— ou configure manualmente —</p>

      <label style={{ color: '#a1a1aa', fontSize: 12, display: 'block', marginBottom: 4 }}>Lens profile</label>
      <select
        value={profileId}
        onChange={(e) => setProfileId(e.target.value)}
        style={{ width: '100%', background: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46', borderRadius: 8, padding: 8, marginBottom: 10 }}
      >
        {LENS_PROFILES.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <div style={{ color: '#a1a1aa', fontSize: 11, marginBottom: 10 }}>{profile.description}</div>

      <label style={{ color: '#a1a1aa', fontSize: 12, display: 'block', marginBottom: 6 }}>Aperture: f/{aperture.toFixed(1)}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {F_STOPS.map((f) => (
          <button
            key={f}
            onClick={() => setAperture(f)}
            style={{
              border: 'none',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 11,
              fontFamily: 'monospace',
              cursor: 'pointer',
              background: aperture === f ? '#6d28d9' : '#27272a',
              color: aperture === f ? '#fff' : '#a1a1aa',
            }}
          >
            f/{f}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#a1a1aa', fontSize: 11, marginBottom: 12, padding: 8, borderRadius: 8, background: 'rgba(39,39,42,0.55)' }}>
        <span title="Bokeh shape">{bokehShapePreview[profile.bokeh.shape] ?? '●'} bokeh</span>
        <span title="Distorcao">{distortionLabel}</span>
        <span title="Aberracao cromatica">{caLabel}</span>
      </div>

      <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
        <label style={{ color: '#d4d4d8', fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={distortionEnabled} onChange={(e) => setDistortionEnabled(e.target.checked)} />
          Distortion
        </label>
        <label style={{ color: '#d4d4d8', fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={chromaticAberrationEnabled} onChange={(e) => setChromaticAberrationEnabled(e.target.checked)} />
          Chromatic Aberration
        </label>
        <label style={{ color: '#d4d4d8', fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={vignetteEnabled} onChange={(e) => setVignetteEnabled(e.target.checked)} />
          Optical Vignette
        </label>
      </div>

      <div style={{ color: '#71717a', fontSize: 11, marginBottom: 10 }}>
        Active: {distortionEnabled ? 'Distortion ' : ''}{chromaticAberrationEnabled ? 'CA ' : ''}{vignetteEnabled ? 'Vignette' : ''}
      </div>

      <div style={{ color: '#71717a', fontSize: 11, marginBottom: 10 }}>
        Dica para iniciantes: use "Portrait" para pessoas, "Wide" para cenarios, "Anamorphic" para look de cinema.
      </div>

      <button
        onClick={() =>
          onAddToColorFlow({
            profileId,
            aperture,
            distortionEnabled,
            chromaticAberrationEnabled,
            vignetteEnabled,
          })
        }
        style={{
          width: '100%', border: 'none', borderRadius: 8, padding: '9px 10px',
          background: '#6d28d9', color: '#fff', fontSize: 12, cursor: 'pointer',
        }}
      >
        Add to Color Flow Graph
      </button>

      {lastApplied && (
        <div style={{ position: 'fixed', right: 16, bottom: 16, background: '#6d28d9', color: '#fff', padding: '8px 10px', borderRadius: 8, fontSize: 12, zIndex: 9999 }}>
          ✓ Preset "{lastApplied}" aplicado
        </div>
      )}
    </div>
  );
}
