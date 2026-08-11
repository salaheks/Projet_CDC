import type { InfraGraphDTO } from '../common/types/infra-ir.types';
export declare class AiService {
    private readonly logger;
    private genAI;
    private model;
    constructor();
    auditArchitecture(graph: InfraGraphDTO): Promise<any>;
    suggestNextComponents(graph: InfraGraphDTO): Promise<any>;
}
