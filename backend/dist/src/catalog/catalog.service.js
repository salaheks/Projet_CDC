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
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CatalogService = class CatalogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(provider) {
        const where = provider
            ? { components: { some: { provider } } }
            : undefined;
        const categories = await this.prisma.catalogCategory.findMany({
            where,
            include: {
                components: {
                    where: provider ? { provider } : undefined,
                    orderBy: { name: 'asc' },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });
        return categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            provider: cat.provider,
            components: cat.components.map((comp) => ({
                id: comp.id,
                categoryId: comp.categoryId,
                categoryName: cat.name,
                name: comp.name,
                type: comp.type,
                provider: comp.provider,
                description: comp.description,
                icon: comp.icon,
                propertySchema: typeof comp.propertySchema === 'string'
                    ? JSON.parse(comp.propertySchema)
                    : comp.propertySchema,
            })),
        }));
    }
    async findOne(id) {
        return this.prisma.catalogComponent.findUnique({
            where: { id },
            include: { category: true },
        });
    }
    async search(query) {
        return this.prisma.catalogComponent.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { type: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
            include: { category: true },
        });
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map