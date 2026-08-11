import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('validation')
@UseGuards(JwtAuthGuard)
export class ValidationController {
  constructor(private readonly validationService: ValidationService) {}

  @Post(':projectId/:versionNum')
  validate(
    @Param('projectId') projectId: string,
    @Param('versionNum') versionNum: string,
  ) {
    return this.validationService.validateProject(
      projectId,
      parseInt(versionNum, 10),
    );
  }

  @Get(':projectId/reports')
  getReports(@Param('projectId') projectId: string) {
    return this.validationService.getReports(projectId);
  }
}
