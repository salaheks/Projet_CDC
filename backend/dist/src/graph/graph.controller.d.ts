import { GraphService } from './graph.service';
import type { GraphSyncPayload } from '../common/types/infra-ir.types';
export declare class GraphController {
    private readonly graphService;
    constructor(graphService: GraphService);
    getFullGraph(projectId: string, versionNum: string): Promise<import("../common/types/infra-ir.types").InfraGraphDTO>;
    getNodes(versionId: string): Promise<({
        catalogItem: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            icon: string | null;
            provider: string;
            categoryId: string;
            type: string;
            propertySchema: import("@prisma/client/runtime/client").JsonValue;
            terraformTemplate: string | null;
            ansibleTemplate: string | null;
            defaultPorts: import("@prisma/client/runtime/client").JsonValue | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        provider: string | null;
        versionId: string;
        catalogItemId: string | null;
        parentId: string | null;
        positionX: number;
        positionY: number;
        width: number | null;
        height: number | null;
        nodeType: string;
        properties: import("@prisma/client/runtime/client").JsonValue;
    })[]>;
    addNode(versionId: string, body: {
        label: string;
        nodeType: string;
        provider?: string;
        positionX: number;
        positionY: number;
        width?: number;
        height?: number;
        parentId?: string;
        catalogItemId?: string;
        properties?: Record<string, unknown>;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        provider: string | null;
        versionId: string;
        catalogItemId: string | null;
        parentId: string | null;
        positionX: number;
        positionY: number;
        width: number | null;
        height: number | null;
        nodeType: string;
        properties: import("@prisma/client/runtime/client").JsonValue;
    }>;
    updateNode(nodeId: string, body: {
        label?: string;
        positionX?: number;
        positionY?: number;
        width?: number;
        height?: number;
        parentId?: string;
        properties?: Record<string, unknown>;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        provider: string | null;
        versionId: string;
        catalogItemId: string | null;
        parentId: string | null;
        positionX: number;
        positionY: number;
        width: number | null;
        height: number | null;
        nodeType: string;
        properties: import("@prisma/client/runtime/client").JsonValue;
    }>;
    deleteNode(nodeId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        provider: string | null;
        versionId: string;
        catalogItemId: string | null;
        parentId: string | null;
        positionX: number;
        positionY: number;
        width: number | null;
        height: number | null;
        nodeType: string;
        properties: import("@prisma/client/runtime/client").JsonValue;
    }>;
    getEdges(versionId: string): Promise<{
        id: string;
        createdAt: Date;
        label: string | null;
        versionId: string;
        properties: import("@prisma/client/runtime/client").JsonValue;
        sourceId: string;
        targetId: string;
        edgeType: import("@prisma/client").$Enums.EdgeType;
    }[]>;
    addEdge(versionId: string, body: {
        sourceId: string;
        targetId: string;
        edgeType?: string;
        label?: string;
        properties?: Record<string, unknown>;
    }): Promise<{
        id: string;
        createdAt: Date;
        label: string | null;
        versionId: string;
        properties: import("@prisma/client/runtime/client").JsonValue;
        sourceId: string;
        targetId: string;
        edgeType: import("@prisma/client").$Enums.EdgeType;
    }>;
    deleteEdge(edgeId: string): Promise<{
        id: string;
        createdAt: Date;
        label: string | null;
        versionId: string;
        properties: import("@prisma/client/runtime/client").JsonValue;
        sourceId: string;
        targetId: string;
        edgeType: import("@prisma/client").$Enums.EdgeType;
    }>;
    syncGraph(versionId: string, payload: GraphSyncPayload): Promise<import("../common/types/infra-ir.types").GraphSyncResponse>;
}
