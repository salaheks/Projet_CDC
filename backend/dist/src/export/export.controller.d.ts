import { ExportService } from './export.service';
export declare class ExportController {
    private readonly exportService;
    constructor(exportService: ExportService);
    generateIaC(projectId: string, versionNum: string, format: string): Promise<import("../common/types/infra-ir.types").GeneratedFile[]>;
    exportJSON(projectId: string, versionNum: string): Promise<import("../common/types/infra-ir.types").GeneratedFile[]>;
}
