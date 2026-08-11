import { create } from 'zustand';
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
import api from '../utils/api';

// ── IR-aligned data types ──

export type NodeProperties = Record<string, unknown>;

export interface PropertySchemaItem {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'ip' | 'cidr' | 'select' | 'port';
  required?: boolean;
  defaultValue?: unknown;
  min?: number;
  max?: number;
  options?: string[];
  placeholder?: string;
}

export interface CatalogComponentDTO {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  type: string;
  provider: string;
  description?: string;
  icon?: string;
  propertySchema: PropertySchemaItem[];
}

export type DeviceData = {
  label: string;
  type: string;
  provider?: string;
  catalogItemId?: string;
  properties: NodeProperties;
  propertySchema?: PropertySchemaItem[];
};

export type AppNode = Node<DeviceData>;

// ── Validation types ──

export interface ValidationIssue {
  severity: 'ERROR' | 'WARNING' | 'INFO';
  ruleCode: string;
  message: string;
  nodeId?: string;
  suggestion?: string;
}

export interface ValidationReport {
  id: string;
  status: 'PASSED' | 'WARNING' | 'FAILED';
  issues: ValidationIssue[];
  summary?: string;
}

// ── Store state ──

type EditorState = {
  // Canvas state
  nodes: AppNode[];
  edges: Edge[];
  selectedNode: AppNode | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: AppNode) => void;
  updateNodeData: (id: string, data: Partial<DeviceData>) => void;
  updateNodeProperties: (id: string, properties: Partial<NodeProperties>) => void;
  setSelectedNode: (node: AppNode | null) => void;
  deleteSelectedNode: () => void;

  // Project state
  projectId: string | null;
  versionId: string | null;
  versionNum: number;
  isDirty: boolean;

  // Loading
  isLoading: boolean;
  isSaving: boolean;

  // Sync
  saveArchitecture: () => Promise<void>;
  loadArchitecture: (projectId: string) => Promise<void>;

  // Validation
  validationReport: ValidationReport | null;
  isValidating: boolean;
  runValidation: () => Promise<void>;

  // Export
  exportedFiles: { filename: string; content: string; language: string }[] | null;
  isExporting: boolean;
  exportIaC: (format: string) => Promise<void>;

  // AI
  aiAuditReport: any | null;
  isAiAuditing: boolean;
  runAiAudit: () => Promise<void>;
  
  aiSuggestions: any[] | null;
  isAiSuggesting: boolean;
  getAiSuggestions: () => Promise<void>;

  _scheduleSave: () => void;
};

