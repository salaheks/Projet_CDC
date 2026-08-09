import { PrismaService } from '../prisma/prisma.service';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    saveState(id: string, canvasData: any): Promise<{
        id: string;
        updatedAt: Date;
        projectId: string;
        canvasData: import("@prisma/client/runtime/client").JsonValue;
    }>;
}
