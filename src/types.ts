export interface DayData {
  date: string;
  visits: number;
  gross_commissions: number;
  voided_commissions: number;
  net_commissions: number;
  conversions_count: number;
}

export interface HourData {
  hour: number;
  date?: string;
  visits: number;
  gross_commissions: number;
  net_commissions: number;
  conversions_count: number;
}

export interface SubIdData {
  subid: string;
  visits: number;
  gross_commissions: number;
  net_commissions: number;
  conversions_count: number;
}

export interface SubId2Data {
  subid2: string;
  visits: number;
  gross_commissions: number;
  net_commissions: number;
  conversions_count: number;
}

export interface ClickCRMResponse<T> {
  data: T[];
  next_page?: number;
}

export interface SalesSummary {
  totalVisits: number;
  totalGrossCommissions: number;
  totalNetCommissions: number;
  totalConversions: number;
  conversionRate: number;
  avgCommissionPerSale: number;
}

export type ActiveTab = 'dashboard' | 'daily' | 'hourly' | 'subids' | 'notifications';
