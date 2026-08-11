import { PrismaService } from '../prisma/prisma.service';
import { GraphService } from '../graph/graph.service';
import type { ValidationReportDTO } from '../common/types/infra-ir.types';
export declare class ValidationService {
    private readonly prisma;
    private readonly graphService;
    constructor(prisma: PrismaService, graphService: GraphService);
    validateProject(projectId: string, versionNum: number): Promise<ValidationReportDTO>;
    getReports(projectId: string): Promise<({
        issues: {
            id: string;
            nodeId: string | null;
            edgeId: string | null;
            severity: import("@prisma/client").$Enums.IssueSeverity;
            ruleCode: string;
            message: string;
            suggestion: string | null;
            reportId: string;
        }[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ValidationStatus;
        projectId: string;
        versionNum: number;
        summary: string | null;
        executedAt: Date;
    })[]>;
    private generateSummary;
}
