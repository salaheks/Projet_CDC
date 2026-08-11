// ============================================================
// Infrastructure IR (Intermediate Representation) — Shared Types
// Source of truth for the "Diagram as Code" paradigm
// ============================================================

// ── Branded type for resource IDs ──
export type ResourceId = string;

// ── Canonical resource types (provider-independent) ──
export type InfraResourceType =
  // Network
  | 'vpc'
  | 'subnet'
  | 'internet-gateway'
  | 'nat-gateway'
  | 'route-table'
  | 'network-acl'
  // Compute
  | 'virtual-machine'
  | 'container-cluster'
  | 'serverless-function'
  // Security
  | 'firewall'
  | 'security-group'
  | 'waf'
  // Storage
  | 'relational-database'
  | 'nosql-database'
  | 'object-storage'
  | 'block-storage'
  // Advanced networking
  | 'load-balancer'
  | 'cdn'
  | 'dns-zone'
  | 'vpn-gateway'
  // On-premise
  | 'physical-router'
  | 'physical-switch'
  | 'physical-server';

// ── Cloud provider identifiers ──
export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'on-premise';

// ── Edge (connection) types ──
export type InfraEdgeType =
  | 'network-link' // Physical/virtual L2/L3 connection
  | 'contains' // Hierarchy (VPC contains subnet)
  | 'routes-to' // Routing table entry
  | 'secures' // SG/Firewall protects a resource
  | 'load-balances' // LB distributes to targets
  | 'reads-from' // Data dependency (app → DB)
  | 'peering'; // VPC/VNet peering

// ── Visual position on canvas ──
export interface VisualPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

// ── Infrastructure Node ──
export interface InfraNode {
  id: ResourceId;
  resourceType: InfraResourceType;
  provider: CloudProvider;
  logicalName: string;
  properties: Record<string, unknown>;
  parentId: ResourceId | null;
  tags: Record<string, string>;
  visual: VisualPosition;
  catalogItemId?: string;
}

// ── Infrastructure Edge ──
export interface InfraEdge {
  id: string;
  sourceId: ResourceId;
  targetId: ResourceId;
  edgeType: InfraEdgeType;
  label?: string;
  properties: Record<string, unknown>;
}

// ── Full infrastructure graph ──
export interface InfraGraph {
  version: string;
  projectId: string;
  versionNum: number;
  provider: CloudProvider;
  nodes: Map<ResourceId, InfraNode>;
  edges: InfraEdge[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    author: string;
  };
}

// ── Serializable version (for JSON transport) ──
export interface InfraGraphDTO {
  version: string;
  projectId: string;
  versionNum: number;
  provider: CloudProvider;
  nodes: InfraNode[];
  edges: InfraEdge[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    author: string;
  };
}

// ── Sync payload for incremental updates ──
export interface GraphSyncPayload {
  addedNodes: InfraNode[];
  updatedNodes: { id: string; changes: Partial<InfraNode> }[];
  deletedNodeIds: string[];
  addedEdges: InfraEdge[];
  deletedEdgeIds: string[];
  clientVersion: number;
}

export interface GraphSyncResponse {
  newVersion: number;
  conflicts: GraphConflict[];
}

export interface GraphConflict {
  nodeId: string;
  field: string;
  serverValue: unknown;
  clientValue: unknown;
}

// ── Validation types ──
export type IssueSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface ValidationIssueDTO {
  severity: IssueSeverity;
  ruleCode: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
  suggestion?: string;
}

export interface ValidationReportDTO {
  id: string;
  projectId: string;
  versionNum: number;
  status: 'PASSED' | 'WARNING' | 'FAILED';
  issues: ValidationIssueDTO[];
  summary?: string;
  executedAt: string;
}

// ── IaC generation types ──
export interface GeneratedFile {
  filename: string;
  content: string;
  language: 'hcl' | 'yaml' | 'json';
}

export type IaCFormat = 'terraform' | 'pulumi' | 'ansible' | 'cloudformation';

// ── Provider mapping types ──
export interface ProviderMapping {
  terraform: string;
  pulumi: string;
}

// ── Catalog types ──
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
  provider: CloudProvider;
  description?: string;
  icon?: string;
  propertySchema: PropertySchemaItem[];
}

export interface CatalogCategoryDTO {
  id: string;
  name: string;
  icon?: string;
  provider?: string;
  components: CatalogComponentDTO[];
}
