import React, { useState } from 'react';
import type { SubIdData, SubId2Data } from '../types';

interface Props {
  subIdData: SubIdData[];
  subId2Data: SubId2Data[];
}

export default function SubIdsView({ subIdData, subId2Data }: Props) {
  const [activeTab, setActiveTab] = useState<'subid1' | 'subid2'>('subid1');

  const data = activeTab === 'subid1' ? subIdData : subId2Data;
  const sorted = [...data].sort((a, b) => b.net_commissions - a.net_commissions);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ padding: '4px', display: 'flex', gap: '4px' }}>
        <button 
          className={`nav-link ${activeTab === 'subid1' ? 'active' : ''}`}
          onClick={() => setActiveTab('subid1')}
          style={{ flex: 1, justifyContent: 'center', border: 'none' }}
        >
          🎯 Campanhas (SubID 1)
        </button>
        <button 
          className={`nav-link ${activeTab === 'subid2' ? 'active' : ''}`}
          onClick={() => setActiveTab('subid2')}
          style={{ flex: 1, justifyContent: 'center', border: 'none' }}
        >
          🛍️ Produtos (SubID 2)
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Identificador</th>
              <th>Visitas</th>
              <th>Vendas</th>
              <th style={{ textAlign: 'right' }}>Comissão Líquida</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 50).map((item, i) => {
              const id = (item as any).subid || (item as any).subid2 || '—';
              return (
                <tr key={id + i}>
                  <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{id}</td>
                  <td>{item.visits.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${item.conversions_count > 0 ? 'badge-success' : ''}`}>
                      {item.conversions_count}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--bg-accent)' }}>
                    ${item.net_commissions.toFixed(2)}
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Nenhum dado encontrado para este período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
