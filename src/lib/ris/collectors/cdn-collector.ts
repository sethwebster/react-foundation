/**
 * CDN Stats Collector
 * Fetches CDN usage statistics from jsDelivr
 * API Docs: https://github.com/jsdelivr/data.jsdelivr.com
 */

export interface CDNMetrics {
  jsdelivr_hits_12mo: number;
  jsdelivr_hits_last_month: number;
}

export class CDNCollector {
  private readonly JSDELIVR_API = 'https://data.jsdelivr.com/v1';

  /**
   * Collect CDN metrics for a package
   */
  async collectMetrics(packageName: string): Promise<CDNMetrics> {
    const jsdelivrStats = await this.fetchJsDelivrStats(packageName);

    return {
      jsdelivr_hits_12mo: jsdelivrStats.total_12mo,
      jsdelivr_hits_last_month: jsdelivrStats.last_month,
    };
  }

  /**
   * Fetch jsDelivr statistics
   */
  private async fetchJsDelivrStats(packageName: string) {
    try {
      // Fetch both year and month stats in parallel
      const [yearStats, monthStats] = await Promise.all([
        this.fetchJsDelivrPeriod(packageName, 'year'),
        this.fetchJsDelivrPeriod(packageName, 'month'),
      ]);

      return {
        total_12mo: yearStats,
        last_month: monthStats,
      };
    } catch (error) {
      console.error(`Error fetching jsDelivr stats for ${packageName}:`, error);
      return {
        total_12mo: 0,
        last_month: 0,
      };
    }
  }

  /**
   * Fetch jsDelivr stats for a specific period
   * API format: /v1/stats/packages/npm/{package}?period={period}
   * Periods: day, week, month, quarter, year
   */
  private async fetchJsDelivrPeriod(
    packageName: string,
    period: 'year' | 'month' | 'week' | 'day'
  ): Promise<number> {
    try {
      // Correct API endpoint format
      const url = `${this.JSDELIVR_API}/stats/packages/npm/${packageName}?period=${period}`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'React-Foundation-Store/1.0',
        },
      });

      if (!response.ok) {
        // 404 means package not served via jsDelivr (common, not an error)
        if (response.status === 404) {
          return 0;
        }

        console.error(
          `jsDelivr API error for ${packageName} (${period}): ${response.status} ${response.statusText}`
        );
        return 0;
      }

      const data = await response.json();

      // Extract total hits from response
      const total = data.hits?.total || 0;

      return total;
    } catch (error) {
      console.error(
        `Error fetching jsDelivr ${period} stats for ${packageName}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Map repository to CDN package name (usually same as NPM)
   * Some packages may not be available on CDN
   */
  static getPackageName(npmPackageName: string): string {
    // For scoped packages, jsDelivr uses @ prefix
    // e.g., @tanstack/react-query
    return npmPackageName;
  }
}
