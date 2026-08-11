import type { InfraNode, InfraEdge, ValidationIssueDTO } from '../../common/types/infra-ir.types';

/**
 * Interface that all validation rules must implement.
 * This is the extension point for adding new rules to the engine.
 */
export interface ValidationRule {
  /** Unique identifier (e.g., "SEC-001", "NET-003") */
  code: string;

  /** Human-readable name */
  name: string;

  /** Category: "security" | "network" | "architecture" | "performance" */
  category: string;

  /** Default severity */
  defaultSeverity: 'ERROR' | 'WARNING' | 'INFO';

  /**
   * Execute validation on the full graph.
   * @param nodes - All nodes in the version
   * @param edges - All edges in the version
   * @returns List of detected issues
   */
  validate(nodes: InfraNode[], edges: InfraEdge[]): ValidationIssueDTO[];
}