// ── Debounce helper ──
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  projectId: null,
  versionId: null,
  versionNum: 1,
  isDirty: false,
  isLoading: false,
  isSaving: false,
  validationReport: null,
  isValidating: false,
  exportedFiles: null,
  isExporting: false,
  aiAuditReport: null,
  isAiAuditing: false,
  aiSuggestions: null,
  isAiSuggesting: false,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true,
    });
    get()._scheduleSave();
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    });
    get()._scheduleSave();
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          animated: true,
          style: { strokeWidth: 2, stroke: '#6366f1' },
        },
        get().edges,
      ),
      isDirty: true,
    });
    get()._scheduleSave();
  },

  addNode: (node: AppNode) => {
    set({ nodes: [...get().nodes, node], isDirty: true });
    get()._scheduleSave();
  },

  updateNodeData: (id: string, data: Partial<DeviceData>) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
      isDirty: true,
    });
    // Refresh selectedNode
    const { selectedNode } = get();
    if (selectedNode?.id === id) {
      set({ selectedNode: get().nodes.find((n) => n.id === id) || null });
    }
    get()._scheduleSave();
  },

  updateNodeProperties: (id: string, properties: Partial<NodeProperties>) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              properties: { ...node.data.properties, ...properties },
            },
          };
        }
        return node;
      }),
      isDirty: true,
    });
    const { selectedNode } = get();
    if (selectedNode?.id === id) {
      set({ selectedNode: get().nodes.find((n) => n.id === id) || null });
    }
    get()._scheduleSave();
  },

  setSelectedNode: (node: AppNode | null) => {
    set({ selectedNode: node });
  },

  deleteSelectedNode: () => {
    const { selectedNode, nodes, edges } = get();
    if (!selectedNode) return;

    set({
      nodes: nodes.filter((n) => n.id !== selectedNode.id),
      edges: edges.filter(
        (e) => e.source !== selectedNode.id && e.target !== selectedNode.id,
      ),
      selectedNode: null,
      isDirty: true,
    });
    get()._scheduleSave();
  },

  saveArchitecture: async () => {
    const { projectId, versionId, nodes, edges } = get();
    if (!projectId || !versionId) return;

    try {
      set({ isSaving: true });
      await api.put(`/graph/${versionId}/sync`, {
        addedNodes: nodes.map((n) => ({
          id: n.id,
          resourceType: n.data.type,
          provider: n.data.provider || 'aws',
          logicalName: n.data.label,
          properties: n.data.properties || {},
          parentId: null,
          tags: {},
          visual: { x: n.position.x, y: n.position.y },
          catalogItemId: n.data.catalogItemId,
        })),
        updatedNodes: [],
        deletedNodeIds: [],
        addedEdges: edges.map((e) => ({
          id: e.id,
          sourceId: e.source,
          targetId: e.target,
          edgeType: 'network-link',
          properties: {},
        })),
        deletedEdgeIds: [],
        clientVersion: get().versionNum,
      });
      set({ isDirty: false });
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      set({ isSaving: false });
    }
  },

  loadArchitecture: async (projectId: string) => {
    try {
      set({ isLoading: true, projectId });

      // Get latest version
      const projectRes = await api.get(`/projects/${projectId}`);
      const project = projectRes.data;
      const latestVersion = project.versions?.[0];

      if (!latestVersion) {
        set({ nodes: [], edges: [], versionId: null, versionNum: 1, isLoading: false });
        return;
      }

      set({ versionId: latestVersion.id, versionNum: latestVersion.version });

      // Load graph
      const graphRes = await api.get(
        `/graph/project/${projectId}/version/${latestVersion.version}`,
      );
      const graph = graphRes.data;

      const nodes: AppNode[] = graph.nodes.map((n: any) => ({
        id: n.id,
        type: 'custom',
        position: { x: n.visual.x, y: n.visual.y },
        data: {
          label: n.logicalName,
          type: n.resourceType,
          provider: n.provider,
          properties: n.properties || {},
          catalogItemId: n.catalogItemId,
        },
      }));

      const edges: Edge[] = graph.edges.map((e: any) => ({
        id: e.id,
        source: e.sourceId,
        target: e.targetId,
        animated: true,
        style: { strokeWidth: 2, stroke: '#6366f1' },
      }));

      set({ nodes, edges, isDirty: false });
    } catch (error) {
      console.error('Load failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  runValidation: async () => {
    const { projectId, versionNum } = get();
    if (!projectId) return;

    try {
      set({ isValidating: true });
      const { data } = await api.post(
        `/validation/${projectId}/${versionNum}`,
      );
      set({ validationReport: data });
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      set({ isValidating: false });
    }
  },

  exportIaC: async (format: string) => {
    const { projectId, versionNum } = get();
    if (!projectId) return;

    try {
      set({ isExporting: true });
      const { data } = await api.post(
        `/export/${projectId}/${versionNum}/${format}`,
      );
      set({ exportedFiles: data });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      set({ isExporting: false });
    }
  },

  // Private: debounced auto-save
  _scheduleSave: () => {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      // Only auto-save if we have a versionId
      if (get().versionId) {
        get().saveArchitecture();
      }
    }, 2000); // 2 second debounce
  },

  runAiAudit: async () => {
    const { projectId, versionNum } = get();
    if (!projectId) return;

    try {
      set({ isAiAuditing: true });
      const { data } = await api.post(
        `/ai/audit/${projectId}/${versionNum}`,
      );
      set({ aiAuditReport: data });
    } catch (error) {
      console.error('AI Audit failed:', error);
    } finally {
      set({ isAiAuditing: false });
    }
  },

  getAiSuggestions: async () => {
    const { projectId, versionNum } = get();
    if (!projectId) return;

    try {
      set({ isAiSuggesting: true });
      const { data } = await api.post(
        `/ai/suggest/${projectId}/${versionNum}`,
      );
      set({ aiSuggestions: data.suggestions || [] });
    } catch (error) {
      console.error('AI Suggestion failed:', error);
    } finally {
      set({ isAiSuggesting: false });
    }
  },
} as EditorState));
