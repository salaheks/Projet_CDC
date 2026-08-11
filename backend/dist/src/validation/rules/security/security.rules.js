"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicDatabaseRule = exports.ComputeWithoutSgRule = exports.SshOpenToWorldRule = void 0;
class SshOpenToWorldRule {
    code = 'SEC-001';
    name = 'SSH ouvert sur Internet';
    category = 'security';
    defaultSeverity = 'ERROR';
    validate(nodes, _edges) {
        const issues = [];
        const securityGroups = nodes.filter((n) => n.resourceType === 'security-group' || n.resourceType === 'firewall');
        for (const sg of securityGroups) {
            const ingressRules = sg.properties.ingressRules || [];
            for (const rule of ingressRules) {
                if (rule.port === 22 &&
                    (rule.source === '0.0.0.0/0' || rule.source === '::/0') &&
                    rule.action === 'allow') {
                    issues.push({
                        severity: this.defaultSeverity,
                        ruleCode: this.code,
                        message: `Le Security Group "${sg.logicalName}" autorise SSH (port 22) depuis 0.0.0.0/0.`,
                        nodeId: sg.id,
                        suggestion: 'Restreignez la source à un CIDR spécifique ou utilisez un bastion host / SSM Session Manager.',
                    });
                }
            }
        }
        return issues;
    }
}
exports.SshOpenToWorldRule = SshOpenToWorldRule;
class ComputeWithoutSgRule {
    code = 'SEC-002';
    name = 'Ressource compute sans protection';
    category = 'security';
    defaultSeverity = 'ERROR';
    validate(nodes, edges) {
        const issues = [];
        const computeTypes = new Set([
            'virtual-machine',
            'container-cluster',
            'serverless-function',
            'physical-server',
        ]);
        const computeNodes = nodes.filter((n) => computeTypes.has(n.resourceType));
        for (const compute of computeNodes) {
            const isSecured = edges.some((e) => e.targetId === compute.id && e.edgeType === 'secures');
            if (!isSecured) {
                issues.push({
                    severity: this.defaultSeverity,
                    ruleCode: this.code,
                    message: `La ressource "${compute.logicalName}" (${compute.resourceType}) n'est protégée par aucun Security Group ou Firewall.`,
                    nodeId: compute.id,
                    suggestion: 'Ajoutez un Security Group et connectez-le à cette ressource avec une liaison de type "secures".',
                });
            }
        }
        return issues;
    }
}
exports.ComputeWithoutSgRule = ComputeWithoutSgRule;
class PublicDatabaseRule {
    code = 'SEC-003';
    name = 'Base de données dans un subnet public';
    category = 'security';
    defaultSeverity = 'ERROR';
    validate(nodes, _edges) {
        const issues = [];
        const dbTypes = new Set(['relational-database', 'nosql-database']);
        const databases = nodes.filter((n) => dbTypes.has(n.resourceType));
        for (const db of databases) {
            const parentSubnet = nodes.find((n) => n.id === db.parentId && n.resourceType === 'subnet');
            if (parentSubnet && parentSubnet.properties.isPublic === true) {
                issues.push({
                    severity: this.defaultSeverity,
                    ruleCode: this.code,
                    message: `La base de données "${db.logicalName}" est dans un subnet public ("${parentSubnet.logicalName}").`,
                    nodeId: db.id,
                    suggestion: 'Déplacez la base de données dans un subnet privé pour éviter toute exposition directe à Internet.',
                });
            }
        }
        return issues;
    }
}
exports.PublicDatabaseRule = PublicDatabaseRule;
//# sourceMappingURL=security.rules.js.map