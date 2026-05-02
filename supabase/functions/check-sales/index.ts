import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import * as webpush from 'https://esm.sh/web-push@3.6.6'

const VAPID_PUBLIC_KEY = 'BMqEhsIsAFHlJQUiD4BHeeKvTDg5_R-4qEjHfg9qEIHM3s4W6JY10_1rAj8gyHcPm3Tv1SpzFgm83BKoE3_hv8Q'
const VAPID_PRIVATE_KEY = '7Ozu1bMqwErcVbBSR4KLdzPGRNu4cYXKiCqMFcMpk2o'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Get configuration
  const { data: configs, error: configError } = await supabase
    .from('monitor_config')
    .select('*')
  
  if (configError || !configs || configs.length === 0) {
    return new Response(JSON.stringify({ error: 'No subscriptions found' }), { status: 200 })
  }

  const results = []

  for (const config of configs) {
    try {
      // 2. Fetch data from BuyGoods/ClickCRM
      // (Using the logic from the user's config)
      const accountId = '5316'
      const token = 'b93D9puIHK28so8TAk2U4p38P%2BnpsnOySexmELdMS7ufAu2Z%2BD3mhz4t6tibcbrB6gG0oawtIWWM5lHimzzVCSvQJwNMZpqiZ7u%2B2hPXyrH%2FKrS1ZXO1ZKu0lTQPxCNC2jRU'
      
      const today = new Date().toISOString().split('T')[0]
      const url = `https://api.clickcrm.com/affiliates/v1/byday?a=${accountId}&token=${token}&date_from=${today}&date_to=${today}&response_type=json`
      
      const response = await fetch(url)
      const data = await response.json()
      
      const todayStats = data.data?.[0] || { visits: 0, conversions_count: 0, net_commissions: 0 }
      
      const newVisits = todayStats.visits - config.last_visits
      const newConversions = todayStats.conversions_count - config.last_conversions
      const newNet = todayStats.net_commissions - config.last_net_commissions

      if (newVisits > 0 || newConversions > 0 || newNet > 0) {
        // Send notification
        let title = '📊 Atualização BuyGoods'
        let body = ''
        
        if (newConversions > 0) {
          title = `🎉 +${newConversions} Nova${newConversions > 1 ? 's Vendas' : ' Venda'}!`
          body = `Total: ${todayStats.conversions_count} vendas hoje.`
        } else if (newNet > 0) {
          title = `💰 Comissão: +$${newNet.toFixed(2)}`
          body = `Novo saldo: $${todayStats.net_commissions.toFixed(2)}`
        } else if (newVisits > 0) {
          title = `👀 +${newVisits} Visita${newVisits > 1 ? 's' : ''}`
          body = `Total: ${todayStats.visits} visitas hoje.`
        }

        if (body) {
          webpush.setVapidDetails(
            'mailto:admin@buygoods.monitor',
            VAPID_PUBLIC_KEY,
            VAPID_PRIVATE_KEY
          )
          
          await webpush.sendNotification(
            config.subscription,
            JSON.stringify({ title, body })
          )
        }

        // Update DB
        await supabase
          .from('monitor_config')
          .update({
            last_conversions: todayStats.conversions_count,
            last_visits: todayStats.visits,
            last_net_commissions: todayStats.net_commissions,
            updated_at: new Date().toISOString()
          })
          .eq('id', config.id)
      }
      
      results.push({ id: config.id, status: 'ok' })
    } catch (err) {
      results.push({ id: config.id, status: 'error', message: err.message })
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  })
})
