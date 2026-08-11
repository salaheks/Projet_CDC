import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GraphService } from '../graph/graph.service';
import { ALL_RULES } from './rules';
import type { ValidationIssueDTO, ValidationReportDTO } from '../common/types/infra-ir.types';

@Injectable()
export class ValidationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly graphService: GraphService,
  ) {}

  /**
   * Run all validation rules against a project version.
   * Returns a persisted ValidationReport with all detected issues.
   */
  async validateProject(
    projectId: string,
    versionNum: number,
  ): Promise<ValidationReportDTO> {
    // Load the full graph
    const graph = await this.graphService.getFullGraph(projectId, versionNum);

    // Execute all rules
    const allIssues: ValidationIssueDTO[] = [];
    for (const rule of ALL_RULES) {
      try {
        const issues = rule.validate(graph.nodes, graph.edges);
        allIssues.push(...issues);
      } catch (error) {
        console.error(`Rule ${rule.code} failed:`, error);
        allIssues.push({
          severity: 'INFO',
          ruleCode: rule.code,
          message: `La règle ${rule.code} a échoué lors de l'exécution : ${error instanceof Error ? error.message : 'erreur inconnue'}`,
        });
      }
    }

    // Determine global status
    const status = allIssues.some((i) => i.severity === 'ERROR')
      ? 'FAILED'
      : allIssues.some((i) => i.severity === 'WARNING')
        ? 'WARNING'
        : 'PASSED';

    const summary = this.generateSummary(allIssues);

    // Persist the report
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
      status: report.status as any,
      summary: report.summary ?? undefined,
      executedAt: report.executedAt.toISOString(),
      issues: report.issues.map((i) => ({
        severity: i.severity as any,
        ruleCode: i.ruleCode,
        message: i.message,
        nodeId: i.nodeId ?? undefined,
        edgeId: i.edgeId ?? undefined,
        suggestion: i.suggestion ?? undefined,
      })),
    };
  }

  /**
   * Get validation history for a project.
   */
  async getReports(projectId: string) {
    return this.prisma.validationReport.findMany({
      where: { projectId },
      include: { issues: true },
      orderBy: { executedAt: 'desc' },
      take: 20,
    });
  }

  private generateSummary(issues: ValidationIssueDTO[]): string {
    const errors = issues.filter((i) => i.severity === 'ERROR').length;
    const warnings = issues.filter((i) => i.severity === 'WARNING').length;
    const infos = issues.filter((i) => i.severity === 'INFO').length;

    if (errors === 0 && warnings === 0) {
      return '✅ Architecture validée — aucun problème détecté.';
    }

    const parts: string[] = [];
    if (errors > 0) parts.push(`${errors} erreur(s) critique(s)`);
    if (warnings > 0) parts.push(`${warnings} avertissement(s)`);
    if (infos > 0) parts.push(`${infos} suggestion(s)`);

    return `⚠️ ${parts.join(', ')} détecté(s).`;
  }
}
