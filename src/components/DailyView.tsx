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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
    },
  };

  const visitsData = {
    labels,
    datasets: [{
      label: 'Visitas',
      data: sorted.map(d => d.visits),
      backgroundColor: '#6366f1',
      borderRadius: 4,
    }],
  };

  const recentDays = [...sorted]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 15);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="date-range">
        {DAY_OPTIONS.map(d => (
          <button key={d} className={`date-btn ${days === d ? 'active' : ''}`} onClick={() => setDays(d)}>
            {d} dias
          </button>
        ))}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>👁️ Volume de Tráfego Diário</h2>
        <div style={{ height: '240px' }}>
          <Bar data={visitsData} options={chartOptions} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '16px' }}>📋 Histórico de Performance</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Visitas</th>
                <th>Vendas</th>
                <th style={{ textAlign: 'right' }}>Líquido</th>
              </tr>
            </thead>
            <tbody>
              {recentDays.map(day => (
                <tr key={day.date}>
                  <td style={{ fontWeight: '600' }}>{new Date(day.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</td>
                  <td>{day.visits.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${day.conversions_count > 0 ? 'badge-success' : ''}`}>
                      {day.conversions_count}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--bg-accent)' }}>
                    ${day.net_commissions.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
