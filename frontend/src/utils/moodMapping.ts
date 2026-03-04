/**
 * Mood Mapping System
 * Translates natural language descriptions of mood/vibe into visual filter adjustments
 * Used for music video color grading
 */

export interface MoodAdjustment {
  hslHue?: number; // -180 to 180
  hslSaturation?: number; // -100 to 100
  hslLightness?: number; // -50 to 50
  vignetteAmount?: number; // 0 to 100
  sharpenAmount?: number; // 0 to 150
  splitHighlightHue?: number; // 0 to 360
  splitHighlightSat?: number; // 0 to 100
  splitShadowHue?: number; // 0 to 360
  splitShadowSat?: number; // 0 to 100
}

export interface MoodKeyword {
  name: string;
  keywords: string[];
  adjustments: MoodAdjustment;
  category: 'emotional' | 'environment' | 'time' | 'color' | 'genre' | 'texture';
}

export const MOOD_LIBRARY: MoodKeyword[] = [
  {
    name: 'melancólico',
    keywords: ['melancólico', 'triste', 'saudade', 'nostalgia', 'blue', 'downtempo'],
    adjustments: {
      hslHue: 210,
      hslSaturation: 30,
      hslLightness: -10,
      vignetteAmount: 40,
      sharpenAmount: 20,
      splitShadowHue: 200,
      splitShadowSat: 40,
    },
    category: 'emotional',
  },
  {
    name: 'lo-fi',
    keywords: ['lo-fi', 'vintage', 'retro', 'grainy', 'warm', 'nostálgico'],
    adjustments: {
      hslHue: 25,
      hslSaturation: -20,
      hslLightness: 5,
      vignetteAmount: 60,
      sharpenAmount: -30,
      splitHighlightHue: 45,
      splitHighlightSat: 20,
    },
    category: 'genre',
  },
  {
    name: 'synthwave',
    keywords: ['synthwave', 'neon', 'cyberpunk', 'pink', 'purple', 'retro-future'],
    adjustments: {
      hslHue: 290,
      hslSaturation: 80,
      hslLightness: 0,
      vignetteAmount: 50,
      sharpenAmount: 40,
      splitHighlightHue: 290,
      splitHighlightSat: 100,
      splitShadowHue: 200,
      splitShadowSat: 80,
    },
    category: 'genre',
  },
  {
    name: 'trap',
    keywords: ['trap', 'dark', 'bass', 'heavy', 'aggressive', 'street'],
    adjustments: {
      hslHue: 0,
      hslSaturation: -40,
      hslLightness: -20,
      vignetteAmount: 80,
      sharpenAmount: 60,
      splitShadowHue: 0,
      splitShadowSat: 50,
    },
    category: 'genre',
  },
  {
    name: 'indie',
    keywords: ['indie', 'alternative', 'organic', 'natural', 'real', 'authentic'],
    adjustments: {
      hslHue: -5,
      hslSaturation: 10,
      hslLightness: 2,
      vignetteAmount: 30,
      sharpenAmount: 30,
      splitHighlightHue: 30,
      splitHighlightSat: 15,
    },
    category: 'genre',
  },
  {
    name: 'energético',
    keywords: ['energético', 'vibrante', 'vivo', 'ecstático', 'euphoric', 'festa'],
    adjustments: {
      hslHue: 60,
      hslSaturation: 60,
      hslLightness: 10,
      vignetteAmount: 20,
      sharpenAmount: 70,
      splitHighlightHue: 60,
      splitHighlightSat: 80,
    },
    category: 'emotional',
  },
  {
    name: 'calmante',
    keywords: ['calmante', 'relaxante', 'paz', 'serenidade', 'suave', 'drift'],
    adjustments: {
      hslHue: 180,
      hslSaturation: 20,
      hslLightness: 8,
      vignetteAmount: 25,
      sharpenAmount: 10,
      splitHighlightHue: 180,
      splitHighlightSat: 15,
    },
    category: 'emotional',
  },
  {
    name: 'noturno',
    keywords: ['noturno', 'night', 'escuro', 'dark', 'midnight', 'noir'],
    adjustments: {
      hslHue: 240,
      hslSaturation: -30,
      hslLightness: -30,
      vignetteAmount: 90,
      sharpenAmount: 35,
      splitShadowHue: 240,
      splitShadowSat: 40,
    },
    category: 'time',
  },
  {
    name: 'cinematic',
    keywords: ['cinematic', 'film', 'movie', 'blockbuster', 'epic', 'drama'],
    adjustments: {
      hslHue: 210,
      hslSaturation: -10,
      hslLightness: -5,
      vignetteAmount: 65,
      sharpenAmount: 45,
      splitShadowHue: 200,
      splitShadowSat: 30,
    },
    category: 'genre',
  },
  {
    name: 'ethereal',
    keywords: ['ethereal', 'dreamlike', 'surreal', 'dream', 'magic', 'celestial'],
    adjustments: {
      hslHue: 270,
      hslSaturation: 25,
      hslLightness: 15,
      vignetteAmount: 40,
      sharpenAmount: 5,
      splitHighlightHue: 270,
      splitHighlightSat: 35,
    },
    category: 'emotional',
  },
  {
    name: 'gritty',
    keywords: ['gritty', 'raw', 'harsh', 'industrial', 'rough', 'broken'],
    adjustments: {
      hslHue: 0,
      hslSaturation: -50,
      hslLightness: -10,
      vignetteAmount: 70,
      sharpenAmount: 90,
      splitShadowHue: 0,
      splitShadowSat: 40,
    },
    category: 'texture',
  },
  {
    name: 'luxurious',
    keywords: ['luxury', 'luxuriant', 'premium', 'rich', 'gold', 'glamour'],
    adjustments: {
      hslHue: 35,
      hslSaturation: 40,
      hslLightness: 8,
      vignetteAmount: 35,
      sharpenAmount: 50,
      splitHighlightHue: 40,
      splitHighlightSat: 50,
    },
    category: 'color',
  },
  {
    name: 'desert',
    keywords: ['desert', 'sandy', 'arid', 'hot', 'warm', 'dust'],
    adjustments: {
      hslHue: 30,
      hslSaturation: 30,
      hslLightness: 15,
      vignetteAmount: 55,
      sharpenAmount: 30,
      splitHighlightHue: 30,
      splitHighlightSat: 25,
    },
    category: 'environment',
  },
  {
    name: 'forest',
    keywords: ['forest', 'nature', 'green', 'organic', 'growth', 'natural'],
    adjustments: {
      hslHue: 120,
      hslSaturation: 35,
      hslLightness: -5,
      vignetteAmount: 45,
      sharpenAmount: 25,
      splitHighlightHue: 120,
      splitHighlightSat: 30,
    },
    category: 'environment',
  },
  {
    name: 'underwater',
    keywords: ['underwater', 'aquatic', 'deep', 'blue', 'submerged', 'liquid'],
    adjustments: {
      hslHue: 200,
      hslSaturation: 50,
      hslLightness: -15,
      vignetteAmount: 50,
      sharpenAmount: 15,
      splitHighlightHue: 200,
      splitHighlightSat: 40,
    },
    category: 'environment',
  },
  {
    name: 'sunset',
    keywords: ['sunset', 'sunrise', 'golden', 'orange', 'warm', 'dusk'],
    adjustments: {
      hslHue: 25,
      hslSaturation: 60,
      hslLightness: 5,
      vignetteAmount: 40,
      sharpenAmount: 35,
      splitHighlightHue: 25,
      splitHighlightSat: 70,
    },
    category: 'time',
  },
];

