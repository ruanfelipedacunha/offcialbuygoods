import React, { useState } from 'react';
import type { SubIdData, SubId2Data } from '../types';

interface Props {
  subIdData: SubIdData[];
  subId2Data: SubId2Data[];
}

export default function SubIdsView({ subIdData, subId2Data }: Props) {
  const [activeTab, setActiveTab] = useState<'subid1' | 'subid2'>('subid1');

  const renderTable = (
    data: (SubIdData | SubId2Data)[],
    idKey: 'subid' | 'subid2'
  ) => {
    const sorted = [...data].sort((a, b) => b.net_commissions - a.net_commissions);
    const maxConv = Math.max(...sorted.map(d => d.conversions_count), 1);
    const maxNet = Math.max(...sorted.map(d => d.net_commissions), 1);

    if (sorted.length === 0) {
      return (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px', fontSize: '13px' }}>
          Nenhum dado encontrado no período
        </p>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sorted.slice(0, 20).map((item, i) => {
          const id = (item as SubIdData).subid ?? (item as SubId2Data).subid2 ?? '—';
          const convPct = (item.conversions_count / maxConv) * 100;
          const netPct = (item.net_commissions / maxNet) * 100;
          return (
            <div
              key={id || i}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '14px',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    background: i < 3 ? 'rgba(0,229,176,0.15)' : 'var(--bg-card-hover)',
                    border: `1px solid ${i < 3 ? 'rgba(0,229,176,0.3)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '700',
                    color: i < 3 ? 'var(--accent-green)' : 'var(--text-muted)',
                  }}>
                    {i + 1}
                  </div>
                  <span style={{
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    fontWeight: '500',
                    maxWidth: '180px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {id || '(vazio)'}
                  </span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-green)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  ${item.net_commissions.toFixed(2)}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                {[
                  { label: 'Visitas', value: item.visits },
                  { label: 'Vendas', value: item.conversions_count, highlight: item.conversions_count > 0 },
                  { label: 'Bruto', value: `$${item.gross_commissions.toFixed(2)}` },
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '14px', fontWeight: '600',
                      color: stat.highlight ? 'var(--accent-green)' : 'var(--text-secondary)',
                    }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Vendas</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.conversions_count}</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar" style={{ width: `${convPct}%` }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Comissão líquida</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>${item.net_commissions.toFixed(2)}</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar" style={{ width: `${netPct}%`, background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Tab Switch */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '4px',
        gap: '4px',
      }}>
        {(['subid1', 'subid2'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s',
              background: activeTab === tab ? 'var(--accent-green-dim)' : 'transparent',
              color: activeTab === tab ? 'var(--accent-green)' : 'var(--text-muted)',
              borderColor: activeTab === tab ? 'var(--accent-green)' : 'transparent',
            }}
          >
            {tab === 'subid1' ? '🔖 SubID 1 (Campanha)' : '🛍️ SubID 2 (Produto)'}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {[
          {
            label: 'IDs com vendas',
            value: activeTab === 'subid1'
              ? subIdData.filter(d => d.conversions_count > 0).length
              : subId2Data.filter(d => d.conversions_count > 0).length,
            color: 'var(--accent-green)',
          },
          {
            label: 'Total registros',
            value: activeTab === 'subid1' ? subIdData.length : subId2Data.length,
            color: 'var(--accent-blue)',
          },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: s.color, fontFamily: 'Space Grotesk, sans-serif' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {activeTab === 'subid1'
        ? renderTable(subIdData, 'subid')
        : renderTable(subId2Data, 'subid2')
      }
    </div>
  );
}
