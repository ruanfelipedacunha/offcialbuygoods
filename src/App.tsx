import React, { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';
import { fetchDailyData, fetchHourlyData, fetchBySubId, fetchBySubId2, computeSummary } from './api';
import type { DayData, HourData, SubIdData, SubId2Data, ActiveTab } from './types';
import { requestNotificationPermission, checkForNewSales } from './notifications';
import Dashboard from './components/Dashboard';
import DailyView from './components/DailyView';
import HourlyView from './components/HourlyView';
import SubIdsView from './components/SubIdsView';
import NotificationsView from './components/NotificationsView';
import SettingsView from './components/SettingsView';
import { supabase } from './lib/supabase';
import { ApiSettings, Product } from './types';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'daily', label: 'Relatório Diário', icon: '📅' },
  { id: 'hourly', label: 'Por Hora', icon: '⏰' },
  { id: 'subids', label: 'Campanhas', icon: '🎯' },
  { id: 'notifications', label: 'Notificações', icon: '🔔' },
  { id: 'settings', label: 'Ajustes', icon: '⚙️' },
] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [days, setDays] = useState(7);
  const [summary, setSummary] = useState<any>(null);
  const [dailyData, setDailyData] = useState<DayData[]>([]);
  const [subIdData, setSubIdData] = useState<SubIdData[]>([]);
  const [subId2Data, setSubId2Data] = useState<SubId2Data[]>([]);
  const [activeApi, setActiveApi] = useState<ApiSettings | null>(null);
  const [apis, setApis] = useState<ApiSettings[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!activeApi) return;
    
    setIsRefreshing(true);
    try {
      const { account_id, token } = activeApi;
      const [daily, sub1, sub2] = await Promise.all([
        fetchDailyData(account_id, token, days),
        fetchBySubId(account_id, token, days),
        fetchBySubId2(account_id, token, days),
      ]);

      setDailyData(daily);
      setSubIdData(sub1);
      setSubId2Data(sub2);
      setSummary(computeSummary(daily, sub1));
      setLastUpdated(new Date());

      // Only check notifications on background refresh or force
      if (forceRefresh) {
        checkForNewSales(activeApi.account_id, activeApi.token, daily);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [activeApi, days]);

  useEffect(() => {
    async function init() {
      const { data: apiData } = await supabase.from('api_settings').select('*');
      const { data: productData } = await supabase.from('products').select('*');
      
      if (apiData && apiData.length > 0) {
        setApis(apiData);
        setProducts(productData || []);
        setActiveApi(apiData[0]);
      } else {
        setLoading(false);
        setActiveTab('settings');
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (activeApi) fetchData(true);
  }, [activeApi, days, fetchData]);

  const renderContent = () => {
    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            summary={summary} 
            dailyData={dailyData} 
            days={days} 
            setDays={setDays} 
            products={products.filter(p => p.api_settings_id === activeApi?.id)}
            subIdData={subIdData}
          />
        );
      case 'daily':
        return <DailyView dailyData={dailyData} days={days} setDays={setDays} />;
      case 'hourly':
        return <HourlyView accountId={activeApi?.account_id || ''} token={activeApi?.token || ''} />;
      case 'subids':
        return <SubIdsView subIdData={subIdData} subId2Data={subId2Data} />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--bg-accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>BG</div>
          <h2 style={{ fontSize: '18px' }}>BuyGoods <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>Monitor</span></h2>
        </div>

        <nav className="nav-list">
          {TABS.map(tab => (
            <div 
              key={tab.id} 
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '20px', background: '#f8fafc', borderRadius: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <div style={{ fontWeight: '700', marginBottom: '4px' }}>Status do Sistema</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%' }}></div>
            {lastUpdated ? `Atualizado ${lastUpdated.toLocaleTimeString()}` : 'Conectando...'}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div>
            <h1 style={{ fontSize: '24px' }}>{TABS.find(t => t.id === activeTab)?.label}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Dashboard de performance em tempo real</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {apis.length > 0 && (
              <select 
                className="account-selector"
                value={activeApi?.id}
                onChange={(e) => setActiveApi(apis.find(a => a.id === e.target.value) || null)}
              >
                {apis.map(api => (
                  <option key={api.id} value={api.id}>{api.label}</option>
                ))}
              </select>
            )}
            <button 
              className="refresh-btn" 
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              style={{ background: 'none', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
            >
              {isRefreshing ? '⌛' : '🔄'}
            </button>
          </div>
        </header>

        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        {TABS.map(tab => (
          <div 
            key={tab.id} 
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: '600', color: activeTab === tab.id ? 'var(--bg-accent)' : 'var(--text-muted)' }}>{tab.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}
