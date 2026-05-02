import { VAPID_PUBLIC_KEY } from './config';
import { supabase } from './lib/supabase';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  const permission = await Notification.requestPermission();
  return permission;
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    
    let subscription = existing;
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
      });
    }

    if (subscription) {
      // Save or update subscription in Supabase
      const { error } = await supabase
        .from('monitor_config')
        .upsert({
          endpoint: subscription.endpoint,
          subscription: subscription.toJSON(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'endpoint' });
      
      if (error) {
        console.error('Error saving subscription to Supabase:', error);
        alert('Erro ao salvar no Supabase: ' + error.message);
      } else {
        alert('✅ Sucesso! Seu aparelho foi registrado para notificações 24h.');
      }
    }

    return subscription;
  } catch (err) {
    console.error('Failed to subscribe to push:', err);
    return null;
  }
}

export function showLocalNotification(title: string, body: string, tag?: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: tag || 'buygoods-notification',
        vibrate: [200, 100, 200],
        data: { url: '/' },
      } as any);
    });
  } else {
    new Notification(title, { body, icon: '/pwa-192x192.png' });
  }
}

// Track previous state to detect new events
let previousConversions = -1;
let previousNetCommissions = -1;
let previousVisits = -1;

export function checkForNewSales(
  currentConversions: number,
  currentNetCommissions: number,
  currentVisits: number
) {
  // First run: just initialize the values
  if (previousConversions === -1) {
    previousConversions = currentConversions;
    previousNetCommissions = currentNetCommissions;
    previousVisits = currentVisits;
    return;
  }

  // Check for new visits
  if (currentVisits > previousVisits) {
    const newVisits = currentVisits - previousVisits;
    showLocalNotification(
      `👀 +${newVisits} Nova${newVisits > 1 ? 's Visitas' : ' Visita'}`,
      `Você recebeu ${newVisits} nova${newVisits > 1 ? 's visitas' : ' visita'} no seu link!`,
      'new-visit'
    );
  }

  // Check for new sales
  if (currentConversions > previousConversions) {
    const newSales = currentConversions - previousConversions;
    showLocalNotification(
      `🎉 ${newSales} Nova${newSales > 1 ? 's Vendas' : ' Venda'}!`,
      `Você fez ${newSales} nova${newSales > 1 ? 's vendas' : ' venda'} na BuyGoods! Total: ${currentConversions} conversões.`,
      'new-sale'
    );
  }

  // Check for commission increases
  if (currentNetCommissions > previousNetCommissions) {
    const diff = (currentNetCommissions - previousNetCommissions).toFixed(2);
    showLocalNotification(
      `💰 Comissão Recebida: +$${diff}`,
      `Seu saldo de comissões aumentou! Total atual: $${currentNetCommissions.toFixed(2)}`,
      'new-commission'
    );
  }

  // Update history
  previousConversions = currentConversions;
  previousNetCommissions = currentNetCommissions;
  previousVisits = currentVisits;
}
