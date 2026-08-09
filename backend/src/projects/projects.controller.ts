import { Controller, Get, Param, Put, Body } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id/state')
  saveState(@Param('id') id: string, @Body() body: any) {
    return this.projectsService.saveState(id, body.canvasData);
  }
}
