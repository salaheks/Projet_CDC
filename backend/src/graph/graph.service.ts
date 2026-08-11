import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { GraphSyncPayload, GraphSyncResponse, InfraNode, InfraEdge, InfraGraphDTO } from '../common/types/infra-ir.types';

@Injectable()
export class GraphService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get the full graph for a project version as an InfraGraphDTO.
   */
  async getFullGraph(projectId: string, versionNum: number): Promise<InfraGraphDTO> {
    const version = await this.prisma.projectVersion.findUnique({
      where: { projectId_version: { projectId, version: versionNum } },
      include: {
        nodes: { include: { catalogItem: true } },
        edges: true,
        project: { include: { owner: true } },
      },
    });

    if (!version) {
      throw new NotFoundException(`Version ${versionNum} not found for project ${projectId}`);
    }

    const nodes: InfraNode[] = version.nodes.map((n) => ({
      id: n.id,
      resourceType: n.nodeType as any,
      provider: (n.provider || 'aws') as any,
      logicalName: n.label,
      properties: (n.properties as Record<string, unknown>) || {},
      parentId: n.parentId,
      tags: {},
      visual: { x: n.positionX, y: n.positionY, width: n.width ?? undefined, height: n.height ?? undefined },
      catalogItemId: n.catalogItemId ?? undefined,
    }));

    const edges: InfraEdge[] = version.edges.map((e) => ({
      id: e.id,
      sourceId: e.sourceId,
      targetId: e.targetId,
      edgeType: e.edgeType.toLowerCase().replace('_', '-') as any,
      label: e.label ?? undefined,
      properties: (e.properties as Record<string, unknown>) || {},
    }));

    return {
      version: '1.0.0',
      projectId,
      versionNum,
      provider: 'aws',
      nodes,
      edges,
      metadata: {
        createdAt: version.createdAt.toISOString(),
        updatedAt: version.createdAt.toISOString(),
        author: version.project.owner.name,
      },
    };
  }

  /**
   * Ensure a working version exists for a project. Creates version 1 if none exists.
   */
  async ensureWorkingVersion(projectId: string): Promise<string> {
    let version = await this.prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
    });

    if (!version) {
      version = await this.prisma.projectVersion.create({
        data: { projectId, version: 1 },
      });
    }

    return version.id;
  }

  /**
   * Get all nodes for a version.
   */
  async getNodes(versionId: string) {
    return this.prisma.archNode.findMany({
      where: { versionId },
      include: { catalogItem: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get all edges for a version.
   */
  async getEdges(versionId: string) {
    return this.prisma.archEdge.findMany({
      where: { versionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Add a single node to a version.
   */
  async addNode(versionId: string, data: {
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
  }) {
    return this.prisma.archNode.create({
      data: {
        versionId,
        label: data.label,
        nodeType: data.nodeType,
        provider: data.provider,
        positionX: data.positionX,
        positionY: data.positionY,
        width: data.width,
        height: data.height,
        parentId: data.parentId,
        catalogItemId: data.catalogItemId,
        properties: (data.properties || {}) as any,
      },
    });
  }

  /**
   * Update a node's properties and/or position.
   */
  async updateNode(nodeId: string, data: {
    label?: string;
    positionX?: number;
    positionY?: number;
    width?: number;
    height?: number;
    parentId?: string;
    properties?: Record<string, unknown>;
  }) {
    return this.prisma.archNode.update({
      where: { id: nodeId },
      data: data as any,
    });
  }

  /**
   * Delete a node and its connected edges.
   */
  async deleteNode(nodeId: string) {
    // Delete connected edges first
    await this.prisma.archEdge.deleteMany({
      where: { OR: [{ sourceId: nodeId }, { targetId: nodeId }] },
    });
    return this.prisma.archNode.delete({ where: { id: nodeId } });
  }

  /**
   * Add an edge between two nodes.
   */
  async addEdge(versionId: string, data: {
    sourceId: string;
    targetId: string;
    edgeType?: string;
    label?: string;
    properties?: Record<string, unknown>;
  }) {
    return this.prisma.archEdge.create({
      data: {
        versionId,
        sourceId: data.sourceId,
        targetId: data.targetId,
        edgeType: (data.edgeType?.toUpperCase().replace('-', '_') as any) || 'NETWORK_LINK',
        label: data.label,
        properties: (data.properties || {}) as any,
      },
    });
  }

  /**
   * Delete an edge.
   */
  async deleteEdge(edgeId: string) {
    return this.prisma.archEdge.delete({ where: { id: edgeId } });
  }

  /**
   * Batch sync — applies incremental changes in a single transaction.
   * This is the primary save mechanism called by the frontend debounced sync.
   */
  async syncGraph(versionId: string, payload: GraphSyncPayload): Promise<GraphSyncResponse> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Delete removed edges
      if (payload.deletedEdgeIds.length > 0) {
        await tx.archEdge.deleteMany({
          where: { id: { in: payload.deletedEdgeIds } },
        });
      }

      // 2. Delete removed nodes (and their edges)
      if (payload.deletedNodeIds.length > 0) {
        await tx.archEdge.deleteMany({
          where: {
            OR: [
              { sourceId: { in: payload.deletedNodeIds } },
              { targetId: { in: payload.deletedNodeIds } },
            ],
          },
        });
        await tx.archNode.deleteMany({
          where: { id: { in: payload.deletedNodeIds } },
        });
      }

      // 3. Create new nodes
      for (const node of payload.addedNodes) {
        await tx.archNode.create({
          data: {
            id: node.id,
            versionId,
            label: node.logicalName,
            nodeType: node.resourceType,
            provider: node.provider,
            positionX: node.visual.x,
            positionY: node.visual.y,
            width: node.visual.width,
            height: node.visual.height,
            parentId: node.parentId,
            catalogItemId: node.catalogItemId,
            properties: node.properties as any,
          },
        });
      }

      // 4. Update modified nodes
      for (const update of payload.updatedNodes) {
        const updateData: any = {};
        if (update.changes.logicalName) updateData.label = update.changes.logicalName;
        if (update.changes.visual) {
          updateData.positionX = update.changes.visual.x;
          updateData.positionY = update.changes.visual.y;
          if (update.changes.visual.width) updateData.width = update.changes.visual.width;
          if (update.changes.visual.height) updateData.height = update.changes.visual.height;
        }
        if (update.changes.properties) updateData.properties = update.changes.properties as any;
        if (update.changes.parentId !== undefined) updateData.parentId = update.changes.parentId;

        if (Object.keys(updateData).length > 0) {
          await tx.archNode.update({
            where: { id: update.id },
            data: updateData,
          });
        }
      }

      // 5. Create new edges
      for (const edge of payload.addedEdges) {
        await tx.archEdge.create({
          data: {
            id: edge.id,
            versionId,
            sourceId: edge.sourceId,
            targetId: edge.targetId,
            edgeType: (edge.edgeType.toUpperCase().replace('-', '_') as any) || 'NETWORK_LINK',
            label: edge.label,
            properties: edge.properties as any,
          },
        });
      }
    });

    return {
      newVersion: payload.clientVersion + 1,
      conflicts: [], // No conflict resolution in v1 (last-write-wins)
    };
  }
}
