export interface BackendMemberData {
  month: string; // Format: "2025-09"
  user_count: number;
}

export interface ChartMemberData {
  month: string; // Format: "Sep"
  members: number;
  growth: number;
}

/**
 * Converts backend date format (YYYY-MM) to short month name
 */
export const formatMonthName = (dateString: string): string => {
  const [year, month] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short' });
};

/**
 * Calculates growth percentage between current and previous value
 */
export const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return parseFloat(((current - previous) / previous * 100).toFixed(1));
};

/**
 * Transforms backend member data to chart format
 */
export const transformMemberData = (backendData: BackendMemberData[]): ChartMemberData[] => {
  // Sort data by date to ensure correct order
  const sortedData = [...backendData].sort((a, b) => a.month.localeCompare(b.month));
  
  return sortedData.map((item, index) => {
    const previousCount = index > 0 ? sortedData[index - 1].user_count : item.user_count;
    const growth = calculateGrowth(item.user_count, previousCount);
    
    return {
      month: formatMonthName(item.month),
      members: item.user_count,
      growth: growth
    };
  });
};

/**
 * Generates default date range (last 12 months)
 */
export const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 11); // 12 months including current
  
  return {
    startDate: startDate.toISOString().slice(0, 7), // YYYY-MM format
    endDate: endDate.toISOString().slice(0, 7)
  };
};

/**
 * Formats date for display in UI
 */
export const formatDateForDisplay = (dateString: string): string => {
  const [year, month] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};