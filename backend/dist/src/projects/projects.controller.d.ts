import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    findAll(): Promise<{
        id: string;
        name: string;
        description: string | null;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        state: {
            id: string;
            updatedAt: Date;
            projectId: string;
            canvasData: import("@prisma/client/runtime/client").JsonValue;
        } | null;
    } & {
        id: string;
        name: string;
        description: string | null;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    saveState(id: string, body: any): Promise<{
        id: string;
        updatedAt: Date;
        projectId: string;
        canvasData: import("@prisma/client/runtime/client").JsonValue;
    }>;
}
