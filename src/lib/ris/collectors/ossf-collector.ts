/**
 * OSSF Scorecard Collector
 * Fetches security and best practices scores from OpenSSF Scorecard
 */

import { logger } from '@/lib/logger';

export interface OSSFMetrics {
  overall_score: number; // 0-10
  normalized_score: number; // 0-1
  checks: {
    security_policy: number;
    signed_releases: number;
    branch_protection: number;
    dangerous_workflow: number;
    dependency_update_tool: number;
    maintained: number;
    code_review: number;
    ci_tests: number;
  };
}

export class OSSFCollector {
  // OSSF Scorecard API
  private readonly OSSF_API = 'https://api.securityscorecards.dev';

  /**
   * Collect OSSF Scorecard metrics for a repository
   */
  async collectMetrics(owner: string, repo: string): Promise<OSSFMetrics> {
    try {
      // OSSF Scorecard API endpoint
      // Format: /projects/github.com/{owner}/{repo}
      const response = await fetch(
        `${this.OSSF_API}/projects/github.com/${owner}/${repo}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // Many repos may not have scorecard data yet
        if (response.status === 404) {
          logger.debug(`OSSF Scorecard not available for ${owner}/${repo} (using default metrics)`);
          return this.getDefaultMetrics();
        }

        logger.warn(
          `OSSF Scorecard API error for ${owner}/${repo}: ${response.status} ${response.statusText}`
        );
        return this.getDefaultMetrics();
      }

      const data = await response.json();

      // Extract overall score (0-10)
      const overallScore = data.score || 0;
      const normalizedScore = overallScore / 10;

      // Extract individual check scores
      const checks = this.extractCheckScores(data.checks || []);

      return {
        overall_score: overallScore,
        normalized_score: normalizedScore,
        checks,
      };
    } catch (error) {
      logger.error(`Error fetching OSSF Scorecard for ${owner}/${repo}:`, error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Extract scores for specific checks
   */
  private extractCheckScores(checks: Array<{ name: string; score?: number }>): OSSFMetrics['checks'] {
    const findCheckScore = (name: string): number => {
      const check = checks.find((c) => c.name === name);
      if (!check || check.score === undefined) return 0;
      return check.score / 10; // Normalize to 0-1
    };

    return {
      security_policy: findCheckScore('Security-Policy'),
      signed_releases: findCheckScore('Signed-Releases'),
      branch_protection: findCheckScore('Branch-Protection'),
      dangerous_workflow: findCheckScore('Dangerous-Workflow'),
      dependency_update_tool: findCheckScore('Dependency-Update-Tool'),
      maintained: findCheckScore('Maintained'),
      code_review: findCheckScore('Code-Review'),
      ci_tests: findCheckScore('CI-Tests'),
    };
  }

  /**
   * Return default metrics when scorecard is unavailable
   */
  private getDefaultMetrics(): OSSFMetrics {
    return {
      overall_score: 0,
      normalized_score: 0,
      checks: {
        security_policy: 0,
        signed_releases: 0,
        branch_protection: 0,
        dangerous_workflow: 0,
        dependency_update_tool: 0,
        maintained: 0,
        code_review: 0,
        ci_tests: 0,
      },
    };
  }
}
