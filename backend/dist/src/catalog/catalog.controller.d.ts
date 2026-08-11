import { CatalogService } from './catalog.service';
export declare class CatalogController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    findAll(provider?: string): Promise<{
        id: string;
        name: string;
        icon: string | null;
        provider: string | null;
        components: {
            id: string;
            categoryId: string;
            categoryName: string;
            name: string;
            type: string;
            provider: string;
            description: string | null;
            icon: string | null;
            propertySchema: any;
        }[];
    }[]>;
    search(query: string): Promise<({
        category: {
            name: string;
            id: string;
            icon: string | null;
            provider: string | null;
            sortOrder: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        icon: string | null;
        provider: string;
        categoryId: string;
        type: string;
        propertySchema: import("@prisma/client/runtime/client").JsonValue;
        terraformTemplate: string | null;
        ansibleTemplate: string | null;
        defaultPorts: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
    findOne(id: string): Promise<({
        category: {
            name: string;
            id: string;
            icon: string | null;
            provider: string | null;
            sortOrder: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        icon: string | null;
        provider: string;
        categoryId: string;
        type: string;
        propertySchema: import("@prisma/client/runtime/client").JsonValue;
        terraformTemplate: string | null;
        ansibleTemplate: string | null;
        defaultPorts: import("@prisma/client/runtime/client").JsonValue | null;
    }) | null>;
}
