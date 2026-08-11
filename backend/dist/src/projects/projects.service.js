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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        const where = userId ? { ownerId: userId } : undefined;
        return this.prisma.project.findMany({
            where,
            include: { owner: { select: { id: true, name: true, email: true } } },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findOne(id) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, name: true, email: true } },
                versions: { orderBy: { version: 'desc' }, take: 5 },
                settings: true,
            },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return project;
    }
    async create(data) {
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
        await this.prisma.projectVersion.create({
            data: {
                projectId: project.id,
                version: 1,
                label: 'Version initiale',
            },
        });
        return project;
    }
    async update(id, data) {
        return this.prisma.project.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return this.prisma.project.delete({ where: { id } });
    }
    async getLatestVersion(projectId) {
        const latest = await this.prisma.projectVersion.findFirst({
            where: { projectId },
            orderBy: { version: 'desc' },
        });
        return latest?.version ?? 0;
    }
    async createVersion(projectId, label) {
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
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map