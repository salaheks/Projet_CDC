"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const graph_service_1 = require("../graph/graph.service");
const rules_1 = require("./rules");
let ValidationService = class ValidationService {
    prisma;
    graphService;
    constructor(prisma, graphService) {
        this.prisma = prisma;
        this.graphService = graphService;
    }
    async validateProject(projectId, versionNum) {
        const graph = await this.graphService.getFullGraph(projectId, versionNum);
        const allIssues = [];
        for (const rule of rules_1.ALL_RULES) {
            try {
                const issues = rule.validate(graph.nodes, graph.edges);
                allIssues.push(...issues);
            }
            catch (error) {
                console.error(`Rule ${rule.code} failed:`, error);
                allIssues.push({
                    severity: 'INFO',
                    ruleCode: rule.code,
                    message: `La règle ${rule.code} a échoué lors de l'exécution : ${error instanceof Error ? error.message : 'erreur inconnue'}`,
                });
            }
        }
        const status = allIssues.some((i) => i.severity === 'ERROR')
            ? 'FAILED'
            : allIssues.some((i) => i.severity === 'WARNING')
                ? 'WARNING'
                : 'PASSED';
        const summary = this.generateSummary(allIssues);
        const report = await this.prisma.validationReport.create({
            data: {
                projectId,
                versionNum,
                status,
                summary,
                issues: {
                    create: allIssues.map((issue) => ({
                        severity: issue.severity,
                        ruleCode: issue.ruleCode,
                        message: issue.message,
                        nodeId: issue.nodeId,
                        edgeId: issue.edgeId,
                        suggestion: issue.suggestion,
                    })),
                },
            },
            include: { issues: true },
        });
        return {
            id: report.id,
            projectId: report.projectId,
            versionNum: report.versionNum,
            status: report.status,
            summary: report.summary ?? undefined,
            executedAt: report.executedAt.toISOString(),
            issues: report.issues.map((i) => ({
                severity: i.severity,
                ruleCode: i.ruleCode,
                message: i.message,
                nodeId: i.nodeId ?? undefined,
                edgeId: i.edgeId ?? undefined,
                suggestion: i.suggestion ?? undefined,
            })),
        };
    }
    async getReports(projectId) {
        return this.prisma.validationReport.findMany({
            where: { projectId },
            include: { issues: true },
            orderBy: { executedAt: 'desc' },
            take: 20,
        });
    }
    generateSummary(issues) {
        const errors = issues.filter((i) => i.severity === 'ERROR').length;
        const warnings = issues.filter((i) => i.severity === 'WARNING').length;
        const infos = issues.filter((i) => i.severity === 'INFO').length;
        if (errors === 0 && warnings === 0) {
            return '✅ Architecture validée — aucun problème détecté.';
        }
        const parts = [];
        if (errors > 0)
            parts.push(`${errors} erreur(s) critique(s)`);
        if (warnings > 0)
            parts.push(`${warnings} avertissement(s)`);
        if (infos > 0)
            parts.push(`${infos} suggestion(s)`);
        return `⚠️ ${parts.join(', ')} détecté(s).`;
    }
};
exports.ValidationService = ValidationService;
exports.ValidationService = ValidationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        graph_service_1.GraphService])
], ValidationService);
//# sourceMappingURL=validation.service.js.map