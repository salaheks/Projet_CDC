import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.project.findMany();
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { state: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async saveState(id: string, canvasData: any) {
    return this.prisma.projectState.upsert({
      where: { projectId: id },
      update: { canvasData },
      create: {
        projectId: id,
        canvasData,
      },
    });
  }
}
