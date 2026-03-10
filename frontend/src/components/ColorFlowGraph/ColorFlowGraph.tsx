import React, { useCallback, useMemo, useState } from 'react';
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AIFlowAssistant } from './AIFlowAssistant';
import { ColorNode } from './ColorNode';
import { NodeInspector } from './NodeInspector';
import { NODE_DEFAULTS, type ColorFlowNodeData, type NodeType } from './types';

const nodeTypes = { colorNode: ColorNode };

export const COLOR_FLOW_INITIAL_NODES: any[] = [
  { id: '1', type: 'colorNode', position: { x: 50, y: 150 }, data: { nodeType: 'imageInput', label: 'Imagem', params: {} } },
  { id: '2', type: 'colorNode', position: { x: 250, y: 150 }, data: { nodeType: 'whiteBalance', label: 'White Balance', params: { ...NODE_DEFAULTS.whiteBalance } } },
  { id: '3', type: 'colorNode', position: { x: 450, y: 150 }, data: { nodeType: 'curves', label: 'Curves', params: { ...NODE_DEFAULTS.curves } } },
  { id: '4', type: 'colorNode', position: { x: 650, y: 150 }, data: { nodeType: 'splitToning', label: 'Split Toning', params: { ...NODE_DEFAULTS.splitToning } } },
  { id: '5', type: 'colorNode', position: { x: 840, y: 150 }, data: { nodeType: 'saturation', label: 'Saturation', params: { ...NODE_DEFAULTS.saturation } } },
  { id: '6', type: 'colorNode', position: { x: 1020, y: 150 }, data: { nodeType: 'vignette', label: 'Vignette', params: { ...NODE_DEFAULTS.vignette } } },
  { id: '7', type: 'colorNode', position: { x: 1200, y: 150 }, data: { nodeType: 'sharpen', label: 'Sharpen', params: { ...NODE_DEFAULTS.sharpen } } },
  { id: '8', type: 'colorNode', position: { x: 1380, y: 150 }, data: { nodeType: 'grain', label: 'Grain', params: { ...NODE_DEFAULTS.grain } } },
  { id: '9', type: 'colorNode', position: { x: 1560, y: 150 }, data: { nodeType: 'vhs', label: 'VHS', params: { ...NODE_DEFAULTS.vhs } } },
  { id: '10', type: 'colorNode', position: { x: 1740, y: 150 }, data: { nodeType: 'lens', label: 'Lens', params: { ...NODE_DEFAULTS.lens } } },
  { id: '11', type: 'colorNode', position: { x: 1920, y: 150 }, data: { nodeType: 'output', label: 'Output', params: {} } },
];

export const COLOR_FLOW_INITIAL_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e5-6', source: '5', target: '6' },
  { id: 'e6-7', source: '6', target: '7' },
  { id: 'e7-8', source: '7', target: '8' },
  { id: 'e8-9', source: '8', target: '9' },
  { id: 'e9-10', source: '9', target: '10' },
  { id: 'e10-11', source: '10', target: '11' },
];

function titleCaseNode(type: NodeType): string {
  return type.replace(/([A-Z])/g, ' $1').replace(/^./, (v) => v.toUpperCase()).trim();
}

interface ColorFlowGraphProps {
  nodes?: any[];
  edges?: Edge[];
  setNodes?: (updater: any) => void;
  setEdges?: (updater: any) => void;
  onNodesChange?: any;
  onEdgesChange?: any;
}

