import React from 'react';
import type { HourData } from '../types';

interface Props {
  hourlyData: HourData[];
}

export default function HourlyView({ hourlyData }: Props) {
  // Group by hour and sum
  const hourMap: Record<number, { visits: number; conversions: number; net: number }> = {};
  for (let h = 0; h < 24; h++) {
    hourMap[h] = { visits: 0, conversions: 0, net: 0 };
  }
  hourlyData.forEach(d => {
    const h = d.hour ?? 0;
    if (hourMap[h]) {
      hourMap[h].visits += d.visits || 0;
      hourMap[h].conversions += d.conversions_count || 0;
      hourMap[h].net += d.net_commissions || 0;
    }
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxVisits = Math.max(...hours.map(h => hourMap[h].visits), 1);
  const maxConversions = Math.max(...hours.map(h => hourMap[h].conversions), 1);

  // Best hours by conversions
  const bestHours = hours
    .filter(h => hourMap[h].conversions > 0 || hourMap[h].visits > 0)
    .sort((a, b) => hourMap[b].conversions - hourMap[a].conversions)
    .slice(0, 5);

  const fmt = (h: number) => `${String(h).padStart(2, '0')}:00`;

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Visual Heatmap */}
      <div className="chart-card">
        <div className="section-header">
          <span className="section-title">⏰ Atividade por Hora</span>
          <span className="section-badge">Visitas</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px', marginTop: '8px' }}>
          {hours.map(h => {
            const visits = hourMap[h].visits;
            const intensity = visits / maxVisits;
            const conversions = hourMap[h].conversions;
            return (
              <div
                key={h}
                title={`${fmt(h)}: ${visits} visitas, ${conversions} vendas`}
                style={{
                  aspectRatio: '1',
                  borderRadius: '6px',
                  background: conversions > 0
                    ? `rgba(0, 229, 176, ${0.2 + intensity * 0.8})`
                    : `rgba(255, 255, 255, ${0.03 + intensity * 0.1})`,
                  border: conversions > 0 ? '1px solid rgba(0,229,176,0.4)' : '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'default',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: '8px', color: conversions > 0 ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: '600' }}>
                  {String(h).padStart(2, '0')}h
                </div>
                {conversions > 0 && (
                  <div style={{ fontSize: '9px', color: 'var(--accent-green)', fontWeight: '700' }}>
                    {conversions}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(0,229,176,0.2)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Com vendas</span>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)', marginLeft: '8px' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Apenas visitas</span>
        </div>
      </div>

      {/* Bar visualization */}
      <div className="chart-card">
        <div className="section-header">
          <span className="section-title">📊 Visitas por Hora</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '100px' }}>
          {hours.map(h => {
            const visits = hourMap[h].visits;
            const pct = maxVisits > 0 ? (visits / maxVisits) * 100 : 0;
            return (
              <div
                key={h}
                style={{
                  flex: 1,
                  height: `${Math.max(pct, 2)}%`,
                  borderRadius: '3px 3px 0 0',
                  background: hourMap[h].conversions > 0
                    ? 'rgba(0, 229, 176, 0.7)'
                    : 'rgba(59, 130, 246, 0.3)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.2s',
                }}
                title={`${fmt(h)}: ${visits} visitas`}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          {[0, 6, 12, 18, 23].map(h => (
            <span key={h} style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{fmt(h)}</span>
          ))}
        </div>
      </div>

      {/* Best Hours */}
      <div className="chart-card">
        <div className="section-header">
          <span className="section-title">🏆 Melhores Horários</span>
          <span className="section-badge">por vendas</span>
        </div>
        {bestHours.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontSize: '13px' }}>
            Nenhuma venda registrada no período
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {bestHours.map((h, i) => (
              <div key={h} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: i === 0 ? 'rgba(245,158,11,0.2)' : 'var(--bg-card)',
                  border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '700',
                  color: i === 0 ? 'var(--accent-orange)' : 'var(--text-muted)',
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{fmt(h)}</span>
                    <span style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: '600' }}>
                      {hourMap[h].conversions} {hourMap[h].conversions === 1 ? 'venda' : 'vendas'}
                    </span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar" style={{ width: `${(hourMap[h].conversions / maxConversions) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
