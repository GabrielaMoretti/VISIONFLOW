/**
 * Mood Mapping System ÔÇö Cinematographic Edition
 *
 * Philosophy: Less is more. Professional colorists raramente passam de 20-30%
 * do range de um par├ómetro. O objetivo ├® dire├º├úo, n├úo satura├º├úo.
 *
 * Ranges calibrados (escala cinematogr├ífica):
 *   hslHueDelta      ÔÇö rota├º├úo relativa de matiz (-30 a +30)
 *   hslSaturation    ÔÇö delta de satura├º├úo (-25 a +25)
 *   hslLightness     ÔÇö delta de luminosidade (-15 a +15)
 *   vignetteAmount   ÔÇö for├ºa da vinheta (0 a 40)
 *   sharpenAmount    ÔÇö nitidez delta (-20 a +40)
 *   splitHighlightHue ÔÇö matiz do cast nas altas-luzes (0 a 360, absoluto)
 *   splitHighlightSat ÔÇö intensidade do cast nas altas-luzes (0 a 30)
 *   splitShadowHue   ÔÇö matiz do cast nas sombras (0 a 360, absoluto)
 *   splitShadowSat   ÔÇö intensidade do cast nas sombras (0 a 35)
 *   contrastDelta    ÔÇö delta de contraste (-15 a +20)
 *   temperatureDelta ÔÇö shift de balan├ºo de branco, quente/frio (-20 a +20)
 */

export interface MoodAdjustment {
  hslHueDelta?: number;       // rota├º├úo relativa de matiz (-30 a +30)
  hslSaturation?: number;     // delta de satura├º├úo (-25 a +25)
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

export interface MoodKeyword {
  name: string;
  keywords: string[];
  adjustments: MoodAdjustment;
  category: 'emotional' | 'environment' | 'time' | 'color' | 'genre' | 'texture';
  /** Multiplicador de peso ao fazer blend (1.0 = normal) */
  dominance: number;
}

/**
 * MOOD_LIBRARY ÔÇö Calibrado para output cinematogr├ífico/editorial.
 *
 * Cada mood usa no m├íximo 3-4 ajustes principais.
 * Split toning (highlight/shadow hues) ├® a ferramenta prim├íria ÔÇö
 * ├® o que separa "f├¡lmico" de "filtrado".
 */
export const MOOD_LIBRARY: MoodKeyword[] = [
  {
    name: 'melanc├│lico',
    keywords: ['melanc├│lico', 'triste', 'saudade', 'nostalgia', 'blue', 'downtempo', 'sad', 'melancholy'],
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
    keywords: ['lo-fi', 'lofi', 'vintage', 'retro', 'grainy', 'nost├ílgico', 'analog'],
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
    name: 'energ├®tico',
    keywords: ['energ├®tico', 'vibrante', 'vivo', 'ecst├ítico', 'euphoric', 'festa', 'energy', 'pop'],
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
    keywords: ['cinematic', 'film', 'movie', 'blockbuster', 'epic', 'drama', 'cinem├ítico'],
    adjustments: {
      temperatureDelta: -6,
      hslSaturation: -8,
      hslLightness: -3,
      splitShadowHue: 210,
      splitShadowSat: 20,
      splitHighlightHue: 35,
      splitHighlightSat: 12,  // teal-orange ÔÇö o look cl├íssico de filme
      vignetteAmount: 28,
      contrastDelta: 10,
      sharpenAmount: 12,
    },
    category: 'genre',
    dominance: 1.0,
  },
  {
    name: 'ethereal',
    keywords: ['ethereal', 'dreamlike', 'surreal', 'dream', 'magic', 'celestial', 'et├®reo', 'dream pop'],
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
    keywords: ['desert', 'sandy', 'arid', 'hot', 'dust', 'deserto', '├írido'],
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
    keywords: ['underwater', 'aquatic', 'deep', 'submerged', 'liquid', 'subaqu├ítico'],
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
    keywords: ['sunset', 'sunrise', 'golden', 'orange', 'dusk', 'p├┤r do sol', 'golden hour'],
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
    keywords: ['black and white', 'b&w', 'preto e branco', 'monochrome', 'monochromatic', 'monocrom├ítico'],
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
// Fun├º├úo principal de an├ílise
// ---------------------------------------------------------------------------

/**
 * Analisa uma descri├º├úo de texto e retorna ajustes mood-driven.
 *
 * @param text ÔÇö descri├º├úo em linguagem natural do mood, vibe ou g├¬nero
 * @param intensity ÔÇö multiplicador global de intensidade (0.0 a 1.0, padr├úo 0.65)
 *   Use 0.4ÔÇô0.6 para looks sutis, editoriais.
 *   Use 0.7ÔÇô0.9 para music video / dire├º├úo de arte mais marcante.
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

  // M├íximo 2 moods ÔÇö mais que isso dilui o car├íter
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
 * Blenda MoodAdjustments usando m├®dia ponderada.
 * S├│ mistura chaves presentes no mood PRIM├üRIO ÔÇö o secund├írio apenas nuan├ºa.
 */
function blendAdjustments(adjustments: MoodAdjustment[], weights: number[]): MoodAdjustment {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0 || adjustments.length === 0) return {};

  const result: MoodAdjustment = {};
  const primaryKeys = Object.keys(adjustments[0] ?? {}) as (keyof MoodAdjustment)[];
  const keys = new Set<keyof MoodAdjustment>(primaryKeys);

  // Secund├írios s├│ contribuem em chaves que existem no prim├írio
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
 * Escala todos os valores num├®ricos por um fator 0ÔÇô1.
 * Mant├®m as propor├º├Áes entre par├ómetros intactas.
 */
function scaleAdjustments(adj: MoodAdjustment, factor: number): MoodAdjustment {
  const result: MoodAdjustment = {};
  (Object.keys(adj) as (keyof MoodAdjustment)[]).forEach(key => {
    const val = adj[key];
    if (typeof val === 'number') {
      result[key] = Math.round(val * factor) as any;
    }
  });
  return result;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
