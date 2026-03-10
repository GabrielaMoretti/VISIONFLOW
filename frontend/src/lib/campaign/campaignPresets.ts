/**
 * Campaign presets for musician launches.
 */

import type { MoodAdjustment } from '../../utils/moodMapping';

export interface CampaignCheckItem {
  id: string;
  label: string;
  category: 'content' | 'technical' | 'marketing';
  required: boolean;
}

export interface CampaignPreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  platformIds: string[];
  suggestedMood: string;
  suggestedColorGrading: MoodAdjustment;
  suggestedLensPreset: string;
  photoAllocation: {
    hero: number;
    supporting: number;
    texture: number;
  };
  checklist: CampaignCheckItem[];
}

export const CAMPAIGN_PRESETS: CampaignPreset[] = [
  {
    id: 'single-launch',
    name: 'Lancamento de Single',
    emoji: '🎵',
    description: 'Pacote completo para single: Spotify, Instagram, YouTube e TikTok.',
    platformIds: [
      'spotify-canvas',
      'spotify-album-cover',
      'ig-post-portrait',
      'ig-story',
      'ig-reel-cover',
      'yt-thumbnail',
      'tiktok-cover'
    ],
    suggestedMood: 'cinematic, emotional, artistic',
    suggestedColorGrading: {
      temperatureDelta: -4,
      hslSaturation: -6,
      contrastDelta: 10,
      vignetteAmount: 22,
      splitShadowHue: 210,
      splitShadowSat: 18,
      splitHighlightHue: 38,
      splitHighlightSat: 10
    },
    suggestedLensPreset: 'preset-portrait',
    photoAllocation: { hero: 2, supporting: 3, texture: 2 },
    checklist: [
      { id: 'cover-done', label: 'Capa do single finalizada (3000x3000)', category: 'content', required: true },
      { id: 'spotify-canvas-done', label: 'Spotify Canvas criado (9:16)', category: 'content', required: true },
      { id: 'ig-post-done', label: 'Post do Instagram pronto', category: 'content', required: true },
      { id: 'ig-story-done', label: 'Story do Instagram pronto', category: 'content', required: false },
      { id: 'safe-zones', label: 'Safe zones verificadas em todos os formatos', category: 'technical', required: true },
      { id: 'resolution', label: 'Resolucao correta em todos os formatos', category: 'technical', required: true },
      { id: 'color-consistent', label: 'Look consistente entre formatos', category: 'technical', required: true },
      { id: 'presave-link', label: 'Pre-save adicionado nos Stories', category: 'marketing', required: false }
    ]
  },
  {
    id: 'ep-album-launch',
    name: 'Lancamento de EP / Album',
    emoji: '💿',
    description: 'Campanha mais ampla para EP/album com teaser e dia do lancamento.',
    platformIds: [
      'spotify-album-cover',
      'ig-post-square',
      'ig-post-portrait',
      'ig-story',
      'ig-reel-cover',
      'yt-thumbnail',
      'yt-banner',
      'tiktok-cover',
      'soundcloud-artwork'
    ],
    suggestedMood: 'epic, cinematic, deep',
    suggestedColorGrading: {
      temperatureDelta: -6,
      hslSaturation: -8,
      hslLightness: -3,
      contrastDelta: 12,
      vignetteAmount: 28,
      splitShadowHue: 215,
      splitShadowSat: 22,
      splitHighlightHue: 35,
      splitHighlightSat: 14
    },
    suggestedLensPreset: 'preset-cinema-clean',
    photoAllocation: { hero: 3, supporting: 5, texture: 4 },
    checklist: [
      { id: 'cover-done', label: 'Capa do album finalizada', category: 'content', required: true },
      { id: 'visual-identity', label: 'Identidade visual consistente', category: 'technical', required: true },
      { id: 'launch-day-pack', label: 'Pack do dia de lancamento finalizado', category: 'content', required: true },
      { id: 'all-platforms', label: 'Todos os formatos principais cobertos', category: 'technical', required: true },
      { id: 'safe-zones', label: 'Safe zones verificadas', category: 'technical', required: true },
      { id: 'teaser-materials', label: 'Materiais de teaser preparados', category: 'marketing', required: false }
    ]
  },
  {
    id: 'live-show',
    name: 'Show / Evento ao Vivo',
    emoji: '🎤',
    description: 'Material promocional para show com look energetico de impacto.',
    platformIds: ['ig-post-portrait', 'ig-story', 'ig-reel-cover', 'yt-thumbnail', 'tiktok-cover'],
    suggestedMood: 'energetic, dark, stage, performance',
    suggestedColorGrading: {
      hslSaturation: 12,
      contrastDelta: 18,
      hslLightness: -5,
      vignetteAmount: 35,
      sharpenAmount: 18,
      splitShadowHue: 0,
      splitShadowSat: 12
    },
    suggestedLensPreset: 'preset-wide',
    photoAllocation: { hero: 2, supporting: 4, texture: 2 },
    checklist: [
      { id: 'event-info', label: 'Data, local e hora visiveis', category: 'marketing', required: true },
      { id: 'ticket-link', label: 'Link de ingressos ativo', category: 'marketing', required: true },
      { id: 'visual-impact', label: 'Imagem com impacto imediato', category: 'content', required: true },
      { id: 'story-countdown', label: 'Story com contagem regressiva', category: 'content', required: false }
    ]
  },
  {
    id: 'artist-brand',
    name: 'Identidade do Artista',
    emoji: '✦',
    description: 'Atualizacao de branding visual com consistencia multiplataforma.',
    platformIds: ['spotify-album-cover', 'ig-post-square', 'ig-post-portrait', 'yt-banner', 'soundcloud-artwork'],
    suggestedMood: 'editorial, minimal, artistic, identity',
    suggestedColorGrading: {
      temperatureDelta: -2,
      hslSaturation: -10,
      contrastDelta: 8,
      vignetteAmount: 18,
      sharpenAmount: 15
    },
    suggestedLensPreset: 'preset-zeiss-editorial',
    photoAllocation: { hero: 3, supporting: 2, texture: 1 },
    checklist: [
      { id: 'color-palette', label: 'Paleta de 3-5 cores definida', category: 'technical', required: true },
      { id: 'consistent-look', label: 'Look consistente entre plataformas', category: 'technical', required: true },
      { id: 'profile-pics', label: 'Fotos de perfil atualizadas', category: 'content', required: true },
      { id: 'bio-updated', label: 'Bio e links atualizados', category: 'marketing', required: false }
    ]
  }
];

export function getCampaignPresetById(id: string): CampaignPreset | undefined {
  return CAMPAIGN_PRESETS.find((preset) => preset.id === id);
}
