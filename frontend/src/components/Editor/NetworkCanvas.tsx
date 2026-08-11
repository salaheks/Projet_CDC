import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEditorStore } from '../../stores/editorStore';
import CustomNode from './CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

export default function NetworkCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
  } = useEditorStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData) return;

      const payload = JSON.parse(rawData);

      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Generate a stable UUID for the node
      const nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      const newNode: Node = {
        id: nodeId,
        type: 'custom',
        position,
        data: {
          label: payload.label,
          type: payload.type,
          provider: payload.provider || 'aws',
          catalogItemId: payload.catalogItemId,
          propertySchema: payload.propertySchema || [],
          properties: buildDefaultProperties(payload.propertySchema || []),
        },
      };

      addNode(newNode);
    },
    [reactFlowInstance, addNode],
  );

  const onSelectionChange = useCallback(
    ({ nodes }: { nodes: Node[] }) => {
      if (nodes.length === 1) {
        setSelectedNode(nodes[0]);
      } else {
        setSelectedNode(null);
      }
    },
    [setSelectedNode],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="absolute inset-0" ref={reactFlowWrapper}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onSelectionChange={onSelectionChange}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{
            animated: true,
            style: { strokeWidth: 2, stroke: '#6366f1' },
          }}
          fitView
          className="bg-gradient-to-br from-slate-50 to-slate-100"
          snapToGrid
          snapGrid={[16, 16]}
        >
          <Background color="#cbd5e1" gap={16} />
          <Controls className="!bg-white !border-slate-200 !shadow-lg !rounded-xl" />
          <MiniMap
            nodeStrokeColor="#6366f1"
            nodeColor="#e0e7ff"
            maskColor="rgba(241, 245, 249, 0.8)"
            className="!bg-white !border-slate-200 !shadow-lg !rounded-xl"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

/**
 * Build default property values from a propertySchema.
 */
function buildDefaultProperties(schema: any[]): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const field of schema) {
    if (field.defaultValue !== undefined) {
      defaults[field.key] = field.defaultValue;
    }
  }
  return defaults;
}
