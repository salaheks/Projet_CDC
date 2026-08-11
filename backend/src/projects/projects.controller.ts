import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.projectsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() body: { name: string; description?: string; provider?: string },
  ) {
    return this.projectsService.create({ ...body, ownerId: userId });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.projectsService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }

  @Post(':id/versions')
  createVersion(
    @Param('id') id: string,
    @Body() body: { label?: string },
  ) {
    return this.projectsService.createVersion(id, body.label);
  }
}
