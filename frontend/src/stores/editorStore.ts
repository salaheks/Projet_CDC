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

export type Comment = {
  id: string;
  text: string;
  author: string;
  date: string;
};

export type ReportSettings = {
  clientName: string;
  logoUrl: string;
};

type EditorState = {
  nodes: AppNode[];
  edges: Edge[];
  comments: Record<string, Comment[]>;
  reportSettings: ReportSettings;
  selectedNode: AppNode | null;
  selectedEdge: Edge | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: AppNode) => void;
  updateNodeData: (id: string, data: Partial<DeviceData>) => void;
  updateEdgeData: (id: string, data: any) => void;
  addComment: (elementId: string, text: string, author: string) => void;
  updateReportSettings: (settings: Partial<ReportSettings>) => void;
  setSelectedNode: (node: AppNode | null) => void;
  setSelectedEdge: (edge: Edge | null) => void;
  isLoading: boolean;
  saveArchitecture: (projectId: string) => Promise<void>;
  loadArchitecture: (projectId: string) => Promise<void>;
};

export const useEditorStore = create<EditorState>((set, get) => ({
  isLoading: false,
  nodes: [],
  edges: [],
  comments: {},
  reportSettings: { clientName: 'Client par défaut', logoUrl: '' },
  selectedNode: null,
  selectedEdge: null,
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
    // Default edge type config
    const newEdge = { 
      ...connection, 
      type: 'default', // ReactFlow default edge type
      data: { type: 'ethernet' }, // Our custom data
      label: 'Ethernet',
      style: { strokeWidth: 2, stroke: '#6366f1' },
      animated: false
    };
    set({
      edges: addEdge(newEdge, get().edges),
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
  updateEdgeData: (id: string, data: any) => {
    set({
      edges: get().edges.map((edge) => {
        if (edge.id === id) {
          // Merge data and directly update label/style/animated if present
          const newEdge = { ...edge, data: { ...edge.data, ...data } };
          if (data.label !== undefined) newEdge.label = data.label;
          if (data.style !== undefined) newEdge.style = { ...edge.style, ...data.style };
          if (data.animated !== undefined) newEdge.animated = data.animated;
          return newEdge;
        }
        return edge;
      }),
    });
    if (get().selectedEdge?.id === id) {
      set({ selectedEdge: get().edges.find((e) => e.id === id) || null });
    }
  },
  addComment: (elementId: string, text: string, author: string) => {
    const newComment: Comment = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      author,
      date: new Date().toISOString(),
    };
    set((state) => ({
      comments: {
        ...state.comments,
        [elementId]: [...(state.comments[elementId] || []), newComment],
      },
    }));
  },
  updateReportSettings: (settings: Partial<ReportSettings>) => {
    set((state) => ({
      reportSettings: { ...state.reportSettings, ...settings },
    }));
  },
  setSelectedNode: (node: AppNode | null) => {
    set({ selectedNode: node, selectedEdge: null });
  },
  setSelectedEdge: (edge: Edge | null) => {
    set({ selectedEdge: edge, selectedNode: null });
  },
  saveArchitecture: async (projectId: string) => {
    try {
      set({ isLoading: true });
      const { nodes, edges, comments, reportSettings } = get();
      await axios.put(`http://localhost:3000/projects/${projectId}/state`, {
        canvasData: { nodes, edges, comments, reportSettings }
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
        const { nodes, edges, comments, reportSettings } = response.data.state.canvasData;
        set({ 
          nodes: nodes || [], 
          edges: edges || [],
          comments: comments || {},
          reportSettings: reportSettings || { clientName: 'Client par défaut', logoUrl: '' }
        });
      }
    } catch (error) {
      console.error('Failed to load architecture', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
