import { VAPID_PUBLIC_KEY } from './config';

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
    if (existing) return existing;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
    });
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

// Track previous state to detect new sales/conversions
let previousConversions = -1;
let previousNetCommissions = -1;

export function checkForNewSales(
  currentConversions: number,
  currentNetCommissions: number
) {
  if (previousConversions === -1) {
    previousConversions = currentConversions;
    previousNetCommissions = currentNetCommissions;
    return;
  }

  if (currentConversions > previousConversions) {
    const newSales = currentConversions - previousConversions;
    showLocalNotification(
      `🎉 ${newSales} Nova${newSales > 1 ? 's Vendas' : ' Venda'}!`,
      `Você fez ${newSales} nova${newSales > 1 ? 's vendas' : ' venda'} na BuyGoods! Total: ${currentConversions} conversões.`,
      'new-sale'
    );
  }

  if (currentNetCommissions > previousNetCommissions) {
    const diff = (currentNetCommissions - previousNetCommissions).toFixed(2);
    showLocalNotification(
      `💰 Comissão Recebida: +$${diff}`,
      `Seu saldo de comissões aumentou! Total atual: $${currentNetCommissions.toFixed(2)}`,
      'new-commission'
    );
  }

  previousConversions = currentConversions;
  previousNetCommissions = currentNetCommissions;
}
