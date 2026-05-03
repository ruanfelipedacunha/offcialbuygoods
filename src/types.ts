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

export interface ApiSettings {
  id: string;
  account_id: string;
  token: string;
  label?: string;
}

export interface Product {
  id: string;
  name: string;
  api_settings_id: string;
  buygoods_id?: string;
}

export type ActiveTab = 'dashboard' | 'daily' | 'hourly' | 'subids' | 'notifications' | 'settings';

