import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all categories with their components, optionally filtered by provider.
   */
  async findAll(provider?: string) {
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
        propertySchema:
          typeof comp.propertySchema === 'string'
            ? JSON.parse(comp.propertySchema)
            : comp.propertySchema,
      })),
    }));
  }

  /**
   * Get a single component by ID with its property schema.
   */
  async findOne(id: string) {
    return this.prisma.catalogComponent.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  /**
   * Search components by name or type.
   */
  async search(query: string) {
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
}
