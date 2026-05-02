import axios from 'axios';
import type { ClickCRMResponse, DayData, HourData, SubIdData, SubId2Data } from './types';
import { buildClickCRMUrl, buildDateRange } from './config';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAllPages<T>(
  endpoint: 'byday' | 'byhour' | 'bysubid' | 'bysubid2',
  dateFrom: string,
  dateTo: string
): Promise<T[]> {
  const results: T[] = [];
  let nextPage: number | undefined = undefined;
  let iterations = 0;
  const maxIterations = 20; // safety limit

  do {
    if (iterations > 0) {
      await sleep(1000); // Wait 1 second between pages to prevent rate limits
    }
    const url = buildClickCRMUrl(endpoint, dateFrom, dateTo, nextPage);
    let retryCount = 0;
    const maxRetries = 3;
    let data;
    
    while (retryCount < maxRetries) {
      try {
        const response = await axios.get<ClickCRMResponse<T>>(url, {
          headers: { 'Accept': 'application/json' },
          timeout: 10000,
        });
        data = response.data;
        break; // success
      } catch (error: any) {
        const status = error.response?.status;
        if (status === 429 || status === 503 || status === 502 || status === 504) {
          retryCount++;
          console.warn(`API Error (${status}). Retrying in ${retryCount * 5}s...`);
          await sleep(retryCount * 5000); // 5s, 10s, 15s delay
        } else {
          throw error;
        }
      }
    }

    if (!data) throw new Error('Falha após várias tentativas. Limite de requisições excedido.');

    if (data.data && Array.isArray(data.data)) {
      results.push(...data.data);
      if (data.data.length < 50) {
        break; // Reached the end of the data!
      }
    } else {
      break; // No data returned
    }
    
    nextPage = data.next_page;
    iterations++;
  } while (nextPage !== undefined && iterations < maxIterations);

  return results;
}

export async function fetchDailyData(days = 60): Promise<DayData[]> {
  const { dateFrom, dateTo } = buildDateRange(days);
  return fetchAllPages<DayData>('byday', dateFrom, dateTo);
}

export async function fetchHourlyData(days = 30): Promise<HourData[]> {
  const { dateFrom, dateTo } = buildDateRange(days);
  return fetchAllPages<HourData>('byhour', dateFrom, dateTo);
}

export async function fetchBySubId(days = 60): Promise<SubIdData[]> {
  const { dateFrom, dateTo } = buildDateRange(days);
  return fetchAllPages<SubIdData>('bysubid', dateFrom, dateTo);
}

export async function fetchBySubId2(days = 60): Promise<SubId2Data[]> {
  const { dateFrom, dateTo } = buildDateRange(days);
  return fetchAllPages<SubId2Data>('bysubid2', dateFrom, dateTo);
}

export function computeSummary(daily: DayData[]) {
  const totalVisits = daily.reduce((s, d) => s + (d.visits || 0), 0);
  const totalGross = daily.reduce((s, d) => s + (d.gross_commissions || 0), 0);
  const totalNet = daily.reduce((s, d) => s + (d.net_commissions || 0), 0);
  const totalConversions = daily.reduce((s, d) => s + (d.conversions_count || 0), 0);
  const conversionRate = totalVisits > 0 ? (totalConversions / totalVisits) * 100 : 0;
  const avgCommission = totalConversions > 0 ? totalNet / totalConversions : 0;

  return {
    totalVisits,
    totalGrossCommissions: totalGross,
    totalNetCommissions: totalNet,
    totalConversions,
    conversionRate,
    avgCommissionPerSale: avgCommission,
  };
}
