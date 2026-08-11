import type { InfraNode, InfraEdge, ValidationIssueDTO } from '../../common/types/infra-ir.types';
export interface ValidationRule {
    code: string;
    name: string;
    category: string;
    defaultSeverity: 'ERROR' | 'WARNING' | 'INFO';
    validate(nodes: InfraNode[], edges: InfraEdge[]): ValidationIssueDTO[];
}
