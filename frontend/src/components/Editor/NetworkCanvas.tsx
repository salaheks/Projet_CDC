import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  BackgroundVariant,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEditorStore } from '../../stores/editorStore';
import CustomNode from './CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

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

      const typeData = event.dataTransfer.getData('application/reactflow');
      if (!typeData) return;

      const { type, label } = JSON.parse(typeData);

      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: getId(),
        type: 'custom',
        position,
        data: { label, type },
      };

      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node[], edges: any[] }) => {
      if (nodes.length === 1) {
        setSelectedNode(nodes[0]);
      } else if (edges.length === 1) {
        useEditorStore.getState().setSelectedEdge(edges[0]);
      } else {
        setSelectedNode(null);
        useEditorStore.getState().setSelectedEdge(null);
      }
    },
    [setSelectedNode]
  );

  const isEmpty = nodes.length === 0;

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
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{
            animated: true,
            style: { strokeWidth: 2, stroke: '#6366f1' },
          }}
          fitView
          className="bg-transparent"
          deleteKeyCode="Delete"
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} color="#cbd5e1" gap={20} size={1.5} />
          <Controls className="!bottom-4 !left-4 !shadow-lg !rounded-xl !border-slate-200 overflow-hidden" />
          <MiniMap
            nodeStrokeColor="#6366f1"
            nodeColor="#e0e7ff"
            maskColor="rgba(241, 245, 249, 0.85)"
            className="!rounded-xl !shadow-lg !border !border-slate-200 !bottom-4 !right-4"
          />
        </ReactFlow>
      </ReactFlowProvider>

      {/* Empty state overlay */}
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center mb-4 shadow-sm">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-slate-500 font-semibold text-base">Canvas vide</p>
            <p className="text-slate-400 text-sm mt-1">Faites glisser des éléments depuis le catalogue</p>
          </div>
        </div>
      )}
    </div>
  );
}