export function analyzeTextMood(text: string): { moods: string[], adjustments: MoodAdjustment, confidence: number } {
  const lowerText = text.toLowerCase();
  
  // Find matching moods
  const matches: { keyword: MoodKeyword; matchCount: number }[] = [];
  
  MOOD_LIBRARY.forEach(mood => {
    const count = mood.keywords.filter(kw => lowerText.includes(kw)).length;
    if (count > 0) {
      matches.push({ keyword: mood, matchCount: count });
    }
  });

  // Sort by match count
  matches.sort((a, b) => b.matchCount - a.matchCount);

  // Get top 3 moods
  const topMoods = matches.slice(0, 3);
  const moodNames = topMoods.map(m => m.keyword.name);

  // Blend adjustments from matched moods
  const blendedAdjustments = blendAdjustments(
    topMoods.map(m => m.keyword.adjustments),
    topMoods.map(m => m.matchCount)
  );

  const confidence = Math.min(100, topMoods.reduce((sum, m) => sum + m.matchCount * 20, 0));

  return {
    moods: moodNames.length > 0 ? moodNames : ['neutral'],
    adjustments: blendedAdjustments,
    confidence: Math.min(100, confidence),
  };
}

export function getMoodsByCategory(category: 'emotional' | 'environment' | 'time' | 'color' | 'genre' | 'texture'): MoodKeyword[] {
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

function blendAdjustments(adjustments: MoodAdjustment[], weights: number[]): MoodAdjustment {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  
  if (totalWeight === 0) return {};

  const result: MoodAdjustment = {};

  const keys = new Set<keyof MoodAdjustment>();
  adjustments.forEach(adj => Object.keys(adj).forEach(k => keys.add(k as keyof MoodAdjustment)));

  keys.forEach(key => {
    let sum = 0;
    let count = 0;
    
    adjustments.forEach((adj, i) => {
      if (adj[key] !== undefined) {
        sum += adj[key]! * weights[i];
        count++;
      }
    });

    if (count > 0) {
      result[key] = Math.round(sum / totalWeight);
    }
  });

  return result;
}
