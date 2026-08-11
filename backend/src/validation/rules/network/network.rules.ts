import type { InfraNode, InfraEdge, ValidationIssueDTO } from '../../../common/types/infra-ir.types';
import type { ValidationRule } from '../rule.interface';

/**
 * NET-001: Detects overlapping CIDR blocks within the same VPC.
 */
export class CidrOverlapRule implements ValidationRule {
  code = 'NET-001';
  name = 'Chevauchement de sous-réseaux CIDR';
  category = 'network';
  defaultSeverity = 'ERROR' as const;

  validate(nodes: InfraNode[], _edges: InfraEdge[]): ValidationIssueDTO[] {
    const issues: ValidationIssueDTO[] = [];
    const subnets = nodes.filter((n) => n.resourceType === 'subnet');

    for (let i = 0; i < subnets.length; i++) {
      for (let j = i + 1; j < subnets.length; j++) {
        // Only compare subnets within the same VPC
        if (subnets[i].parentId !== subnets[j].parentId) continue;

        const cidrA = subnets[i].properties.cidr as string;
        const cidrB = subnets[j].properties.cidr as string;

        if (cidrA && cidrB && CidrOverlapRule.cidrsOverlap(cidrA, cidrB)) {
          issues.push({
            severity: this.defaultSeverity,
            ruleCode: this.code,
            message: `Chevauchement CIDR : "${subnets[i].logicalName}" (${cidrA}) et "${subnets[j].logicalName}" (${cidrB}) dans le même VPC.`,
            nodeId: subnets[i].id,
            suggestion:
              'Utilisez des plages CIDR disjointes au sein du même VPC.',
          });
        }
      }
    }

    return issues;
  }

  // ── CIDR math utilities ──

  static cidrsOverlap(cidrA: string, cidrB: string): boolean {
    const [startA, endA] = CidrOverlapRule.cidrToRange(cidrA);
    const [startB, endB] = CidrOverlapRule.cidrToRange(cidrB);
    return startA <= endB && startB <= endA;
  }

  static cidrToRange(cidr: string): [number, number] {
    const [ip, prefixStr] = cidr.split('/');
    const prefix = parseInt(prefixStr, 10);
    const ipNum = CidrOverlapRule.ipToInt(ip);
    const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    const network = (ipNum & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    return [network, broadcast];
  }

  static ipToInt(ip: string): number {
    return (
      ip
        .split('.')
        .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
    );
  }

  static isSubnetOfVpc(subnetCidr: string, vpcCidr: string): boolean {
    const [subStart, subEnd] = CidrOverlapRule.cidrToRange(subnetCidr);
    const [vpcStart, vpcEnd] = CidrOverlapRule.cidrToRange(vpcCidr);
    return subStart >= vpcStart && subEnd <= vpcEnd;
  }
}

/**
 * NET-002: Private subnet without NAT Gateway route.
 */
export class MissingNatRule implements ValidationRule {
  code = 'NET-002';
  name = 'Sous-réseau privé sans passerelle NAT';
  category = 'network';
  defaultSeverity = 'WARNING' as const;

  validate(nodes: InfraNode[], edges: InfraEdge[]): ValidationIssueDTO[] {
    const issues: ValidationIssueDTO[] = [];
    const privateSubnets = nodes.filter(
      (n) => n.resourceType === 'subnet' && !n.properties.isPublic,
    );

    for (const subnet of privateSubnets) {
      const hasNatRoute = edges.some((e) => {
        if (e.sourceId !== subnet.id || e.edgeType !== 'routes-to') return false;
        const target = nodes.find((n) => n.id === e.targetId);
        return target?.resourceType === 'nat-gateway';
      });

      if (!hasNatRoute) {
        issues.push({
          severity: this.defaultSeverity,
          ruleCode: this.code,
          message: `Le sous-réseau privé "${subnet.logicalName}" n'a aucune route vers une passerelle NAT. Les instances ne pourront pas accéder à internet.`,
          nodeId: subnet.id,
          suggestion:
            'Ajoutez un NAT Gateway dans un subnet public et créez une route depuis ce subnet privé.',
        });
      }
    }

    return issues;
  }
}

/**
 * NET-003: Routing loop detection via DFS with 3-color marking.
 */
export class RoutingLoopRule implements ValidationRule {
  code = 'NET-003';
  name = 'Boucle de routage détectée';
  category = 'network';
  defaultSeverity = 'ERROR' as const;

