import type { InfraNode, InfraEdge, ValidationIssueDTO } from '../../../common/types/infra-ir.types';
import type { ValidationRule } from '../rule.interface';
export declare class CidrOverlapRule implements ValidationRule {
    code: string;
    name: string;
    category: string;
    defaultSeverity: "ERROR";
    validate(nodes: InfraNode[], _edges: InfraEdge[]): ValidationIssueDTO[];
    static cidrsOverlap(cidrA: string, cidrB: string): boolean;
    static cidrToRange(cidr: string): [number, number];
    static ipToInt(ip: string): number;
    static isSubnetOfVpc(subnetCidr: string, vpcCidr: string): boolean;
}
export declare class MissingNatRule implements ValidationRule {
    code: string;
    name: string;
    category: string;
    defaultSeverity: "WARNING";
    validate(nodes: InfraNode[], edges: InfraEdge[]): ValidationIssueDTO[];
}
export declare class RoutingLoopRule implements ValidationRule {
    code: string;
    name: string;
    category: string;
    defaultSeverity: "ERROR";
    validate(nodes: InfraNode[], edges: InfraEdge[]): ValidationIssueDTO[];
    private dfsVisit;
    private reconstructCycle;
}
export declare class SubnetOutsideVpcRule implements ValidationRule {
    code: string;
    name: string;
    category: string;
    defaultSeverity: "ERROR";
    validate(nodes: InfraNode[], _edges: InfraEdge[]): ValidationIssueDTO[];
}
