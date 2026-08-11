import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { GraphService } from './graph.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { GraphSyncPayload } from '../common/types/infra-ir.types';

@Controller('graph')
@UseGuards(JwtAuthGuard)
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  // ── Full graph retrieval ──

  @Get('project/:projectId/version/:versionNum')
  getFullGraph(
    @Param('projectId') projectId: string,
    @Param('versionNum') versionNum: string,
  ) {
    return this.graphService.getFullGraph(projectId, parseInt(versionNum, 10));
  }

  // ── Nodes ──

  @Get(':versionId/nodes')
  getNodes(@Param('versionId') versionId: string) {
    return this.graphService.getNodes(versionId);
  }

  @Post(':versionId/nodes')
  addNode(
    @Param('versionId') versionId: string,
    @Body()
    body: {
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
    },
  ) {
    return this.graphService.addNode(versionId, body);
  }

  @Put('nodes/:nodeId')
  updateNode(
    @Param('nodeId') nodeId: string,
    @Body()
    body: {
      label?: string;
      positionX?: number;
      positionY?: number;
      width?: number;
      height?: number;
      parentId?: string;
      properties?: Record<string, unknown>;
    },
  ) {
    return this.graphService.updateNode(nodeId, body);
  }

  @Delete('nodes/:nodeId')
  deleteNode(@Param('nodeId') nodeId: string) {
    return this.graphService.deleteNode(nodeId);
  }

  // ── Edges ──

  @Get(':versionId/edges')
  getEdges(@Param('versionId') versionId: string) {
    return this.graphService.getEdges(versionId);
  }

  @Post(':versionId/edges')
  addEdge(
    @Param('versionId') versionId: string,
    @Body()
    body: {
      sourceId: string;
      targetId: string;
      edgeType?: string;
      label?: string;
      properties?: Record<string, unknown>;
    },
  ) {
    return this.graphService.addEdge(versionId, body);
  }

  @Delete('edges/:edgeId')
  deleteEdge(@Param('edgeId') edgeId: string) {
    return this.graphService.deleteEdge(edgeId);
  }

  // ── Batch sync ──

  @Put(':versionId/sync')
  syncGraph(
    @Param('versionId') versionId: string,
    @Body() payload: GraphSyncPayload,
  ) {
    return this.graphService.syncGraph(versionId, payload);
  }
}
