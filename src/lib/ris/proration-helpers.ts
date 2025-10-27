/**
 * Proration Helpers for RIS Allocations
 * Calculates proration factors for mid-quarter approved libraries
 */

import { getApprovedLibraries } from './library-approval';

/**
 * Get quarter start and end dates for a given period string
 * @param period - Quarter string like "2025-Q1"
 * @returns Start and end dates for the quarter
 */
export function getQuarterDates(period: string): { start: Date; end: Date } {
  const [yearStr, quarterStr] = period.split('-Q');
  const year = parseInt(yearStr);
  const quarter = parseInt(quarterStr);

  const startMonth = (quarter - 1) * 3; // 0, 3, 6, 9
  const endMonth = startMonth + 3;

  const start = new Date(year, startMonth, 1);
  const end = new Date(year, endMonth, 0); // Last day of previous month

  return { start, end };
}

/**
 * Get current quarter string
 * @returns Quarter string like "2025-Q1"
 */
export function getCurrentQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  const quarter = Math.floor(month / 3) + 1;
  return `${year}-Q${quarter}`;
}

/**
 * Get library approval dates for proration calculation
 * @param period - Quarter to check approvals for
 * @returns Map of library name to approval date
 */
export async function getLibraryApprovalDates(
  period: string
): Promise<Map<string, Date>> {
  const approvalDates = new Map<string, Date>();

  try {
    // Get all approved libraries
    const approvedLibraries = await getApprovedLibraries();

    // Get quarter dates
    const { start: quarterStart, end: quarterEnd } = getQuarterDates(period);

    // Filter libraries approved during this quarter
    for (const lib of approvedLibraries) {
      const approvalDate = new Date(lib.approvedAt);

      // Only include libraries approved during this quarter
      if (approvalDate >= quarterStart && approvalDate <= quarterEnd) {
        const key = `${lib.owner}/${lib.repo}`;
        approvalDates.set(key, approvalDate);
      }
    }

    console.log(
      `📊 Found ${approvalDates.size} libraries approved during ${period}`
    );
  } catch (error) {
    console.error('Error fetching library approval dates:', error);
  }

  return approvalDates;
}

/**
 * Calculate proration factor for a library
 * @param approvalDate - Date library was approved
 * @param quarterStart - Quarter start date
 * @param quarterEnd - Quarter end date
 * @returns Proration factor (0-1)
 */
export function calculateProrationFactor(
  approvalDate: Date,
  quarterStart: Date,
  quarterEnd: Date
): number {
  const totalDays = Math.ceil(
    (quarterEnd.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  const daysRemaining = Math.ceil(
    (quarterEnd.getTime() - approvalDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const prorationFactor = Math.max(0, Math.min(1, daysRemaining / totalDays));

  return prorationFactor;
}
