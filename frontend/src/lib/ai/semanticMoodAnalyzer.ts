/**
 * Semantic Mood Analyzer (browser-only, no paid API)
 * Uses Transformers.js embeddings and a cinematic anchor space.
 */

import { env, pipeline } from '@xenova/transformers';
import type { MoodAdjustment } from '../../utils/moodMapping';
import { analyzeTextMood } from '../../utils/moodMapping';

env.allowRemoteModels = true;

type EmbeddingPipeline = Awaited<ReturnType<typeof pipeline>>;
let embeddingPipeline: EmbeddingPipeline | null = null;

async function getEmbeddingPipeline(): Promise<EmbeddingPipeline> {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embeddingPipeline;
}

const SEMANTIC_ANCHORS = [
  { label: 'cold_blue_melancholy', text: 'cold blue melancholy rain sad winter lonely' },
  { label: 'warm_golden_nostalgic', text: 'warm golden nostalgic vintage film summer' },
  { label: 'dark_dramatic_contrast', text: 'dark dramatic high contrast shadows noir thriller' },
  { label: 'vibrant_energetic_pop', text: 'vibrant saturated energetic pop colorful neon bright' },
  { label: 'cinematic_teal_orange', text: 'cinematic teal orange blockbuster epic movie grade' },
  { label: 'soft_pastel_airy', text: 'soft pastel airy light delicate romantic dreamy' },
  { label: 'gritty_urban_raw', text: 'gritty urban raw street authentic rough grain' },
  { label: 'ethereal_mystical', text: 'ethereal mystical surreal otherworldly fog haze' },
  { label: 'horror_desaturated', text: 'horror desaturated pale sick twisted unsettling' },
  { label: 'euphoric_festival', text: 'euphoric festival party celebration colorful joy energy' },
] as const;

const ANCHOR_TO_ADJUSTMENTS: Record<string, MoodAdjustment> = {
  cold_blue_melancholy: {
    temperatureDelta: -14, hslSaturation: -10, hslLightness: -6,
    splitShadowHue: 215, splitShadowSat: 22, splitHighlightHue: 205, splitHighlightSat: 10,
    vignetteAmount: 25, contrastDelta: 7,
  },
  warm_golden_nostalgic: {
    temperatureDelta: 14, hslSaturation: -8, hslLightness: 3,
    splitHighlightHue: 42, splitHighlightSat: 18, splitShadowHue: 30, splitShadowSat: 10,
    vignetteAmount: 22, sharpenAmount: -8, contrastDelta: -5,
  },
  dark_dramatic_contrast: {
    hslSaturation: -18, hslLightness: -10, splitShadowHue: 0, splitShadowSat: 12,
    vignetteAmount: 38, sharpenAmount: 22, contrastDelta: 20, temperatureDelta: -6,
  },
  vibrant_energetic_pop: {
    hslSaturation: 20, hslLightness: 5, vignetteAmount: 6, sharpenAmount: 18,
    contrastDelta: 12, temperatureDelta: 10,
  },
  cinematic_teal_orange: {
    temperatureDelta: -5, hslSaturation: -6, hslLightness: -2,
    splitShadowHue: 188, splitShadowSat: 24, splitHighlightHue: 32, splitHighlightSat: 16,
    vignetteAmount: 28, contrastDelta: 10, sharpenAmount: 12,
  },
  soft_pastel_airy: {
    hslSaturation: -18, hslLightness: 12, contrastDelta: -12, vignetteAmount: 6,
    sharpenAmount: -8, temperatureDelta: 5,
  },
  gritty_urban_raw: {
    hslSaturation: -12, contrastDelta: 16, sharpenAmount: 25,
    vignetteAmount: 20, temperatureDelta: -4, hslLightness: -4,
  },
  ethereal_mystical: {
    hslSaturation: -5, hslLightness: 6, temperatureDelta: -8,
    splitHighlightHue: 280, splitHighlightSat: 14, splitShadowHue: 200, splitShadowSat: 18,
    vignetteAmount: 32, sharpenAmount: -10, contrastDelta: -4,
  },
  horror_desaturated: {
    hslSaturation: -35, contrastDelta: 18, hslLightness: -8, splitShadowHue: 5, splitShadowSat: 15,
    vignetteAmount: 40, sharpenAmount: -5, temperatureDelta: -10,
  },
  euphoric_festival: {
    hslSaturation: 25, hslLightness: 8,
    splitHighlightHue: 315, splitHighlightSat: 16, splitShadowHue: 190, splitShadowSat: 12,
    vignetteAmount: 10, sharpenAmount: 15, contrastDelta: 8, temperatureDelta: 12,
  },
};

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

async function getEmbedding(text: string): Promise<number[]> {
  const pipe = await getEmbeddingPipeline();
  const output = await pipe(text, { pooling: 'mean' } as any);
  return Array.from((output as { data: Float32Array }).data);
}

let anchorEmbeddingsPromise: Promise<Record<string, number[]>> | null = null;
async function getAnchorEmbeddings(): Promise<Record<string, number[]>> {
  if (!anchorEmbeddingsPromise) {
    anchorEmbeddingsPromise = (async () => {
      const entries = await Promise.all(
        SEMANTIC_ANCHORS.map(async (anchor) => [anchor.label, await getEmbedding(anchor.text)] as const)
      );
      return Object.fromEntries(entries);
    })();
  }
  return anchorEmbeddingsPromise;
}

export interface SemanticMoodResult {
  topAnchor: string;
  similarity: number;
  adjustments: MoodAdjustment;
  allScores: { label: string; score: number }[];
  modelUsed: 'semantic-ai' | 'keyword-fallback';
}

export async function analyzeWithSemanticAI(
  text: string,
  intensity: number = 0.65
): Promise<SemanticMoodResult> {
  try {
    const inputEmbedding = await getEmbedding(text);
    const anchorEmbeddings = await getAnchorEmbeddings();

    const scores = SEMANTIC_ANCHORS.map((anchor) => ({
      label: anchor.label,
      score: cosineSimilarity(inputEmbedding, anchorEmbeddings[anchor.label]),
    })).sort((a, b) => b.score - a.score);

    const best = scores[0];
    const second = scores[1] ?? scores[0];
    const primaryAdj = ANCHOR_TO_ADJUSTMENTS[best.label] ?? {};
    const secondaryAdj = ANCHOR_TO_ADJUSTMENTS[second.label] ?? {};

    const blendedAdj: MoodAdjustment = {};
    const allKeys = new Set<keyof MoodAdjustment>([
      ...(Object.keys(primaryAdj) as (keyof MoodAdjustment)[]),
      ...(Object.keys(secondaryAdj) as (keyof MoodAdjustment)[]),
    ]);

    const blendWeight = best.score / (best.score + second.score * 0.4 || 1);
    allKeys.forEach((key) => {
      const p = (primaryAdj[key] as number) ?? 0;
      const s = (secondaryAdj[key] as number) ?? 0;
      (blendedAdj as Record<string, number>)[key] = Math.round((p * blendWeight + s * (1 - blendWeight)) * intensity);
    });

    return {
      topAnchor: best.label,
      similarity: best.score,
      adjustments: blendedAdj,
      allScores: scores,
      modelUsed: 'semantic-ai',
    };
  } catch {
    const fallback = analyzeTextMood(text, intensity);
    return {
      topAnchor: fallback.moods[0] ?? 'neutral',
      similarity: fallback.confidence / 100,
      adjustments: fallback.adjustments,
      allScores: [],
      modelUsed: 'keyword-fallback',
    };
  }
}
