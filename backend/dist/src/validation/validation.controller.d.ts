import { ValidationService } from './validation.service';
export declare class ValidationController {
    private readonly validationService;
    constructor(validationService: ValidationService);
    validate(projectId: string, versionNum: string): Promise<import("../common/types/infra-ir.types").ValidationReportDTO>;
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
}
