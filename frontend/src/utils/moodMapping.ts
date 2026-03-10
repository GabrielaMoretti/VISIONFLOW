/**
 * Mood Mapping System — Cinematographic Edition (OKLCH)
 *
 * Philosophy: Less is more. Professional colorists raramente passam de 20-30%
 * do range de um parâmetro. O objetivo é direção, não saturação.
 *
 * ⚡ OKLCH Integration (v2):
 *   Todos os ajustes de cor agora são calculados internamente em OKLCH,
 *   que é perceptualmente uniforme — um delta de +10° em hue no vermelho
 *   produz o MESMO efeito visual que +10° no verde. Isso elimina o problema
 *   fundamental do HSL onde ajustes idênticos produzem resultados inconsistentes.
 *
 * Ranges calibrados (escala cinematográfica):
 *   hslHueDelta      — rotação relativa de matiz (-30 a +30)
 *   hslSaturation    — delta de saturação (-25 a +25)
 *   hslLightness     — delta de luminosidade (-15 a +15)
 *   vignetteAmount   — força da vinheta (0 a 40)
 *   sharpenAmount    — nitidez delta (-20 a +40)
 *   splitHighlightHue — matiz do cast nas altas-luzes (0 a 360, absoluto)
 *   splitHighlightSat — intensidade do cast nas altas-luzes (0 a 30)
 *   splitShadowHue   — matiz do cast nas sombras (0 a 360, absoluto)
 *   splitShadowSat   — intensidade do cast nas sombras (0 a 35)
 *   contrastDelta    — delta de contraste (-15 a +20)
 *   temperatureDelta — shift de balanço de branco, quente/frio (-20 a +20)
 */

import {
  hslDeltaToOklchDelta,
  splitToneColor,
  type OklchColor,
} from '../lib/color/colorSpaces';

import {
  type FilmicPresetName,
  FILMIC_PRESETS,
  type SplitToneCurveParams,
  SPLIT_TONE_DEFAULT,
} from '../lib/color/toneMapping';

export interface MoodAdjustment {
  hslHueDelta?: number;       // rotação relativa de matiz (-30 a +30)
  hslSaturation?: number;     // delta de saturação (-25 a +25)
  hslLightness?: number;      // delta de luminosidade (-15 a +15)
  vignetteAmount?: number;    // 0 a 40
  sharpenAmount?: number;     // -20 a +40
  splitHighlightHue?: number; // 0 a 360 (matiz absoluto do color cast)
  splitHighlightSat?: number; // 0 a 30
  splitShadowHue?: number;    // 0 a 360 (matiz absoluto do color cast)
  splitShadowSat?: number;    // 0 a 35
  contrastDelta?: number;     // -15 a +20
  temperatureDelta?: number;  // shift quente/frio (-20 a +20)
}

/**
 * OKLCH-aware mood adjustment — the actual values used by the rendering pipeline.
 * Generated from MoodAdjustment via toOklchMoodAdjustment().
 */
export interface OklchMoodAdjustment {
  /** OKLCH hue rotation in degrees */
  hueDelta: number;
  /** OKLCH chroma delta (perceptually uniform saturation) */
  chromaDelta: number;
  /** OKLCH lightness delta (perceptually uniform brightness) */
  lightnessDelta: number;
  /** Split-tone highlight color in OKLCH */
  splitHighlight: OklchColor | null;
  /** Split-tone shadow color in OKLCH */
  splitShadow: OklchColor | null;
  /** Filmic curve preset to apply */
  filmicPreset: FilmicPresetName;
  /** Split-tone curve params (shadow lift, highlight rolloff) */
  splitToneCurve: SplitToneCurveParams;
  /** Original adjustment for non-color params */
  raw: MoodAdjustment;
}

export interface MoodKeyword {
  name: string;
  keywords: string[];
  adjustments: MoodAdjustment;
  category: 'emotional' | 'environment' | 'time' | 'color' | 'genre' | 'texture';
  /** Multiplicador de peso ao fazer blend (1.0 = normal) */
  dominance: number;
}

/**
 * MOOD_LIBRARY — Calibrado para output cinematográfico/editorial.
 *
 * Cada mood usa no máximo 3-4 ajustes principais.
 * Split toning (highlight/shadow hues) é a ferramenta primária —
 * é o que separa "fílmico" de "filtrado".
 */
