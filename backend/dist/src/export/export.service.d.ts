import { GraphService } from '../graph/graph.service';
import { TerraformGeneratorService } from './generators/terraform.generator';
import type { GeneratedFile, IaCFormat } from '../common/types/infra-ir.types';
export declare class ExportService {
    private readonly graphService;
    private readonly terraformGenerator;
    constructor(graphService: GraphService, terraformGenerator: TerraformGeneratorService);
    generateIaC(projectId: string, versionNum: number, format: IaCFormat): Promise<GeneratedFile[]>;
    exportJSON(projectId: string, versionNum: number): Promise<GeneratedFile[]>;
    private generateAnsibleStub;
}
