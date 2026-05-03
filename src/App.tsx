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
  { id: 'dashboard', label: 'Início', icon: '🏠' },
  { id: 'daily', label: 'Diário', icon: '📅' },
  { id: 'hourly', label: 'Horas', icon: '⏰' },
  { id: 'subids', label: 'SubIDs', icon: '🔖' },
  { id: 'notifications', label: 'Alertas', icon: '🔔' },
  { id: 'settings', label: 'Ajustes', icon: '⚙️' },
] as const;


export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [dailyData, setDailyData] = useState<DayData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourData[]>([]);
  const [subIdData, setSubIdData] = useState<SubIdData[]>([]);
  const [subId2Data, setSubId2Data] = useState<SubId2Data[]>([]);
  const [activeApi, setActiveApi] = useState<ApiSettings | null>(null);
  const [apis, setApis] = useState<ApiSettings[]>([]);
  const [products, setProducts] = useState<Product[]>([]);



  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      // 1. Fetch settings if not loaded
      let currentApi = activeApi;
      if (!currentApi) {
        const { data: apiData } = await supabase.from('api_settings').select('*');
        const { data: productData } = await supabase.from('products').select('*');
        
        if (apiData && apiData.length > 0) {
          setApis(apiData);
          setProducts(productData || []);
          currentApi = apiData[0];
          setActiveApi(apiData[0]);
        }
      }


      if (!currentApi) {
        setLoading(false);
        setIsRefreshing(false);
        return; // Wait for user to configure API in settings
      }

      const daily = await fetchDailyData(currentApi.account_id, currentApi.token, days);
      const hourly = await fetchHourlyData(currentApi.account_id, currentApi.token, Math.min(days, 30));
      const sub1 = await fetchBySubId(currentApi.account_id, currentApi.token, days);
      const sub2 = await fetchBySubId2(currentApi.account_id, currentApi.token, days);

      setDailyData(daily);
      setHourlyData(hourly);
      setSubIdData(sub1);
      setSubId2Data(sub2);
      setLastUpdated(new Date());

      const summary = computeSummary(daily);
      checkForNewSales(summary.totalConversions, summary.totalNetCommissions, summary.totalVisits);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(msg);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [days, activeApi]);


  useEffect(() => {
    fetchAll(true);
  }, [fetchAll]);

  // Auto refresh
  useEffect(() => {
    intervalRef.current = setInterval(() => fetchAll(false), REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAll]);

  const summary = computeSummary(dailyData);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-overlay">
          <div className="loader" />
          <span className="loading-text">Carregando seus dados...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-card fade-in-up">
          <h3>⚠️ Erro de Conexão</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => fetchAll(true)} style={{ marginTop: '16px' }}>
            Tentar Novamente
          </button>
        </div>
      );
    }

    if (!activeApi && !loading) {
      return (
        <div className="error-card fade-in-up" style={{ background: 'var(--bg-card)', borderColor: 'var(--accent-green-glow)' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚀</div>
          <h3 style={{ color: 'var(--accent-green)' }}>Bem-vindo ao BuyGoods Monitor</h3>
          <p>Para começar, configure sua conta de API nas definições.</p>
          <button className="btn-primary" onClick={() => setActiveTab('settings')} style={{ marginTop: '16px' }}>
            Configurar API
          </button>
        </div>
      );
    }

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
        return <HourlyView hourlyData={hourlyData} />;
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
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">💹</div>
          <div>
            <div className="header-title">BuyGoods</div>
            <div className="header-subtitle">
              {lastUpdated
                ? `Atualizado ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                : 'Sincronizando...'}
            </div>
          </div>
        </div>
        
        {apis.length > 1 && (
          <select 
            className="account-switcher"
            value={activeApi?.id}
            onChange={(e) => {
              const api = apis.find(a => a.id === e.target.value);
              if (api) setActiveApi(api);
            }}
          >
            {apis.map(api => (
              <option key={api.id} value={api.id}>{api.label}</option>
            ))}
          </select>
        )}

        <div className="header-actions">

          <div className="live-badge">
            <div className="live-dot" />
            LIVE
          </div>
          <button
            className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`}
            onClick={() => fetchAll(false)}
            title="Atualizar dados"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as ActiveTab)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
