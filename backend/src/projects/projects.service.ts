import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    const where = userId ? { ownerId: userId } : undefined;
    return this.prisma.project.findMany({
      where,
      include: { owner: { select: { id: true, name: true, email: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        versions: { orderBy: { version: 'desc' }, take: 5 },
        settings: true,
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(data: { name: string; description?: string; ownerId: string; provider?: string }) {
    const project = await this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        settings: {
          create: {
            defaultCloudProvider: data.provider ?? 'aws',
          },
        },
      },
      include: { settings: true },
    });

    // Create initial version (v1)
    await this.prisma.projectVersion.create({
      data: {
        projectId: project.id,
        version: 1,
        label: 'Version initiale',
      },
    });

    return project;
  }

  async update(id: string, data: { name?: string; description?: string; status?: any }) {
    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }

  /**
   * Get the latest version number for a project.
   */
  async getLatestVersion(projectId: string): Promise<number> {
    const latest = await this.prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
    });
    return latest?.version ?? 0;
  }

  /**
   * Create a new version (snapshot).
   */
  async createVersion(projectId: string, label?: string) {
    const latestVersion = await this.getLatestVersion(projectId);
    const newVersion = latestVersion + 1;

    return this.prisma.projectVersion.create({
      data: {
        projectId,
        version: newVersion,
        label: label ?? `v${newVersion}`,
      },
    });
  }
}
