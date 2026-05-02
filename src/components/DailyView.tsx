import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { DayData } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  dailyData: DayData[];
  days: number;
  setDays: (d: number) => void;
}

const DAY_OPTIONS = [7, 14, 30, 60];

export default function DailyView({ dailyData, days, setDays }: Props) {
  const sorted = [...dailyData].sort((a, b) => a.date.localeCompare(b.date));

  const labels = sorted.map(d => {
    const [, m, day] = d.date.split('-');
    return `${day}/${m}`;
  });

  const visitsData = {
    labels,
    datasets: [
      {
        label: 'Visitas',
        data: sorted.map(d => d.visits),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false as const,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 15, 30, 0.95)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.03)', drawTicks: false },
        ticks: { color: '#475569', font: { size: 10 as const }, maxTicksLimit: 8, maxRotation: 0 },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)', drawTicks: false },
        ticks: { color: '#475569', font: { size: 10 as const } },
        border: { display: false },
      },
    },
  };

  // Show chronological days, filter out completely empty days but ALWAYS include the first 5 days (which includes today)
  const recentDays = [...sorted]
    .sort((a, b) => b.date.localeCompare(a.date)) // Newest first
    .filter((d, index) => index < 5 || d.conversions_count > 0 || d.visits > 0)
    .slice(0, 15); // Show last 15 days max

  const maxVisits = Math.max(...recentDays.map(d => d.visits), 1);
  const maxConversions = Math.max(...recentDays.map(d => d.conversions_count), 1);

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="date-range">
        {DAY_OPTIONS.map(d => (
          <button key={d} className={`date-btn ${days === d ? 'active' : ''}`} onClick={() => setDays(d)}>
            {d === 7 ? '7 dias' : d === 14 ? '14 dias' : d === 30 ? '30 dias' : '60 dias'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        {[
          { label: 'Total Visitas', value: sorted.reduce((s, d) => s + d.visits, 0).toLocaleString(), color: 'var(--accent-blue)' },
          { label: 'Total Vendas', value: sorted.reduce((s, d) => s + d.conversions_count, 0), color: 'var(--accent-green)' },
          { label: 'Líquido Total', value: `$${sorted.reduce((s, d) => s + d.net_commissions, 0).toFixed(2)}`, color: 'var(--accent-purple)' },
        ].map(item => (
          <div key={item.label} style={{
            flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '12px', textAlign: 'center' as const,
          }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: item.color, fontFamily: 'Space Grotesk, sans-serif' }}>
              {item.value}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-card">
        <div className="section-header">
          <span className="section-title">👁️ Visitas por Dia</span>
        </div>
        <div className="chart-wrapper">
          <Bar data={visitsData} options={chartOptions} />
        </div>
      </div>

      <div className="chart-card">
        <div className="section-header">
          <span className="section-title">📋 Últimos Dias (Incluindo Hoje)</span>
          <span className="section-badge">{recentDays.length} dias</span>
        </div>
        {recentDays.length === 0 ? (
          <p style={{ textAlign: 'center' as const, color: 'var(--text-muted)', padding: '24px', fontSize: '13px' }}>
            Nenhuma atividade no período selecionado
          </p>
        ) : (
          <div style={{ overflowX: 'auto' as const }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th style={{ textAlign: 'right' as const }}>Visitas</th>
                  <th style={{ textAlign: 'right' as const }}>Vendas</th>
                  <th style={{ textAlign: 'right' as const }}>Líquido</th>
                </tr>
              </thead>
              <tbody>
                {recentDays.map(day => (
                  <tr key={day.date}>
                    <td>
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </td>
                    <td style={{ textAlign: 'right' as const }}>
                      <div>{day.visits}</div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar" style={{ width: `${(day.visits / maxVisits) * 100}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' as const }}>
                      <div className={day.conversions_count > 0 ? 'highlight' : ''}>{day.conversions_count}</div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar" style={{ width: `${(day.conversions_count / maxConversions) * 100}%` }} />
                      </div>
                    </td>
                    <td className="highlight" style={{ textAlign: 'right' as const, fontSize: '13px' }}>
                      ${day.net_commissions.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
