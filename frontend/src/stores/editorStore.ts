import { create } from 'zustand';
import axios from 'axios';
import {
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';

export type DeviceData = {
  label: string;
  type: string; // 'router', 'switch', 'firewall'
  ip?: string;
  vlan?: string;
};

export type AppNode = Node<DeviceData>;

type EditorState = {
  nodes: AppNode[];
  edges: Edge[];
  selectedNode: AppNode | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: AppNode) => void;
  updateNodeData: (id: string, data: Partial<DeviceData>) => void;
  setSelectedNode: (node: AppNode | null) => void;
  isLoading: boolean;
  saveArchitecture: (projectId: string) => Promise<void>;
  loadArchitecture: (projectId: string) => Promise<void>;
};

export const useEditorStore = create<EditorState>((set, get) => ({
  isLoading: false,
  nodes: [],
  edges: [],
  selectedNode: null,
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  addNode: (node: AppNode) => {
    set({ nodes: [...get().nodes, node] });
  },
  updateNodeData: (id: string, data: Partial<DeviceData>) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });
    // Update selectedNode if it's the one being modified
    if (get().selectedNode?.id === id) {
      set({ selectedNode: get().nodes.find((n) => n.id === id) || null });
    }
  },
  setSelectedNode: (node: AppNode | null) => {
    set({ selectedNode: node });
  },
  saveArchitecture: async (projectId: string) => {
    try {
      set({ isLoading: true });
      const { nodes, edges } = get();
      await axios.put(`http://localhost:3000/projects/${projectId}/state`, {
        canvasData: { nodes, edges }
      });
    } catch (error) {
      console.error('Failed to save architecture', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      set({ isLoading: false });
    }
  },
  loadArchitecture: async (projectId: string) => {
    try {
      set({ isLoading: true });
      const response = await axios.get(`http://localhost:3000/projects/${projectId}`);
      if (response.data?.state?.canvasData) {
        const { nodes, edges } = response.data.state.canvasData;
        set({ nodes: nodes || [], edges: edges || [] });
      }
    } catch (error) {
      console.error('Failed to load architecture', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
