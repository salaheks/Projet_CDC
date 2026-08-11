import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { IaCFormat } from '../common/types/infra-ir.types';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post(':projectId/:versionNum/:format')
  generateIaC(
    @Param('projectId') projectId: string,
    @Param('versionNum') versionNum: string,
    @Param('format') format: string,
  ) {
    return this.exportService.generateIaC(
      projectId,
      parseInt(versionNum, 10),
      format as IaCFormat,
    );
  }

  @Get(':projectId/:versionNum/json')
  exportJSON(
    @Param('projectId') projectId: string,
    @Param('versionNum') versionNum: string,
  ) {
    return this.exportService.exportJSON(
      projectId,
      parseInt(versionNum, 10),
    );
  }
}