export const MOOD_LIBRARY: MoodKeyword[] = [
  {
    name: 'melancólico',
    keywords: ['melancólico', 'triste', 'saudade', 'nostalgia', 'blue', 'downtempo', 'sad', 'melancholy'],
    adjustments: {
      temperatureDelta: -8,
      hslSaturation: -8,
      hslLightness: -5,
      splitShadowHue: 215,
      splitShadowSat: 18,
      splitHighlightHue: 210,
      splitHighlightSat: 8,
      vignetteAmount: 22,
      contrastDelta: 5,
    },
    category: 'emotional',
    dominance: 1.0,
  },
  {
    name: 'lo-fi',
    keywords: ['lo-fi', 'lofi', 'vintage', 'retro', 'grainy', 'nostálgico', 'analog'],
    adjustments: {
      temperatureDelta: 10,
      hslSaturation: -12,
      hslLightness: 4,
      splitHighlightHue: 42,
      splitHighlightSat: 14,
      splitShadowHue: 30,
      splitShadowSat: 10,
      vignetteAmount: 28,
      sharpenAmount: -10,
      contrastDelta: -8,
    },
    category: 'genre',
    dominance: 1.0,
  },
  {
    name: 'synthwave',
    keywords: ['synthwave', 'neon', 'cyberpunk', 'pink', 'purple', 'retro-future', 'vaporwave'],
    adjustments: {
      temperatureDelta: -5,
      hslSaturation: 18,
      splitHighlightHue: 300,
      splitHighlightSat: 22,
      splitShadowHue: 200,
      splitShadowSat: 28,
      vignetteAmount: 30,
      contrastDelta: 12,
      sharpenAmount: 15,
    },
    category: 'genre',
    dominance: 1.1,
  },
  {
    name: 'dark',
    keywords: ['trap', 'dark', 'bass', 'heavy', 'aggressive', 'street', 'underground'],
    adjustments: {
      hslSaturation: -15,
      hslLightness: -8,
      splitShadowHue: 0,
      splitShadowSat: 15,
      vignetteAmount: 35,
      sharpenAmount: 20,
      contrastDelta: 18,
      temperatureDelta: -5,
    },
    category: 'genre',
    dominance: 1.0,
  },
  {
    name: 'indie',
    keywords: ['indie', 'alternative', 'organic', 'natural', 'real', 'authentic', 'folk'],
    adjustments: {
      temperatureDelta: 5,
      hslSaturation: 5,
      splitHighlightHue: 35,
      splitHighlightSat: 10,
      vignetteAmount: 15,
      sharpenAmount: 8,
      contrastDelta: 3,
    },
    category: 'genre',
    dominance: 0.8,
  },
  {
    name: 'energético',
    keywords: ['energético', 'vibrante', 'vivo', 'ecstático', 'euphoric', 'festa', 'energy', 'pop'],
    adjustments: {
      hslSaturation: 15,
      hslLightness: 5,
      vignetteAmount: 8,
      sharpenAmount: 20,
      contrastDelta: 10,
      temperatureDelta: 8,
    },
    category: 'emotional',
    dominance: 0.9,
  },
  {
    name: 'calmante',
    keywords: ['calmante', 'relaxante', 'paz', 'serenidade', 'suave', 'drift', 'calm', 'peaceful', 'ambient'],
    adjustments: {
      temperatureDelta: -4,
      hslSaturation: -5,
      hslLightness: 4,
      splitHighlightHue: 185,
      splitHighlightSat: 10,
      vignetteAmount: 12,
      sharpenAmount: -5,
      contrastDelta: -5,
    },
    category: 'emotional',
    dominance: 0.8,
  },
  {
    name: 'noturno',
    keywords: ['noturno', 'night', 'escuro', 'midnight', 'noir', 'nocturne'],
    adjustments: {
      temperatureDelta: -12,
      hslSaturation: -10,
      hslLightness: -10,
      splitShadowHue: 225,
      splitShadowSat: 22,
      splitHighlightHue: 210,
      splitHighlightSat: 10,
      vignetteAmount: 38,
      contrastDelta: 15,
    },
    category: 'time',
    dominance: 1.0,
  },
  {
    name: 'cinematic',
    keywords: ['cinematic', 'film', 'movie', 'blockbuster', 'epic', 'drama', 'cinemático'],
    adjustments: {
      temperatureDelta: -6,
      hslSaturation: -8,
      hslLightness: -3,
      splitShadowHue: 210,
      splitShadowSat: 20,
      splitHighlightHue: 35,
      splitHighlightSat: 12,  // teal-orange — o look clássico de filme
      vignetteAmount: 28,
      contrastDelta: 10,
      sharpenAmount: 12,
    },
    category: 'genre',
    dominance: 1.0,
  },
  {
    name: 'ethereal',
    keywords: ['ethereal', 'dreamlike', 'surreal', 'dream', 'magic', 'celestial', 'etéreo', 'dream pop'],
    adjustments: {
      temperatureDelta: -3,
      hslSaturation: 8,
      hslLightness: 8,
      splitHighlightHue: 270,
      splitHighlightSat: 15,
      vignetteAmount: 20,
      sharpenAmount: -8,
      contrastDelta: -5,
    },
    category: 'emotional',
    dominance: 0.9,
  },
  {
    name: 'gritty',
    keywords: ['gritty', 'raw', 'harsh', 'industrial', 'rough', 'broken', 'punk'],
    adjustments: {
      hslSaturation: -20,
      hslLightness: -6,
      vignetteAmount: 32,
      sharpenAmount: 30,
      contrastDelta: 20,
      splitShadowHue: 15,
      splitShadowSat: 12,
    },
    category: 'texture',
    dominance: 1.0,
  },
  {
    name: 'luxurious',
    keywords: ['luxury', 'luxuriant', 'premium', 'rich', 'gold', 'glamour', 'luxuoso'],
    adjustments: {
      temperatureDelta: 12,
      hslSaturation: 10,
      hslLightness: 3,
      splitHighlightHue: 38,
      splitHighlightSat: 20,
      vignetteAmount: 20,
      sharpenAmount: 18,
      contrastDelta: 8,
    },
    category: 'color',
    dominance: 1.0,
  },
  {
    name: 'desert',
    keywords: ['desert', 'sandy', 'arid', 'hot', 'dust', 'deserto', 'árido'],
    adjustments: {
      temperatureDelta: 15,
      hslSaturation: 8,
      hslLightness: 5,
      splitHighlightHue: 38,
      splitHighlightSat: 18,
      splitShadowHue: 25,
      splitShadowSat: 12,
      vignetteAmount: 25,
      contrastDelta: 8,
    },
    category: 'environment',
    dominance: 0.9,
  },
  {
    name: 'forest',
    keywords: ['forest', 'nature', 'green', 'growth', 'natural', 'floresta', 'mata'],
    adjustments: {
      temperatureDelta: -3,
      hslSaturation: 10,
      hslLightness: -3,
      splitHighlightHue: 95,
      splitHighlightSat: 14,
      splitShadowHue: 140,
      splitShadowSat: 16,
      vignetteAmount: 18,
      contrastDelta: 6,
    },
    category: 'environment',
    dominance: 0.9,
  },
  {
    name: 'underwater',
    keywords: ['underwater', 'aquatic', 'deep', 'submerged', 'liquid', 'subaquático'],
    adjustments: {
      temperatureDelta: -15,
      hslSaturation: 15,
      hslLightness: -5,
      splitHighlightHue: 190,
      splitHighlightSat: 20,
      splitShadowHue: 210,
      splitShadowSat: 25,
      vignetteAmount: 30,
      sharpenAmount: -5,
      contrastDelta: 5,
    },
    category: 'environment',
    dominance: 1.0,
  },
  {
    name: 'sunset',
    keywords: ['sunset', 'sunrise', 'golden', 'orange', 'dusk', 'pôr do sol', 'golden hour'],
    adjustments: {
      temperatureDelta: 18,
      hslSaturation: 12,
      hslLightness: 3,
      splitHighlightHue: 28,
      splitHighlightSat: 22,
      splitShadowHue: 350,
      splitShadowSat: 14,
      vignetteAmount: 20,
      contrastDelta: 8,
    },
    category: 'time',
    dominance: 1.0,
  },
  {
    name: 'black & white',
    keywords: ['black and white', 'b&w', 'preto e branco', 'monochrome', 'monochromatic', 'monocromático'],
    adjustments: {
      hslSaturation: -80,
      contrastDelta: 15,
      vignetteAmount: 25,
      sharpenAmount: 15,
    },
    category: 'color',
    dominance: 1.2,
  },
  {
    name: 'pastel',
    keywords: ['pastel', 'soft', 'delicate', 'light', 'airy', 'delicado'],
    adjustments: {
      hslSaturation: -15,
      hslLightness: 10,
      contrastDelta: -10,
      vignetteAmount: 8,
      sharpenAmount: -5,
      temperatureDelta: 5,
    },
    category: 'color',
    dominance: 0.8,
  },
];

