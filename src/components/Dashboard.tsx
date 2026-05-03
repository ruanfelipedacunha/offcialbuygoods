import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import type { DayData, SalesSummary, Product, SubIdData } from '../types';
import { useState, useMemo } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  summary: SalesSummary;
  dailyData: DayData[];
  days: number;
  setDays: (d: number) => void;
  products: Product[];
  subIdData: SubIdData[];
}

const DAY_OPTIONS = [7, 14, 30, 60];

export default function Dashboard({ summary, dailyData, days, setDays, products, subIdData }: Props) {
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  const activeProduct = useMemo(() => 
    products.find(p => p.id === activeProductId), 
  [products, activeProductId]);

  const filteredSummary = useMemo(() => {
    if (!activeProduct) return summary;
    const match = subIdData.find(s => 
      s.subid.toLowerCase() === activeProduct.name.toLowerCase() ||
      (activeProduct.buygoods_id && s.subid === activeProduct.buygoods_id)
    );

    if (match) {
      return {
        totalVisits: match.visits,
        totalGrossCommissions: match.gross_commissions,
        totalNetCommissions: match.net_commissions,
        totalConversions: match.conversions_count,
        conversionRate: match.visits > 0 ? (match.conversions_count / match.visits) * 100 : 0,
        avgCommissionPerSale: match.conversions_count > 0 ? match.net_commissions / match.conversions_count : 0,
      };
    }
    return { ...summary };
  }, [summary, activeProduct, subIdData]);

  const sorted = [...dailyData].sort((a, b) => a.date.localeCompare(b.date));
  const labels = sorted.map(d => {
    const [, m, day] = d.date.split('-');
    return `${day}/${m}`;
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#0f172a',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
    },
  };

  const commissionChartData = {
    labels,
    datasets: [
      {
        label: 'Líquido',
        data: sorted.map(d => d.net_commissions),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const conversionsChartData = {
    labels,
    datasets: [
      {
        label: 'Vendas',
        data: sorted.map(d => d.conversions_count),
        backgroundColor: '#6366f1',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Date & Product Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="date-range">
          {DAY_OPTIONS.map(d => (
            <button key={d} className={`date-btn ${days === d ? 'active' : ''}`} onClick={() => setDays(d)}>
              {d} dias
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`date-btn ${!activeProductId ? 'active' : ''}`} 
            onClick={() => setActiveProductId(null)}
          >
            Todos
          </button>
          {products.map(p => (
            <button 
              key={p.id} 
              className={`date-btn ${activeProductId === p.id ? 'active' : ''}`} 
              onClick={() => setActiveProductId(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="card kpi-item">
          <div className="kpi-label">Comissão Líquida</div>
          <div className="kpi-value" style={{ color: 'var(--bg-accent)' }}>
            ${filteredSummary.totalNetCommissions.toFixed(2)}
          </div>
        </div>
        <div className="card kpi-item">
          <div className="kpi-label">Total de Vendas</div>
          <div className="kpi-value">{filteredSummary.totalConversions}</div>
        </div>
        <div className="card kpi-item">
          <div className="kpi-label">Visitas Únicas</div>
          <div className="kpi-value">{filteredSummary.totalVisits.toLocaleString()}</div>
        </div>
        <div className="card kpi-item">
          <div className="kpi-label">Taxa de Conversão</div>
          <div className="kpi-value" style={{ color: '#10b981' }}>{filteredSummary.conversionRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Tendência de Comissões</h2>
          <div style={{ height: '260px' }}>
            <Line data={commissionChartData} options={chartOptions} />
          </div>
        </div>
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Vendas Diárias</h2>
          <div style={{ height: '260px' }}>
            <Bar data={conversionsChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="kpi-label">Ticket Médio</div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>${summary.avgCommissionPerSale.toFixed(2)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="kpi-label">Período</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>Últimos {days} dias</div>
        </div>
      </div>
    </div>
  );
}
