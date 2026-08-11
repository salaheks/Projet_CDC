import { AiService } from './ai.service';
import { GraphService } from '../graph/graph.service';
export declare class AiController {
    private readonly aiService;
    private readonly graphService;
    constructor(aiService: AiService, graphService: GraphService);
    auditArchitecture(projectId: string, versionNum: string): Promise<any>;
    suggestComponents(projectId: string, versionNum: string): Promise<any>;
}