// ---------------------------------------------------------------------------
// Função principal de análise
// ---------------------------------------------------------------------------

/**
 * Analisa uma descrição de texto e retorna ajustes mood-driven.
 *
 * @param text — descrição em linguagem natural do mood, vibe ou gênero
 * @param intensity — multiplicador global de intensidade (0.0 a 1.0, padrão 0.65)
 *   Use 0.4–0.6 para looks sutis, editoriais.
 *   Use 0.7–0.9 para music video / direção de arte mais marcante.
 */
export function analyzeTextMood(
  text: string,
  intensity: number = 0.65
): { moods: string[]; adjustments: MoodAdjustment; confidence: number } {
  const lowerText = text.toLowerCase();

  const matches: { keyword: MoodKeyword; matchCount: number }[] = [];

  MOOD_LIBRARY.forEach(mood => {
    const count = mood.keywords.filter(kw => lowerText.includes(kw)).length;
    if (count > 0) {
      matches.push({ keyword: mood, matchCount: count });
    }
  });

  matches.sort((a, b) => b.matchCount - a.matchCount);

  // Máximo 2 moods — mais que isso dilui o caráter
  const topMoods = matches.slice(0, 2);
  const moodNames = topMoods.map(m => m.keyword.name);

  const blended = blendAdjustments(
    topMoods.map(m => m.keyword.adjustments),
    topMoods.map(m => m.matchCount * m.keyword.dominance)
  );

  const scaled = scaleAdjustments(blended, clamp01(intensity));
  const confidence = Math.min(100, topMoods.reduce((sum, m) => sum + m.matchCount * 25, 0));

  return {
    moods: moodNames.length > 0 ? moodNames : ['neutral'],
    adjustments: scaled,
    confidence,
  };
}

