import React, { useMemo, useState } from 'react';
import type { ColorFlowNodeData, NodeType } from './types';

interface AIFlowAssistantProps {
  currentNodes: any[];
  onApplyChanges: (changes: {
    addNodes?: { type: NodeType; afterNodeId?: string }[];
    removeNodes?: string[];
    updateParams?: { nodeId: string; params: Record<string, number | string | boolean | null> }[];
  }) => void;
  onClose: () => void;
}

function inferNodeByType(nodes: any[], type: NodeType): string | null {
  const found = nodes.find((n) => (n.data as unknown as ColorFlowNodeData).nodeType === type);
  return found?.id ?? null;
}

function parseInstruction(input: string, nodes: any[]) {
  const text = input.toLowerCase();
  const changes: {
    addNodes?: { type: NodeType; afterNodeId?: string }[];
    removeNodes?: string[];
    updateParams?: { nodeId: string; params: Record<string, number | string | boolean | null> }[];
  } = {};

  const splitId = inferNodeByType(nodes, 'splitToning');
  const vignetteId = inferNodeByType(nodes, 'vignette');
  const grainId = inferNodeByType(nodes, 'grain');

  if (text.includes('remove') || text.includes('remover')) {
    if ((text.includes('vignette') || text.includes('vinheta')) && vignetteId) {
      changes.removeNodes = [...(changes.removeNodes ?? []), vignetteId];
    }
    if (text.includes('grain') && grainId) {
      changes.removeNodes = [...(changes.removeNodes ?? []), grainId];
    }
  }

  if (text.includes('grain') || text.includes('grão') || text.includes('granulado')) {
    if (!grainId) {
      changes.addNodes = [...(changes.addNodes ?? []), { type: 'grain', afterNodeId: splitId ?? undefined }];
    } else {
      changes.updateParams = [...(changes.updateParams ?? []), { nodeId: grainId, params: { amount: 35, size: 1.5, roughness: 0.6 } }];
    }
  }

  if (text.includes('vignette') || text.includes('vinheta')) {
    if (!vignetteId) {
      changes.addNodes = [...(changes.addNodes ?? []), { type: 'vignette', afterNodeId: splitId ?? undefined }];
    }
  }

  if (splitId && (text.includes('teal orange') || text.includes('blockbuster') || text.includes('cinematic'))) {
    changes.updateParams = [
      ...(changes.updateParams ?? []),
      { nodeId: splitId, params: { highlightHue: 35, highlightSat: 18, shadowHue: 188, shadowSat: 24 } },
    ];
  }

  if (splitId && (text.includes('drama') || text.includes('sombras azuis') || text.includes('shadows'))) {
    changes.updateParams = [
      ...(changes.updateParams ?? []),
      { nodeId: splitId, params: { shadowHue: 215, shadowSat: 28 } },
    ];
  }

  return changes;
}

export function AIFlowAssistant({ currentNodes, onApplyChanges, onClose }: AIFlowAssistantProps) {
  const [input, setInput] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const nodeSummary = useMemo(
    () => currentNodes.map((n) => `${(n.data as unknown as ColorFlowNodeData).nodeType}:${n.id}`).join(' | '),
    [currentNodes]
  );

  const handleSubmit = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setLog((prev) => [...prev, `→ ${userMsg}`]);

    const changes = parseInstruction(userMsg, currentNodes);
    onApplyChanges(changes);
    setLog((prev) => [...prev, `✅ ${JSON.stringify(changes)}`]);
  };

  return (
    <div style={{ width: 300, background: '#09090b', borderLeft: '1px solid #3f3f46', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #3f3f46' }}>
        <span style={{ color: '#fafafa', fontSize: 13, fontWeight: 600 }}>🤖 Flow AI</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ padding: 10, borderBottom: '1px solid #27272a', color: '#71717a', fontSize: 11 }}>
        Nós: {nodeSummary || 'nenhum'}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {log.length === 0 && (
          <p style={{ color: '#71717a', fontSize: 12, lineHeight: 1.5 }}>
            Descreva o look e eu tento ajustar o fluxo localmente.
            Ex: "look teal orange", "adiciona grain 35mm", "remove vinheta".
          </p>
        )}
        {log.map((msg, i) => (
          <p key={i} style={{ color: '#a1a1aa', fontFamily: 'monospace', fontSize: 11 }}>{msg}</p>
        ))}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid #3f3f46' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Descreva o look cinematográfico..."
          style={{
            width: '100%', minHeight: 90, resize: 'none',
            background: '#18181b', color: '#e4e4e7', border: '1px solid #3f3f46',
            borderRadius: 8, padding: 8, fontSize: 12,
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            width: '100%', marginTop: 8, border: 'none', borderRadius: 8,
            background: '#6d28d9', color: '#ffffff', padding: '8px 10px',
            fontSize: 12, cursor: 'pointer',
          }}
        >
          Aplicar no Fluxo
        </button>
      </div>
    </div>
  );
}