  validate(nodes: InfraNode[], edges: InfraEdge[]): ValidationIssueDTO[] {
    const routingEdges = edges.filter(
      (e) => e.edgeType === 'routes-to' || e.edgeType === 'network-link',
    );

    // Build adjacency list
    const adjacency = new Map<string, string[]>();
    for (const node of nodes) {
      adjacency.set(node.id, []);
    }
    for (const edge of routingEdges) {
      adjacency.get(edge.sourceId)?.push(edge.targetId);
    }

    // DFS with 3-color marking
    const WHITE = 0,
      GRAY = 1,
      BLACK = 2;
    const color = new Map<string, number>();
    const parent = new Map<string, string | null>();

    for (const node of nodes) {
      color.set(node.id, WHITE);
      parent.set(node.id, null);
    }

    for (const node of nodes) {
      if (color.get(node.id) === WHITE) {
        const cyclePath = this.dfsVisit(
          node.id,
          adjacency,
          color,
          parent,
          nodes,
        );
        if (cyclePath) {
          return [
            {
              severity: this.defaultSeverity,
              ruleCode: this.code,
              message: `Boucle de routage détectée : ${cyclePath.join(' → ')}`,
              suggestion:
                'Vérifiez les tables de routage pour éliminer le chemin circulaire.',
            },
          ];
        }
      }
    }

    return [];
  }

  private dfsVisit(
    nodeId: string,
    adjacency: Map<string, string[]>,
    color: Map<string, number>,
    parent: Map<string, string | null>,
    nodes: InfraNode[],
  ): string[] | null {
    const GRAY = 1,
      BLACK = 2;
    color.set(nodeId, GRAY);

    for (const neighborId of adjacency.get(nodeId) || []) {
      if (color.get(neighborId) === GRAY) {
        return this.reconstructCycle(nodeId, neighborId, parent, nodes);
      }
      if (color.get(neighborId) === 0) {
        parent.set(neighborId, nodeId);
        const result = this.dfsVisit(
          neighborId,
          adjacency,
          color,
          parent,
          nodes,
        );
        if (result) return result;
      }
    }

    color.set(nodeId, BLACK);
    return null;
  }

  private reconstructCycle(
    from: string,
    to: string,
    parent: Map<string, string | null>,
    nodes: InfraNode[],
  ): string[] {
    const nameOf = (id: string) =>
      nodes.find((n) => n.id === id)?.logicalName ?? id;
    const path: string[] = [nameOf(to)];
    let current: string | null = from;
    while (current && current !== to) {
      path.unshift(nameOf(current));
      current = parent.get(current) ?? null;
    }
    path.unshift(nameOf(to));
    return path;
  }
}

/**
 * NET-004: Subnet CIDR outside parent VPC range.
 */
export class SubnetOutsideVpcRule implements ValidationRule {
  code = 'NET-004';
  name = 'Subnet hors plage du VPC';
  category = 'network';
  defaultSeverity = 'ERROR' as const;

  validate(nodes: InfraNode[], _edges: InfraEdge[]): ValidationIssueDTO[] {
    const issues: ValidationIssueDTO[] = [];
    const subnets = nodes.filter((n) => n.resourceType === 'subnet');

    for (const subnet of subnets) {
      const vpc = nodes.find(
        (n) => n.id === subnet.parentId && n.resourceType === 'vpc',
      );
      if (!vpc) continue;

      const subCidr = subnet.properties.cidr as string;
      const vpcCidr = vpc.properties.cidr as string;

      if (
        subCidr &&
        vpcCidr &&
        !CidrOverlapRule.isSubnetOfVpc(subCidr, vpcCidr)
      ) {
        issues.push({
          severity: this.defaultSeverity,
          ruleCode: this.code,
          message: `Le subnet "${subnet.logicalName}" (${subCidr}) dépasse la plage du VPC "${vpc.logicalName}" (${vpcCidr}).`,
          nodeId: subnet.id,
          suggestion: `Choisissez un CIDR contenu dans ${vpcCidr}.`,
        });
      }
    }

    return issues;
  }
}
