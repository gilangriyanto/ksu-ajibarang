// src/utils/periodHelper.ts

/**
 * Get the first and last day of a month
 * @param year - Year (e.g., 2024)
 * @param month - Month (1-12)
 * @returns Object with startDate and endDate in YYYY-MM-DD format
 */
export const getMonthPeriod = (year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the month

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parse period string (YYYY-MM) to year and month
 * @param period - Period string in format YYYY-MM
 * @returns Object with year and month
 */
export const parsePeriod = (
  period: string
): { year: number; month: number } => {
  const [year, month] = period.split("-").map(Number);
  return { year, month };
};

/**
 * Get period dates from period string
 * @param period - Period string in format YYYY-MM
 * @returns Object with startDate and endDate
 */
export const getPeriodDates = (period: string) => {
  const { year, month } = parsePeriod(period);
  return getMonthPeriod(year, month);
};

/**
 * Get Indonesian month name
 */
export const getMonthName = (month: number): string => {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[month - 1];
};

/**
 * Format period string to Indonesian display format
 * @param period - Period string in format YYYY-MM
 * @returns Formatted string like "Januari 2024"
 */
export const formatPeriodDisplay = (period: string): string => {
  const { year, month } = parsePeriod(period);
  return `${getMonthName(month)} ${year}`;
};

/**
 * Generate list of periods for select dropdown
 * @param count - Number of periods to generate (default: 12)
 * @returns Array of period objects
 */
export const generatePeriodOptions = (count: number = 12) => {
  const options: { value: string; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const periodValue = `${year}-${String(month).padStart(2, "0")}`;
    const periodLabel = formatPeriodDisplay(periodValue);

    options.push({
      value: periodValue,
      label: periodLabel,
    });
  }

  return options;
};

/**
 * Get previous month period
 * @param period - Current period in format YYYY-MM
 * @returns Previous period in format YYYY-MM
 */
export const getPreviousPeriod = (period: string): string => {
  const { year, month } = parsePeriod(period);
  const date = new Date(year, month - 2, 1); // -2 because month is 1-based
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
};
