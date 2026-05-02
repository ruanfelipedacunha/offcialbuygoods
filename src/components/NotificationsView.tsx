import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, subscribeToPush, showLocalNotification } from '../notifications';

export default function NotificationsView() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    // Check if already subscribed
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const perm = await requestNotificationPermission();
      setPermission(perm);
      if (perm === 'granted') {
        await subscribeToPush();
        setIsSubscribed(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = () => {
    showLocalNotification(
      '🎉 Teste de Notificação!',
      'As notificações do BuyGoods Monitor estão funcionando perfeitamente.',
      'test'
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const getPermissionStatus = () => {
    if (permission === 'granted' && isSubscribed) {
      return { label: '✅ Ativadas', cls: 'success' };
    }
    if (permission === 'denied') {
      return { label: '🚫 Bloqueadas', cls: 'error' };
    }
    return { label: '⏳ Não ativadas', cls: 'warning' };
  };

  const status = getPermissionStatus();

  return (
    <div className="fade-in-up notification-panel">
      {/* Status Card */}
      <div className="notif-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3>🔔 Status das Notificações</h3>
          <span className={`status-chip ${status.cls}`}>{status.label}</span>
        </div>
        <p>
          Receba alertas instantâneos para cada nova venda, comissão recebida e atualizações importantes da sua conta BuyGoods.
        </p>
        {permission !== 'granted' && (
          <button
            className="btn-primary"
            onClick={handleEnableNotifications}
            disabled={isLoading || permission === 'denied'}
          >
            {isLoading ? '⏳ Ativando...' : '🔔 Ativar Notificações Push'}
          </button>
        )}
        {permission === 'denied' && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            lineHeight: '1.5',
          }}>
            As notificações foram bloqueadas no seu navegador. Para ativar, clique no ícone de cadeado na barra de endereço e habilite as notificações.
          </div>
        )}
        {permission === 'granted' && (
          <button
            className="btn-secondary"
            onClick={handleTestNotification}
            style={{ marginTop: '0' }}
          >
            {testSent ? '✅ Enviado!' : '🧪 Enviar Notificação Teste'}
          </button>
        )}
      </div>

      {/* How it works */}
      <div className="notif-card">
        <h3>⚡ Como Funciona</h3>
        <p style={{ marginBottom: '16px' }}>
          O app monitora seus dados automaticamente a cada 5 minutos e envia alertas quando detecta mudanças.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: '🎉', title: 'Nova Venda', desc: 'Alerta imediato quando uma nova conversão é detectada' },
            { icon: '💰', title: 'Comissão Recebida', desc: 'Notificação quando seu saldo de comissões aumenta' },
            { icon: '🔄', title: 'Auto-Refresh', desc: 'Dados atualizados automaticamente a cada 5 minutos' },
            { icon: '📊', title: 'Dashboard Live', desc: 'Badge LIVE mostra quando os dados estão sincronizados' },
          ].map(item => (
            <div key={item.title} style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              padding: '12px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              border: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div className="notif-card">
        <h3>🔑 Informações da Conta</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          {[
            { label: 'Account ID', value: '5316' },
            { label: 'Plataforma', value: 'BuyGoods / ClickCRM' },
            { label: 'Auto-refresh', value: 'A cada 5 minutos' },
            { label: 'Retenção de dados', value: '5 anos (diário) / 60 dias (hora)' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.label}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