export function getMoodsByCategory(category: MoodKeyword['category']): MoodKeyword[] {
  return MOOD_LIBRARY.filter(mood => mood.category === category);
}

export function getSuggestedKeywords(partial: string): string[] {
  const lowerPartial = partial.toLowerCase();
  const seen = new Set<string>();
  const suggestions: string[] = [];

  MOOD_LIBRARY.forEach(mood => {
    mood.keywords.forEach(keyword => {
      if (keyword.includes(lowerPartial) && !seen.has(keyword)) {
        seen.add(keyword);
        suggestions.push(keyword);
      }
    });
  });

  return suggestions.slice(0, 8);
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Blenda MoodAdjustments usando média ponderada.
 * Só mistura chaves presentes no mood PRIMÁRIO — o secundário apenas nuança.
 */
function blendAdjustments(adjustments: MoodAdjustment[], weights: number[]): MoodAdjustment {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0 || adjustments.length === 0) return {};

  const result: MoodAdjustment = {};
  const primaryKeys = Object.keys(adjustments[0] ?? {}) as (keyof MoodAdjustment)[];
  const keys = new Set<keyof MoodAdjustment>(primaryKeys);

  // Secundários só contribuem em chaves que existem no primário
  adjustments.slice(1).forEach(adj => {
    (Object.keys(adj) as (keyof MoodAdjustment)[]).forEach(k => {
      if (primaryKeys.includes(k)) keys.add(k);
    });
  });

  keys.forEach(key => {
    let sum = 0;
    let usedWeight = 0;

    adjustments.forEach((adj, i) => {
      if (adj[key] !== undefined) {
        sum += (adj[key] as number) * weights[i];
        usedWeight += weights[i];
      }
    });

    if (usedWeight > 0) {
      result[key] = Math.round(sum / usedWeight) as any;
    }
  });

  return result;
}

/**
 * Escala todos os valores numéricos por um fator 0–1.
 * Mantém as proporções entre parâmetros intactas.
 * Nota: hues absolutos (splitHighlightHue, splitShadowHue) NÃO são escalados
 * porque representam posição na roda de cor, não intensidade.
 */
