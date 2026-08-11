"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GraphService = class GraphService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFullGraph(projectId, versionNum) {
        const version = await this.prisma.projectVersion.findUnique({
            where: { projectId_version: { projectId, version: versionNum } },
            include: {
                nodes: { include: { catalogItem: true } },
                edges: true,
                project: { include: { owner: true } },
            },
        });
        if (!version) {
            throw new common_1.NotFoundException(`Version ${versionNum} not found for project ${projectId}`);
        }
        const nodes = version.nodes.map((n) => ({
            id: n.id,
            resourceType: n.nodeType,
            provider: (n.provider || 'aws'),
            logicalName: n.label,
            properties: n.properties || {},
            parentId: n.parentId,
            tags: {},
            visual: { x: n.positionX, y: n.positionY, width: n.width ?? undefined, height: n.height ?? undefined },
            catalogItemId: n.catalogItemId ?? undefined,
        }));
        const edges = version.edges.map((e) => ({
            id: e.id,
            sourceId: e.sourceId,
            targetId: e.targetId,
            edgeType: e.edgeType.toLowerCase().replace('_', '-'),
            label: e.label ?? undefined,
            properties: e.properties || {},
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
    async ensureWorkingVersion(projectId) {
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
    async getNodes(versionId) {
        return this.prisma.archNode.findMany({
            where: { versionId },
            include: { catalogItem: true },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getEdges(versionId) {
        return this.prisma.archEdge.findMany({
            where: { versionId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async addNode(versionId, data) {
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
                properties: (data.properties || {}),
            },
        });
    }
    async updateNode(nodeId, data) {
        return this.prisma.archNode.update({
            where: { id: nodeId },
            data: data,
        });
    }
    async deleteNode(nodeId) {
        await this.prisma.archEdge.deleteMany({
            where: { OR: [{ sourceId: nodeId }, { targetId: nodeId }] },
        });
        return this.prisma.archNode.delete({ where: { id: nodeId } });
    }
    async addEdge(versionId, data) {
        return this.prisma.archEdge.create({
            data: {
                versionId,
                sourceId: data.sourceId,
                targetId: data.targetId,
                edgeType: data.edgeType?.toUpperCase().replace('-', '_') || 'NETWORK_LINK',
                label: data.label,
                properties: (data.properties || {}),
            },
        });
    }
    async deleteEdge(edgeId) {
        return this.prisma.archEdge.delete({ where: { id: edgeId } });
    }
    async syncGraph(versionId, payload) {
        await this.prisma.$transaction(async (tx) => {
            if (payload.deletedEdgeIds.length > 0) {
                await tx.archEdge.deleteMany({
                    where: { id: { in: payload.deletedEdgeIds } },
                });
            }
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
                        properties: node.properties,
                    },
                });
            }
            for (const update of payload.updatedNodes) {
                const updateData = {};
                if (update.changes.logicalName)
                    updateData.label = update.changes.logicalName;
                if (update.changes.visual) {
                    updateData.positionX = update.changes.visual.x;
                    updateData.positionY = update.changes.visual.y;
                    if (update.changes.visual.width)
                        updateData.width = update.changes.visual.width;
                    if (update.changes.visual.height)
                        updateData.height = update.changes.visual.height;
                }
                if (update.changes.properties)
                    updateData.properties = update.changes.properties;
                if (update.changes.parentId !== undefined)
                    updateData.parentId = update.changes.parentId;
                if (Object.keys(updateData).length > 0) {
                    await tx.archNode.update({
                        where: { id: update.id },
                        data: updateData,
                    });
                }
            }
            for (const edge of payload.addedEdges) {
                await tx.archEdge.create({
                    data: {
                        id: edge.id,
                        versionId,
                        sourceId: edge.sourceId,
                        targetId: edge.targetId,
                        edgeType: edge.edgeType.toUpperCase().replace('-', '_') || 'NETWORK_LINK',
                        label: edge.label,
                        properties: edge.properties,
                    },
                });
            }
        });
        return {
            newVersion: payload.clientVersion + 1,
            conflicts: [],
        };
    }
};
exports.GraphService = GraphService;
exports.GraphService = GraphService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GraphService);
//# sourceMappingURL=graph.service.js.map