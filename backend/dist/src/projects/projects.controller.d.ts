import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    findAll(userId: string): Promise<({
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
    create(userId: string, body: {
        name: string;
        description?: string;
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
    update(id: string, body: {
        name?: string;
        description?: string;
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
    createVersion(id: string, body: {
        label?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        version: number;
        label: string | null;
        snapshot: import("@prisma/client/runtime/client").JsonValue | null;
        projectId: string;
    }>;
}
