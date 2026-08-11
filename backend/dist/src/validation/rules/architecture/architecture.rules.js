"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrphanNodeRule = exports.SinglePointOfFailureRule = void 0;
class SinglePointOfFailureRule {
    code = 'ARCH-001';
    name = 'Point de défaillance unique (SPOF)';
    category = 'architecture';
    defaultSeverity = 'WARNING';
    validate(nodes, edges) {
        const issues = [];
        const computes = nodes.filter((n) => n.resourceType === 'virtual-machine');
        const lbTargets = new Set(edges.filter((e) => e.edgeType === 'load-balances').map((e) => e.targetId));
        for (const vm of computes) {
            if (lbTargets.has(vm.id))
                continue;
            const hasIncomingTraffic = edges.some((e) => e.targetId === vm.id &&
                (e.edgeType === 'network-link' || e.edgeType === 'routes-to'));
            if (hasIncomingTraffic) {
                issues.push({
                    severity: this.defaultSeverity,
                    ruleCode: this.code,
                    message: `Le serveur "${vm.logicalName}" reçoit du trafic direct sans Load Balancer — SPOF.`,
                    nodeId: vm.id,
                    suggestion: 'Ajoutez un Load Balancer devant ce serveur et dupliquez-le dans une autre AZ pour la haute disponibilité.',
                });
            }
        }
        return issues;
    }
}
exports.SinglePointOfFailureRule = SinglePointOfFailureRule;
class OrphanNodeRule {
    code = 'ARCH-002';
    name = 'Composant orphelin (isolé)';
    category = 'architecture';
    defaultSeverity = 'WARNING';
    validate(nodes, edges) {
        const issues = [];
        const connectedNodes = new Set();
        for (const edge of edges) {
            connectedNodes.add(edge.sourceId);
            connectedNodes.add(edge.targetId);
        }
        const meaningfulTypes = new Set([
            'virtual-machine',
            'relational-database',
            'load-balancer',
            'container-cluster',
            'serverless-function',
            'physical-server',
        ]);
        for (const node of nodes) {
            if (!meaningfulTypes.has(node.resourceType))
                continue;
            const hasChildren = nodes.some((n) => n.parentId === node.id);
            if (hasChildren)
                continue;
            if (!connectedNodes.has(node.id)) {
                issues.push({
                    severity: this.defaultSeverity,
                    ruleCode: this.code,
                    message: `Le composant "${node.logicalName}" (${node.resourceType}) est isolé : aucune connexion.`,
                    nodeId: node.id,
                    suggestion: 'Connectez ce composant au réseau ou supprimez-le s\'il n\'est pas nécessaire.',
                });
            }
        }
        return issues;
    }
}
exports.OrphanNodeRule = OrphanNodeRule;
//# sourceMappingURL=architecture.rules.js.map