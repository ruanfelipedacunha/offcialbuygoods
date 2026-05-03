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
              className="glass"
              style={{
                padding: '16px 20px',
              }}
            >

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    background: i < 3 ? 'var(--p-dim)' : 'var(--bg-card-hover)',
                    border: `1px solid ${i < 3 ? 'var(--border-glow)' : 'var(--border-light)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '800',
                    color: i < 3 ? 'var(--p-neon)' : 'var(--text-low)',
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
                <span className="font-space" style={{ fontSize: '15px', fontWeight: '700', color: 'var(--p-neon)' }}>
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
                      fontSize: '15px', fontWeight: '700',
                      color: stat.highlight ? 'var(--p-neon)' : 'var(--text-high)',
                    }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: '700' }}>{stat.label}</div>

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
                    <div className="progress-bar" style={{ width: `${netPct}%`, background: 'var(--s-purple)' }} />
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
      <div className="glass" style={{
        display: 'flex',
        padding: '4px',
        gap: '4px',
      }}>
        {(['subid1', 'subid2'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: activeTab === tab ? 'var(--p-neon)' : 'transparent',
              color: activeTab === tab ? 'var(--bg-dark)' : 'var(--text-low)',
            }}
          >
            {tab === 'subid1' ? '🎯 Campanhas' : '📦 Produtos'}
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
            color: 'var(--p-neon)',
          },
          {
            label: 'Total registros',
            value: activeTab === 'subid1' ? subIdData.length : subId2Data.length,
            color: 'var(--a-blue)',
          },
        ].map(s => (
          <div key={s.label} className="glass" style={{
            flex: 1, padding: '12px', textAlign: 'center',
          }}>
            <div className="font-space" style={{ fontSize: '20px', fontWeight: '700', color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: '700', marginTop: '2px' }}>{s.label}</div>
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
