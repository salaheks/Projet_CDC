import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { GraphService } from '../graph/graph.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly graphService: GraphService,
  ) {}

  @Post('audit/:projectId/:versionNum')
  async auditArchitecture(
    @Param('projectId') projectId: string,
    @Param('versionNum') versionNum: string,
  ) {
    const graph = await this.graphService.getFullGraph(projectId, parseInt(versionNum, 10));
    return this.aiService.auditArchitecture(graph);
  }

  @Post('suggest/:projectId/:versionNum')
  async suggestComponents(
    @Param('projectId') projectId: string,
    @Param('versionNum') versionNum: string,
  ) {
    const graph = await this.graphService.getFullGraph(projectId, parseInt(versionNum, 10));
    return this.aiService.suggestNextComponents(graph);
  }
}
