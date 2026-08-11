import type { InfraNode, InfraEdge, ValidationIssueDTO } from '../../../common/types/infra-ir.types';
import type { ValidationRule } from '../rule.interface';
export declare class SshOpenToWorldRule implements ValidationRule {
    code: string;
    name: string;
    category: string;
    defaultSeverity: "ERROR";
    validate(nodes: InfraNode[], _edges: InfraEdge[]): ValidationIssueDTO[];
}
export declare class ComputeWithoutSgRule implements ValidationRule {
    code: string;
    name: string;
    category: string;
    defaultSeverity: "ERROR";
    validate(nodes: InfraNode[], edges: InfraEdge[]): ValidationIssueDTO[];
}
export declare class PublicDatabaseRule implements ValidationRule {
    code: string;
    name: string;
    category: string;
    defaultSeverity: "ERROR";
    validate(nodes: InfraNode[], _edges: InfraEdge[]): ValidationIssueDTO[];
}
