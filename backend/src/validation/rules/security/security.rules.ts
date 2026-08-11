import type { InfraNode, InfraEdge, ValidationIssueDTO } from '../../../common/types/infra-ir.types';
import type { ValidationRule } from '../rule.interface';

/**
 * SEC-001: SSH (port 22) open to the world (0.0.0.0/0).
 */
export class SshOpenToWorldRule implements ValidationRule {
  code = 'SEC-001';
  name = 'SSH ouvert sur Internet';
  category = 'security';
  defaultSeverity = 'ERROR' as const;

  validate(nodes: InfraNode[], _edges: InfraEdge[]): ValidationIssueDTO[] {
    const issues: ValidationIssueDTO[] = [];
    const securityGroups = nodes.filter(
      (n) => n.resourceType === 'security-group' || n.resourceType === 'firewall',
    );

    for (const sg of securityGroups) {
      const ingressRules = (sg.properties.ingressRules as any[]) || [];
      for (const rule of ingressRules) {
        if (
          rule.port === 22 &&
          (rule.source === '0.0.0.0/0' || rule.source === '::/0') &&
          rule.action === 'allow'
        ) {
          issues.push({
            severity: this.defaultSeverity,
            ruleCode: this.code,
            message: `Le Security Group "${sg.logicalName}" autorise SSH (port 22) depuis 0.0.0.0/0.`,
            nodeId: sg.id,
            suggestion:
              'Restreignez la source à un CIDR spécifique ou utilisez un bastion host / SSM Session Manager.',
          });
        }
      }
    }

    return issues;
  }
}

/**
 * SEC-002: Compute resource without any Security Group or Firewall.
 */
export class ComputeWithoutSgRule implements ValidationRule {
  code = 'SEC-002';
  name = 'Ressource compute sans protection';
  category = 'security';
  defaultSeverity = 'ERROR' as const;

  validate(nodes: InfraNode[], edges: InfraEdge[]): ValidationIssueDTO[] {
    const issues: ValidationIssueDTO[] = [];
    const computeTypes = new Set([
      'virtual-machine',
      'container-cluster',
      'serverless-function',
      'physical-server',
    ]);
    const computeNodes = nodes.filter((n) => computeTypes.has(n.resourceType));

    for (const compute of computeNodes) {
      const isSecured = edges.some(
        (e) => e.targetId === compute.id && e.edgeType === 'secures',
      );

      if (!isSecured) {
        issues.push({
          severity: this.defaultSeverity,
          ruleCode: this.code,
          message: `La ressource "${compute.logicalName}" (${compute.resourceType}) n'est protégée par aucun Security Group ou Firewall.`,
          nodeId: compute.id,
          suggestion:
            'Ajoutez un Security Group et connectez-le à cette ressource avec une liaison de type "secures".',
        });
      }
    }

    return issues;
  }
}

/**
 * SEC-003: Database in a public subnet.
 */
export class PublicDatabaseRule implements ValidationRule {
  code = 'SEC-003';
  name = 'Base de données dans un subnet public';
  category = 'security';
  defaultSeverity = 'ERROR' as const;

  validate(nodes: InfraNode[], _edges: InfraEdge[]): ValidationIssueDTO[] {
    const issues: ValidationIssueDTO[] = [];
    const dbTypes = new Set(['relational-database', 'nosql-database']);
    const databases = nodes.filter((n) => dbTypes.has(n.resourceType));

    for (const db of databases) {
      const parentSubnet = nodes.find(
        (n) => n.id === db.parentId && n.resourceType === 'subnet',
      );
      if (parentSubnet && parentSubnet.properties.isPublic === true) {
        issues.push({
          severity: this.defaultSeverity,
          ruleCode: this.code,
          message: `La base de données "${db.logicalName}" est dans un subnet public ("${parentSubnet.logicalName}").`,
          nodeId: db.id,
          suggestion:
            'Déplacez la base de données dans un subnet privé pour éviter toute exposition directe à Internet.',
        });
      }
    }

    return issues;
  }
}