export function ColorFlowGraph(props: ColorFlowGraphProps) {
  const [internalNodes, internalSetNodes, internalOnNodesChange] = useNodesState(COLOR_FLOW_INITIAL_NODES);
  const [internalEdges, internalSetEdges, internalOnEdgesChange] = useEdgesState(COLOR_FLOW_INITIAL_EDGES);
  const nodes = props.nodes ?? internalNodes;
  const edges = props.edges ?? internalEdges;
  const setNodes = props.setNodes ?? internalSetNodes;
  const setEdges = props.setEdges ?? internalSetEdges;
  const onNodesChange = props.onNodesChange ?? internalOnNodesChange;
  const onEdgesChange = props.onEdgesChange ?? internalOnEdgesChange;
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);

  const selectedNode = useMemo(
    () => (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) ?? null : null),
    [nodes, selectedNodeId]
  );

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const addNode = useCallback((type: NodeType) => {
    const id = `node-${Date.now()}`;
    const newNode: any = {
      id,
      type: 'colorNode',
      position: { x: 220 + Math.random() * 340, y: 80 + Math.random() * 260 },
      data: { nodeType: type, label: titleCaseNode(type), params: { ...NODE_DEFAULTS[type] } },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const applyAIFlowChanges = useCallback((changes: {
    addNodes?: { type: NodeType; afterNodeId?: string }[];
    removeNodes?: string[];
    updateParams?: { nodeId: string; params: Record<string, number | string | boolean | null> }[];
  }) => {
    if (changes.updateParams?.length) {
      setNodes((nds) => nds.map((n) => {
        const upd = changes.updateParams?.find((u) => u.nodeId === n.id);
        if (!upd) return n;
        const d = n.data as unknown as ColorFlowNodeData;
        return { ...n, data: { ...d, params: { ...d.params, ...upd.params } } };
      }));
    }

    if (changes.removeNodes?.length) {
      const removeSet = new Set(changes.removeNodes);
      setNodes((nds) => nds.filter((n) => !removeSet.has(n.id)));
      setEdges((eds) => eds.filter((e) => !removeSet.has(e.source) && !removeSet.has(e.target)));
      setSelectedNodeId((id) => (id && removeSet.has(id) ? null : id));
    }

    if (changes.addNodes?.length) {
      setNodes((nds) => {
        const created = changes.addNodes!.map((item, i) => ({
          id: `node-${Date.now()}-${i}`,
          type: 'colorNode',
          position: { x: 280 + Math.random() * 320, y: 100 + Math.random() * 240 },
          data: { nodeType: item.type, label: titleCaseNode(item.type), params: { ...NODE_DEFAULTS[item.type] } },
        }));
        return [...nds, ...created];
      });
    }
  }, [setEdges, setNodes]);

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 420, border: '1px solid #3f3f46', borderRadius: 12, overflow: 'hidden', background: '#09090b' }}>
      <div style={{ width: 180, background: '#18181b', borderRight: '1px solid #3f3f46', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ color: '#71717a', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2, margin: 0 }}>Adicionar Nó</p>
        <div style={{ background: 'rgba(39,39,42,0.6)', border: '1px solid #3f3f46', borderRadius: 8, padding: 8, color: '#a1a1aa', fontSize: 11, lineHeight: 1.35 }}>
          <strong style={{ color: '#e4e4e7' }}>Como conectar:</strong>
          <div>1. Clique e segure a bolinha roxa (lado direito do nó).</div>
          <div>2. Arraste ate a bolinha cinza (lado esquerdo do próximo nó).</div>
          <div>3. Solte para criar a conexão.</div>
        </div>
        {(Object.keys(NODE_DEFAULTS) as NodeType[]).map((type) => (
          <button
            key={type}
            onClick={() => addNode(type)}
            style={{
              fontSize: 12, textAlign: 'left', color: '#e4e4e7',
              background: '#27272a', border: '1px solid #3f3f46', borderRadius: 8,
              padding: '7px 8px', cursor: 'pointer',
            }}
          >
            + {titleCaseNode(type)}
          </button>
        ))}
        <button
          onClick={() => setShowAI((v) => !v)}
          style={{
            marginTop: 'auto', fontSize: 12, color: '#ffffff',
            background: '#6d28d9', border: 'none', borderRadius: 8,
            padding: '8px 10px', cursor: 'pointer',
          }}
        >
          🤖 IA Assistant
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          fitView
        >
          <Background color="#3f3f46" gap={20} />
          <Controls />
          <MiniMap style={{ background: '#18181b' }} />
        </ReactFlow>
      </div>

      {selectedNode && (
        <NodeInspector
          node={selectedNode}
          onUpdate={(params) => {
            setNodes((nds) => nds.map((n) => {
              if (n.id !== selectedNode.id) return n;
              const d = n.data as unknown as ColorFlowNodeData;
              return { ...n, data: { ...d, params } };
            }));
          }}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      {showAI && (
        <AIFlowAssistant
          currentNodes={nodes}
          onApplyChanges={applyAIFlowChanges}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  );
}
