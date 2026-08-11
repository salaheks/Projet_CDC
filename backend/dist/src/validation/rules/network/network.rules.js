"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubnetOutsideVpcRule = exports.RoutingLoopRule = exports.MissingNatRule = exports.CidrOverlapRule = void 0;
class CidrOverlapRule {
    code = 'NET-001';
    name = 'Chevauchement de sous-réseaux CIDR';
    category = 'network';
    defaultSeverity = 'ERROR';
    validate(nodes, _edges) {
        const issues = [];
        const subnets = nodes.filter((n) => n.resourceType === 'subnet');
        for (let i = 0; i < subnets.length; i++) {
            for (let j = i + 1; j < subnets.length; j++) {
                if (subnets[i].parentId !== subnets[j].parentId)
                    continue;
                const cidrA = subnets[i].properties.cidr;
                const cidrB = subnets[j].properties.cidr;
                if (cidrA && cidrB && CidrOverlapRule.cidrsOverlap(cidrA, cidrB)) {
                    issues.push({
                        severity: this.defaultSeverity,
                        ruleCode: this.code,
                        message: `Chevauchement CIDR : "${subnets[i].logicalName}" (${cidrA}) et "${subnets[j].logicalName}" (${cidrB}) dans le même VPC.`,
                        nodeId: subnets[i].id,
                        suggestion: 'Utilisez des plages CIDR disjointes au sein du même VPC.',
                    });
                }
            }
        }
        return issues;
    }
    static cidrsOverlap(cidrA, cidrB) {
        const [startA, endA] = CidrOverlapRule.cidrToRange(cidrA);
        const [startB, endB] = CidrOverlapRule.cidrToRange(cidrB);
        return startA <= endB && startB <= endA;
    }
    static cidrToRange(cidr) {
        const [ip, prefixStr] = cidr.split('/');
        const prefix = parseInt(prefixStr, 10);
        const ipNum = CidrOverlapRule.ipToInt(ip);
        const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
        const network = (ipNum & mask) >>> 0;
        const broadcast = (network | (~mask >>> 0)) >>> 0;
        return [network, broadcast];
    }
    static ipToInt(ip) {
        return (ip
            .split('.')
            .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0);
    }
    static isSubnetOfVpc(subnetCidr, vpcCidr) {
        const [subStart, subEnd] = CidrOverlapRule.cidrToRange(subnetCidr);
        const [vpcStart, vpcEnd] = CidrOverlapRule.cidrToRange(vpcCidr);
        return subStart >= vpcStart && subEnd <= vpcEnd;
    }
}
exports.CidrOverlapRule = CidrOverlapRule;
class MissingNatRule {
    code = 'NET-002';
    name = 'Sous-réseau privé sans passerelle NAT';
    category = 'network';
    defaultSeverity = 'WARNING';
    validate(nodes, edges) {
        const issues = [];
        const privateSubnets = nodes.filter((n) => n.resourceType === 'subnet' && !n.properties.isPublic);
        for (const subnet of privateSubnets) {
            const hasNatRoute = edges.some((e) => {
                if (e.sourceId !== subnet.id || e.edgeType !== 'routes-to')
                    return false;
                const target = nodes.find((n) => n.id === e.targetId);
                return target?.resourceType === 'nat-gateway';
            });
            if (!hasNatRoute) {
                issues.push({
                    severity: this.defaultSeverity,
                    ruleCode: this.code,
                    message: `Le sous-réseau privé "${subnet.logicalName}" n'a aucune route vers une passerelle NAT. Les instances ne pourront pas accéder à internet.`,
                    nodeId: subnet.id,
                    suggestion: 'Ajoutez un NAT Gateway dans un subnet public et créez une route depuis ce subnet privé.',
                });
            }
        }
        return issues;
    }
}
exports.MissingNatRule = MissingNatRule;
class RoutingLoopRule {
    code = 'NET-003';
    name = 'Boucle de routage détectée';
    category = 'network';
    defaultSeverity = 'ERROR';
    validate(nodes, edges) {
        const routingEdges = edges.filter((e) => e.edgeType === 'routes-to' || e.edgeType === 'network-link');
        const adjacency = new Map();
        for (const node of nodes) {
            adjacency.set(node.id, []);
        }
        for (const edge of routingEdges) {
            adjacency.get(edge.sourceId)?.push(edge.targetId);
        }
        const WHITE = 0, GRAY = 1, BLACK = 2;
        const color = new Map();
        const parent = new Map();
        for (const node of nodes) {
            color.set(node.id, WHITE);
            parent.set(node.id, null);
        }
        for (const node of nodes) {
            if (color.get(node.id) === WHITE) {
                const cyclePath = this.dfsVisit(node.id, adjacency, color, parent, nodes);
                if (cyclePath) {
                    return [
                        {
                            severity: this.defaultSeverity,
                            ruleCode: this.code,
                            message: `Boucle de routage détectée : ${cyclePath.join(' → ')}`,
                            suggestion: 'Vérifiez les tables de routage pour éliminer le chemin circulaire.',
                        },
                    ];
                }
            }
        }
        return [];
    }
    dfsVisit(nodeId, adjacency, color, parent, nodes) {
        const GRAY = 1, BLACK = 2;
        color.set(nodeId, GRAY);
        for (const neighborId of adjacency.get(nodeId) || []) {
            if (color.get(neighborId) === GRAY) {
                return this.reconstructCycle(nodeId, neighborId, parent, nodes);
            }
            if (color.get(neighborId) === 0) {
                parent.set(neighborId, nodeId);
                const result = this.dfsVisit(neighborId, adjacency, color, parent, nodes);
                if (result)
                    return result;
            }
        }
        color.set(nodeId, BLACK);
        return null;
    }
    reconstructCycle(from, to, parent, nodes) {
        const nameOf = (id) => nodes.find((n) => n.id === id)?.logicalName ?? id;
        const path = [nameOf(to)];
        let current = from;
        while (current && current !== to) {
            path.unshift(nameOf(current));
            current = parent.get(current) ?? null;
        }
        path.unshift(nameOf(to));
        return path;
    }
}
exports.RoutingLoopRule = RoutingLoopRule;
class SubnetOutsideVpcRule {
    code = 'NET-004';
    name = 'Subnet hors plage du VPC';
    category = 'network';
    defaultSeverity = 'ERROR';
    validate(nodes, _edges) {
        const issues = [];
        const subnets = nodes.filter((n) => n.resourceType === 'subnet');
        for (const subnet of subnets) {
            const vpc = nodes.find((n) => n.id === subnet.parentId && n.resourceType === 'vpc');
            if (!vpc)
                continue;
            const subCidr = subnet.properties.cidr;
            const vpcCidr = vpc.properties.cidr;
            if (subCidr &&
                vpcCidr &&
                !CidrOverlapRule.isSubnetOfVpc(subCidr, vpcCidr)) {
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
exports.SubnetOutsideVpcRule = SubnetOutsideVpcRule;
//# sourceMappingURL=network.rules.js.map