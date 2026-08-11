import type { InfraGraphDTO, GeneratedFile } from '../../common/types/infra-ir.types';
export declare class TerraformGeneratorService {
    private static readonly PROVIDER_MAP;
    generate(graph: InfraGraphDTO): GeneratedFile[];
    private resolveAll;
    private resolveProperties;
    private inferDependencies;
    private inferOutputs;
    private topologicalSort;
    private generateResourceBlock;
    private inferReferenceAttribute;
    private generateProvider;
    private generateVariables;
    private generateOutputs;
    private hclValue;
    private sanitizeName;
}