function scaleAdjustments(adj: MoodAdjustment, factor: number): MoodAdjustment {
  const result: MoodAdjustment = {};
  const absoluteKeys: Set<keyof MoodAdjustment> = new Set([
    'splitHighlightHue',
    'splitShadowHue',
  ]);

  (Object.keys(adj) as (keyof MoodAdjustment)[]).forEach(key => {
    const val = adj[key];
    if (typeof val === 'number') {
      // Absolute hue values should not be scaled
      result[key] = absoluteKeys.has(key)
        ? val as any
        : Math.round(val * factor) as any;
    }
  });
  return result;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

// ---------------------------------------------------------------------------
// OKLCH conversion — the bridge to the new pipeline
// ---------------------------------------------------------------------------

/**
 * Convert a MoodAdjustment (HSL-scale values) to OklchMoodAdjustment.
 * This is where the magic happens — perceptually uniform adjustments.
 *
 * The split-tone colors are generated in OKLCH space, which means
 * a blue shadow cast and an orange highlight cast will have the same
 * perceptual intensity (unlike HSL where orange always dominates blue).
 */
export function toOklchMoodAdjustment(adj: MoodAdjustment): OklchMoodAdjustment {
  const oklchDeltas = hslDeltaToOklchDelta({
    hslHueDelta: adj.hslHueDelta,
    hslSaturation: adj.hslSaturation,
    hslLightness: adj.hslLightness,
  });

  // Generate split-tone colors in OKLCH
  const splitHighlight = (adj.splitHighlightHue !== undefined && adj.splitHighlightSat !== undefined)
    ? splitToneColor(adj.splitHighlightHue, adj.splitHighlightSat, 'highlight')
    : null;

  const splitShadow = (adj.splitShadowHue !== undefined && adj.splitShadowSat !== undefined)
    ? splitToneColor(adj.splitShadowHue, adj.splitShadowSat, 'shadow')
    : null;

  // Auto-select filmic preset based on mood contrast
  const contrast = adj.contrastDelta ?? 0;
  let filmicPreset: FilmicPresetName = 'default';
  if (contrast >= 15) filmicPreset = 'veryHighContrast';
  else if (contrast >= 8) filmicPreset = 'highContrast';
  else if (contrast <= -5) filmicPreset = 'lowContrast';

  // Derive split-tone curve from mood characteristics
  const splitToneCurve: SplitToneCurveParams = {
    ...SPLIT_TONE_DEFAULT,
    // Moods with negative lightness → more shadow gamma (deeper shadows)
    shadowGamma: SPLIT_TONE_DEFAULT.shadowGamma + (adj.hslLightness ?? 0) * 0.01,
    // High contrast moods → more highlight compression
    highlightGamma: SPLIT_TONE_DEFAULT.highlightGamma + contrast * 0.005,
    // Temperature affects shadow lift (warm moods → slightly lifted shadows)
    shadowLift: SPLIT_TONE_DEFAULT.shadowLift + Math.max(0, (adj.temperatureDelta ?? 0) * 0.001),
  };

  return {
    hueDelta: oklchDeltas.hueDelta,
    chromaDelta: oklchDeltas.chromaDelta,
    lightnessDelta: oklchDeltas.lightnessDelta,
    splitHighlight,
    splitShadow,
    filmicPreset,
    splitToneCurve,
    raw: adj,
  };
}

/**
 * All-in-one: analyze text and return OKLCH-ready adjustments.
 * Use this instead of analyzeTextMood() for the new pipeline.
 */
export function analyzeTextMoodOklch(
  text: string,
  intensity: number = 0.65
): { moods: string[]; adjustments: OklchMoodAdjustment; confidence: number } {
  const result = analyzeTextMood(text, intensity);
  return {
    moods: result.moods,
    adjustments: toOklchMoodAdjustment(result.adjustments),
    confidence: result.confidence,
  };
}

/**
 * Enhanced text mood analysis.
 * Tries semantic embeddings first (Transformers.js) and falls back to keyword rules.
 */
export async function analyzeTextMoodEnhanced(
  text: string,
  intensity: number = 0.65,
  useAI: boolean = true
): Promise<
  | { topAnchor: string; similarity: number; adjustments: MoodAdjustment; allScores: { label: string; score: number }[]; modelUsed: 'semantic-ai' | 'keyword-fallback' }
  | { moods: string[]; adjustments: MoodAdjustment; confidence: number }
> {
  if (useAI) {
    try {
      const { analyzeWithSemanticAI } = await import('../lib/ai/semanticMoodAnalyzer');
      return await analyzeWithSemanticAI(text, intensity);
    } catch {
      // Falls back below.
    }
  }
  return analyzeTextMood(text, intensity);
}