import type { Node } from '@xyflow/react';
import type { MoodAdjustment } from '../../utils/moodMapping';

export function applyMoodToNodes(nodes: Node[], mood: MoodAdjustment): Node[] {
  return nodes.map((node) => {
    const data = (node.data ?? {}) as { nodeType?: string; params?: Record<string, unknown> };
    const type = data.nodeType ?? '';
    const currentParams = { ...(data.params ?? {}) } as Record<string, unknown>;

    switch (type) {
      case 'whiteBalance':
        if (mood.temperatureDelta !== undefined) currentParams.temperature = mood.temperatureDelta * 2;
        break;
      case 'curves':
        if (mood.hslLightness !== undefined) currentParams.masterGamma = 1 + mood.hslLightness / 100;
        break;
      case 'splitToning':
        if (mood.splitHighlightHue !== undefined) currentParams.highlightHue = mood.splitHighlightHue;
        if (mood.splitHighlightSat !== undefined) currentParams.highlightSat = mood.splitHighlightSat;
        if (mood.splitShadowHue !== undefined) currentParams.shadowHue = mood.splitShadowHue;
        if (mood.splitShadowSat !== undefined) currentParams.shadowSat = mood.splitShadowSat;
        break;
      case 'saturation':
        if (mood.hslSaturation !== undefined) currentParams.saturation = mood.hslSaturation;
        break;
      case 'vignette':
        if (mood.vignetteAmount !== undefined) currentParams.amount = mood.vignetteAmount;
        break;
      case 'sharpen':
        if (mood.sharpenAmount !== undefined) currentParams.amount = Math.max(0, mood.sharpenAmount);
        break;
      default:
        break;
    }

    return { ...node, data: { ...data, params: currentParams } };
  });
}
