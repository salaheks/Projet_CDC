import type { InfraNode, InfraEdge, ValidationIssueDTO } from '../../../common/types/infra-ir.types';
import type { ValidationRule } from '../rule.interface';
export declare class SinglePointOfFailureRule implements ValidationRule {
    code: string;
    name: string;
    category: string;
    defaultSeverity: "WARNING";
    validate(nodes: InfraNode[], edges: InfraEdge[]): ValidationIssueDTO[];
}
export declare class OrphanNodeRule implements ValidationRule {
    code: string;
    name: string;
    category: string;
    defaultSeverity: "WARNING";
    validate(nodes: InfraNode[], edges: InfraEdge[]): ValidationIssueDTO[];
}
