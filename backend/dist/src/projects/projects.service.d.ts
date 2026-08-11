import { PrismaService } from '../prisma/prisma.service';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId?: string): Promise<({
        owner: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
        status: import("@prisma/client").$Enums.ProjectStatus;
    })[]>;
    findOne(id: string): Promise<{
        owner: {
            name: string;
            email: string;
            id: string;
        };
        versions: {
            id: string;
            createdAt: Date;
            version: number;
            label: string | null;
            snapshot: import("@prisma/client/runtime/client").JsonValue | null;
            projectId: string;
        }[];
        settings: {
            id: string;
            defaultCloudProvider: string | null;
            autoValidate: boolean;
            autoSaveInterval: number;
            projectId: string;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
        status: import("@prisma/client").$Enums.ProjectStatus;
    }>;
    create(data: {
        name: string;
        description?: string;
        ownerId: string;
        provider?: string;
    }): Promise<{
        settings: {
            id: string;
            defaultCloudProvider: string | null;
            autoValidate: boolean;
            autoSaveInterval: number;
            projectId: string;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
        status: import("@prisma/client").$Enums.ProjectStatus;
    }>;
    update(id: string, data: {
        name?: string;
        description?: string;
        status?: any;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
        status: import("@prisma/client").$Enums.ProjectStatus;
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
        status: import("@prisma/client").$Enums.ProjectStatus;
    }>;
    getLatestVersion(projectId: string): Promise<number>;
    createVersion(projectId: string, label?: string): Promise<{
        id: string;
        createdAt: Date;
        version: number;
        label: string | null;
        snapshot: import("@prisma/client/runtime/client").JsonValue | null;
        projectId: string;
    }>;
}
