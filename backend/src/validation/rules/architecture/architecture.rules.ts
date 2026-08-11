import type { InfraNode, InfraEdge, ValidationIssueDTO } from '../../../common/types/infra-ir.types';
import type { ValidationRule } from '../rule.interface';

/**
 * ARCH-001: Single Point of Failure — compute receiving direct traffic without a load balancer.
 */
export class SinglePointOfFailureRule implements ValidationRule {
  code = 'ARCH-001';
  name = 'Point de défaillance unique (SPOF)';
  category = 'architecture';
  defaultSeverity = 'WARNING' as const;

  validate(nodes: InfraNode[], edges: InfraEdge[]): ValidationIssueDTO[] {
    const issues: ValidationIssueDTO[] = [];
    const computes = nodes.filter((n) => n.resourceType === 'virtual-machine');
    const lbTargets = new Set(
      edges.filter((e) => e.edgeType === 'load-balances').map((e) => e.targetId),
    );

    for (const vm of computes) {
      if (lbTargets.has(vm.id)) continue;

      const hasIncomingTraffic = edges.some(
        (e) =>
          e.targetId === vm.id &&
          (e.edgeType === 'network-link' || e.edgeType === 'routes-to'),
      );

      if (hasIncomingTraffic) {
        issues.push({
          severity: this.defaultSeverity,
          ruleCode: this.code,
          message: `Le serveur "${vm.logicalName}" reçoit du trafic direct sans Load Balancer — SPOF.`,
          nodeId: vm.id,
          suggestion:
            'Ajoutez un Load Balancer devant ce serveur et dupliquez-le dans une autre AZ pour la haute disponibilité.',
        });
      }
    }

    return issues;
  }
}

/**
 * ARCH-002: Orphan node — no incoming or outgoing connections.
 */
export class OrphanNodeRule implements ValidationRule {
  code = 'ARCH-002';
  name = 'Composant orphelin (isolé)';
  category = 'architecture';
  defaultSeverity = 'WARNING' as const;

  validate(nodes: InfraNode[], edges: InfraEdge[]): ValidationIssueDTO[] {
    const issues: ValidationIssueDTO[] = [];
    const connectedNodes = new Set<string>();

    for (const edge of edges) {
      connectedNodes.add(edge.sourceId);
      connectedNodes.add(edge.targetId);
    }

    // Only flag meaningful resource types, not containers like VPC
    const meaningfulTypes = new Set([
      'virtual-machine',
      'relational-database',
      'load-balancer',
      'container-cluster',
      'serverless-function',
      'physical-server',
    ]);

    for (const node of nodes) {
      if (!meaningfulTypes.has(node.resourceType)) continue;
      // Also exclude nodes that have children (they're containers)
      const hasChildren = nodes.some((n) => n.parentId === node.id);
      if (hasChildren) continue;

      if (!connectedNodes.has(node.id)) {
        issues.push({
          severity: this.defaultSeverity,
          ruleCode: this.code,
          message: `Le composant "${node.logicalName}" (${node.resourceType}) est isolé : aucune connexion.`,
          nodeId: node.id,
          suggestion:
            'Connectez ce composant au réseau ou supprimez-le s\'il n\'est pas nécessaire.',
        });
      }
    }

    return issues;
  }
}
