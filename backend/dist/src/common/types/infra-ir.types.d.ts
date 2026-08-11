export type ResourceId = string;
export type InfraResourceType = 'vpc' | 'subnet' | 'internet-gateway' | 'nat-gateway' | 'route-table' | 'network-acl' | 'virtual-machine' | 'container-cluster' | 'serverless-function' | 'firewall' | 'security-group' | 'waf' | 'relational-database' | 'nosql-database' | 'object-storage' | 'block-storage' | 'load-balancer' | 'cdn' | 'dns-zone' | 'vpn-gateway' | 'physical-router' | 'physical-switch' | 'physical-server';
export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'on-premise';
export type InfraEdgeType = 'network-link' | 'contains' | 'routes-to' | 'secures' | 'load-balances' | 'reads-from' | 'peering';
export interface VisualPosition {
    x: number;
    y: number;
    width?: number;
    height?: number;
}
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
export interface InfraEdge {
    id: string;
    sourceId: ResourceId;
    targetId: ResourceId;
    edgeType: InfraEdgeType;
    label?: string;
    properties: Record<string, unknown>;
}
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
export interface GraphSyncPayload {
    addedNodes: InfraNode[];
    updatedNodes: {
        id: string;
        changes: Partial<InfraNode>;
    }[];
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
export interface GeneratedFile {
    filename: string;
    content: string;
    language: 'hcl' | 'yaml' | 'json';
}
export type IaCFormat = 'terraform' | 'pulumi' | 'ansible' | 'cloudformation';
export interface ProviderMapping {
    terraform: string;
    pulumi: string;
}
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
