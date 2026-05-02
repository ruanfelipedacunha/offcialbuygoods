// API Configuration
export const API_CONFIG = {
  accountId: '5316',
  token: 'dVb6dV6EcItKSSpS9C7zk6xWI8jQ4Is2WovTHHwvvS0Mj14METP7vdCcjP%2B6Lo%2Fq7%2FEtRYdAP9M2yXrtQa6PkG0%2FIRkdXlnMPbp03Olvb8A7%2BVmXG7EFpBQsfIgX%2FvCakezI',
};

export const VAPID_PUBLIC_KEY = 'BH5BV2kOSTyFl6Z2Izun_fjzgSHQwA-RuOdxsed9PBv2PTz8Oh9Gj5jUQJ_cabZoAtcHKlY3ccVoHRvP7RzNRG4';

// Build date range params (last N days)
export function buildDateRange(days = 60): { dateFrom: string; dateTo: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { dateFrom: fmt(from), dateTo: fmt(to) };
}

// ClickCRM API (sales statistics - supports CORS)
export function buildClickCRMUrl(
  endpoint: 'byday' | 'byhour' | 'bysubid' | 'bysubid2',
  dateFrom: string,
  dateTo: string,
  nextPage?: number
): string {
  const base = `/api/clickcrm/${endpoint}`;
  let url = `${base}?a=${API_CONFIG.accountId}&token=${API_CONFIG.token}&date_from=${dateFrom}&date_to=${dateTo}&response_type=json`;
  if (nextPage !== undefined) url += `&next_page=${nextPage}`;
  return url;
}

// BuyGoods API (customers, conversions, commissions)
export function buildBuyGoodsUrl(
  endpoint: 'customer' | 'conversion' | 'commissions',
  dateFrom: string,
  dateTo: string
): string {
  const base = `/api/buygoods/${endpoint}.php`;
  return `${base}?account_id=${API_CONFIG.accountId}&token=${API_CONFIG.token}&date_from=${dateFrom}&date_to=${dateTo}`;
}
