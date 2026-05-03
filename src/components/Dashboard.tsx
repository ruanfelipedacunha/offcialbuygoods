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

  // If a product is selected, we try to find its subid match
  const filteredSummary = useMemo(() => {
    if (!activeProduct) return summary;
    
    // Search for a SubID that matches the product name or ID
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
    return { ...summary, isGeneral: true }; // Fallback to general if no subid match
  }, [summary, activeProduct, subIdData]);

  const sorted = [...dailyData].sort((a, b) => a.date.localeCompare(b.date));

  const labels = sorted.map(d => {
    const [, m, day] = d.date.split('-');
    return `${day}/${m}`;
  });

  // Commission chart data
  const commissionChartData = {
    labels,
    datasets: [
      {
        label: 'Comissão Bruta',
        data: sorted.map(d => d.gross_commissions),
        borderColor: 'rgba(0, 229, 176, 0.8)',
        backgroundColor: 'rgba(0, 229, 176, 0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#00e5b0',
      },
      {
        label: 'Comissão Líquida',
        data: sorted.map(d => d.net_commissions),
        borderColor: 'rgba(139, 92, 246, 0.8)',
        backgroundColor: 'rgba(139, 92, 246, 0.05)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#8b5cf6',
      },
    ],
  };

  // Conversions chart data
  const conversionsChartData = {
    labels,
    datasets: [
      {
        label: 'Conversões',
        data: sorted.map(d => d.conversions_count),
        backgroundColor: (ctx: { chart: { ctx: CanvasRenderingContext2D } }) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(0, 229, 176, 0.8)');
          gradient.addColorStop(1, 'rgba(0, 229, 176, 0.1)');
          return gradient;
        },
        borderColor: 'rgba(0, 229, 176, 0.5)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 15, 30, 0.95)',
        borderColor: 'rgba(0, 229, 176, 0.3)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        padding: 10,
        callbacks: {
          label: (ctx: any) =>
            ` ${ctx.dataset.label}: ${ctx.dataset.label?.includes('Comissão') ? '$' : ''}${ctx.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.03)', drawTicks: false },
        ticks: {
          color: '#475569',
          font: { size: 10 },
          maxTicksLimit: 7,
          maxRotation: 0,
        },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)', drawTicks: false },
        ticks: { color: '#475569', font: { size: 10 } },
        border: { display: false },
      },
    },
  };

  // Today's data
  const todayStr = new Date().toISOString().split('T')[0];
  const todayData = dailyData.find(d => d.date === todayStr);

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Date Range Filter */}
      <div className="date-range">
        {DAY_OPTIONS.map(d => (
          <button
            key={d}
            className={`date-btn ${days === d ? 'active' : ''}`}
            onClick={() => setDays(d)}
          >
            {d === 7 ? '7 dias' : d === 14 ? '14 dias' : d === 30 ? '30 dias' : '60 dias'}
          </button>
        ))}
      </div>

      {/* Product Filter */}
      {products.length > 0 && (
        <div className="product-filter glass" style={{ padding: '8px', borderRadius: '12px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          <button 
            className={`date-btn ${!activeProductId ? 'active' : ''}`}
            onClick={() => setActiveProductId(null)}
          >
            Todos Produtos
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
      )}


      {/* Today's Highlight */}
      {todayData && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,229,176,0.12), rgba(139,92,246,0.08))',
          border: '1px solid rgba(0,229,176,0.25)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{ fontSize: '28px' }}>📊</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
              Hoje · {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent-green)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {todayData.conversions_count}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vendas</div>
              </div>
              <div style={{ width: '1px', height: '30px', background: 'var(--border)' }} />
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent-purple)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  ${todayData.net_commissions.toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Comissões</div>
              </div>
              <div style={{ width: '1px', height: '30px', background: 'var(--border)' }} />
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent-blue)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {todayData.visits}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Visitas</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card green fade-in-up">
          <div className="kpi-icon">💰</div>
          <div className="kpi-value">${filteredSummary.totalNetCommissions.toFixed(2)}</div>
          <div className="kpi-label">Comissões Líquidas</div>
        </div>
        <div className="kpi-card purple fade-in-up">
          <div className="kpi-icon">🎯</div>
          <div className="kpi-value">{filteredSummary.totalConversions}</div>
          <div className="kpi-label">Total de Vendas</div>
        </div>
        <div className="kpi-card orange fade-in-up">
          <div className="kpi-icon">👁️</div>
          <div className="kpi-value">{filteredSummary.totalVisits.toLocaleString()}</div>
          <div className="kpi-label">Visitas</div>
        </div>
        <div className="kpi-card blue fade-in-up">
          <div className="kpi-icon">📈</div>
          <div className="kpi-value">{filteredSummary.conversionRate.toFixed(2)}%</div>
          <div className="kpi-label">Taxa de Conv.</div>
        </div>
      </div>


      {/* Avg Commission */}
      {summary.avgCommissionPerSale > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>💎 Comissão média por venda</span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent-green)', fontFamily: 'Space Grotesk, sans-serif' }}>
            ${summary.avgCommissionPerSale.toFixed(2)}
          </span>
        </div>
      )}

      {/* Commissions Chart */}
      <div className="chart-card">
        <div className="section-header">
          <span className="section-title">📉 Comissões</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-green)' }}>
              <span style={{ width: '8px', height: '2px', background: 'var(--accent-green)', display: 'inline-block', borderRadius: '1px' }} />
              Bruta
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-purple)' }}>
              <span style={{ width: '8px', height: '2px', background: 'var(--accent-purple)', display: 'inline-block', borderRadius: '1px' }} />
              Líquida
            </span>
          </div>
        </div>
        <div className="chart-wrapper">
          <Line data={commissionChartData} options={chartOptions} />
        </div>
      </div>

      {/* Conversions Chart */}
      <div className="chart-card">
        <div className="section-header">
          <span className="section-title">🎯 Conversões por Dia</span>
          <span className="section-badge">{days}d</span>
        </div>
        <div className="chart-wrapper">
          <Bar data={conversionsChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
