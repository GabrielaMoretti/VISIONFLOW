/**
 * Platform specs for 2025/2026 campaign exports.
 * Note: Spotify Canvas is represented as static storyboard output in this app.
 */

export interface PlatformSpec {
  id: string;
  platform: 'spotify' | 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'facebook' | 'soundcloud';
  name: string;
  emoji: string;
  width: number;
  height: number;
  aspectRatio: string;
  format: 'jpg' | 'png' | 'webp' | 'mp4';
  maxFileSizeMB: number;
  minQuality: number;
  recommendedQuality: number;
  colorSpace: 'sRGB' | 'rec709' | 'p3';
  safeZone: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  tips: string[];
  musicianUseCase: string;
}

export const PLATFORM_SPECS: PlatformSpec[] = [
  {
    id: 'spotify-canvas',
    platform: 'spotify',
    name: 'Spotify Canvas',
    emoji: '🎵',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    format: 'jpg',
    maxFileSizeMB: 8,
    minQuality: 85,
    recommendedQuality: 95,
    colorSpace: 'sRGB',
    safeZone: { top: 15, right: 8, bottom: 25, left: 8 },
    tips: [
      'Saida estatica tipo storyboard para aprovacao visual',
      'Evite texto; Canvas fica atras da UI do Spotify',
      'Movimento sutil funciona melhor',
      'Foco no sujeito no centro-baixo',
      'Gradiente escuro no rodape ajuda legibilidade'
    ],
    musicianUseCase: 'Looping visual na tela de player durante reproducao'
  },
  {
    id: 'spotify-album-cover',
    platform: 'spotify',
    name: 'Spotify Capa do Album',
    emoji: '💿',
    width: 3000,
    height: 3000,
    aspectRatio: '1:1',
    format: 'jpg',
    maxFileSizeMB: 10,
    minQuality: 90,
    recommendedQuality: 95,
    colorSpace: 'sRGB',
    safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
    tips: [
      'Minimo 3000x3000',
      'Contraste alto funciona em thumbnails pequenos',
      'Texto precisa ser legivel em 50x50px'
    ],
    musicianUseCase: 'Capa do single/EP/album no streaming'
  },
  {
    id: 'ig-post-square',
    platform: 'instagram',
    name: 'Instagram Post Quadrado',
    emoji: '📸',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    format: 'jpg',
    maxFileSizeMB: 8,
    minQuality: 85,
    recommendedQuality: 90,
    colorSpace: 'sRGB',
    safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
    tips: [
      'Instagram comprime bastante, exporte em 90%+',
      'Evite gradientes muito suaves',
      'Leve boost de saturacao costuma ajudar'
    ],
    musicianUseCase: 'Feed principal e anuncio de lancamento'
  },
  {
    id: 'ig-post-portrait',
    platform: 'instagram',
    name: 'Instagram Post Retrato',
    emoji: '📱',
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    format: 'jpg',
    maxFileSizeMB: 8,
    minQuality: 85,
    recommendedQuality: 90,
    colorSpace: 'sRGB',
    safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
    tips: [
      'Ocupa mais feed, maior engajamento',
      'Bom para retrato de artista',
      'Formato forte para post de pre-save'
    ],
    musicianUseCase: 'Post principal de lancamento'
  },
  {
    id: 'ig-story',
    platform: 'instagram',
    name: 'Instagram Story',
    emoji: '🔵',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    format: 'jpg',
    maxFileSizeMB: 30,
    minQuality: 85,
    recommendedQuality: 92,
    colorSpace: 'sRGB',
    safeZone: { top: 14, right: 5, bottom: 20, left: 5 },
    tips: [
      'Safe zone superior 14%',
      'Safe zone inferior 20%',
      'Texto importante entre 20% e 80% da altura'
    ],
    musicianUseCase: 'Teaser de lancamento e bastidores'
  },
  {
    id: 'ig-reel-cover',
    platform: 'instagram',
    name: 'Instagram Reels Cover',
    emoji: '🎬',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    format: 'jpg',
    maxFileSizeMB: 8,
    minQuality: 85,
    recommendedQuality: 90,
    colorSpace: 'sRGB',
    safeZone: { top: 10, right: 25, bottom: 35, left: 5 },
    tips: [
      'Direita e rodape sao cobertos por UI',
      'Rosto do artista funciona melhor no topo medio'
    ],
    musicianUseCase: 'Thumb de Reels e teaser de clipe'
  },
  {
    id: 'yt-thumbnail',
    platform: 'youtube',
    name: 'YouTube Thumbnail',
    emoji: '▶️',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    format: 'jpg',
    maxFileSizeMB: 2,
    minQuality: 85,
    recommendedQuality: 92,
    colorSpace: 'sRGB',
    safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
    tips: [
      'Contraste alto para competir no feed',
      'Rosto expressivo aumenta CTR',
      'Texto grande legivel em mobile'
    ],
    musicianUseCase: 'Thumb de clipe, lyric, live ou BTS'
  },
  {
    id: 'yt-banner',
    platform: 'youtube',
    name: 'YouTube Channel Art',
    emoji: '🎨',
    width: 2560,
    height: 1440,
    aspectRatio: '16:9',
    format: 'jpg',
    maxFileSizeMB: 6,
    minQuality: 85,
    recommendedQuality: 90,
    colorSpace: 'sRGB',
    safeZone: { top: 31, right: 26, bottom: 31, left: 26 },
    tips: [
      'Mantenha info critica na safe zone central',
      'Areas externas aparecem mais em TV e desktop'
    ],
    musicianUseCase: 'Branding do canal do artista'
  },
  {
    id: 'tiktok-cover',
    platform: 'tiktok',
    name: 'TikTok Video Cover',
    emoji: '🎵',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    format: 'jpg',
    maxFileSizeMB: 10,
    minQuality: 85,
    recommendedQuality: 90,
    colorSpace: 'sRGB',
    safeZone: { top: 10, right: 20, bottom: 30, left: 5 },
    tips: [
      'Rodape e direita ocupados por UI',
      'Paleta vibrante tende a performar melhor'
    ],
    musicianUseCase: 'Cover de video musical/challenge'
  },
  {
    id: 'soundcloud-artwork',
    platform: 'soundcloud',
    name: 'SoundCloud Artwork',
    emoji: '☁️',
    width: 3000,
    height: 3000,
    aspectRatio: '1:1',
    format: 'jpg',
    maxFileSizeMB: 10,
    minQuality: 90,
    recommendedQuality: 95,
    colorSpace: 'sRGB',
    safeZone: { top: 3, right: 3, bottom: 3, left: 3 },
    tips: ['Minimo 800x800, recomendado 3000x3000', 'Legivel em miniaturas'],
    musicianUseCase: 'Capa de track/playlist/album no SoundCloud'
  }
];

export function getPlatformSpecs(platform: PlatformSpec['platform']): PlatformSpec[] {
  return PLATFORM_SPECS.filter((s) => s.platform === platform);
}

export function getSpecById(id: string): PlatformSpec | undefined {
  return PLATFORM_SPECS.find((s) => s.id === id);
}

export function getMusicLaunchBundle(): PlatformSpec[] {
  const launchIds = [
    'spotify-canvas',
    'spotify-album-cover',
    'ig-post-portrait',
    'ig-story',
    'yt-thumbnail',
    'tiktok-cover'
  ];
  return PLATFORM_SPECS.filter((s) => launchIds.includes(s.id));
}
