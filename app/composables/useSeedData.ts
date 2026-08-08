// app/composables/useSeedData.ts
// Backs useEarnings.ts only — every other entity (plans, features, subscribers,
// subscriptions, webhooks, api keys) has since moved to the real API. Kept
// separate from useApps/useSubscriptions' real types (hence the "Seed" prefix)
// so this mock data doesn't collide with them.
export interface SeedApp {
  id: string
  name: string
  slug: string
  status: 'active' | 'inactive'
  webhookUrl: string | null
}
export interface SeedSubscription {
  id: string
  appId: string
  subscriberId: string
  planId: string
  status: 'active' | 'past_due' | 'canceled'
  env: 'test' | 'live'
  createdAt: string
  amount: number
}

const apps = ref<SeedApp[]>([])
const subscriptions = ref<SeedSubscription[]>([])
let seeded = false

export function useSeedData() {
  if (!seeded) {
    seeded = true
    const appId = 'app-demo'
    apps.value = [
      { id: appId, name: 'Demo App', slug: 'demo-app', status: 'active', webhookUrl: null },
    ]
    subscriptions.value = [
      { id: 'txn-1', appId, subscriberId: 'sub-1', planId: 'plan-pro', status: 'active', env: 'live', createdAt: '2026-06-01', amount: 29000 },
      { id: 'txn-2', appId, subscriberId: 'sub-2', planId: 'plan-basic', status: 'active', env: 'live', createdAt: '2026-07-10', amount: 9000 },
      { id: 'txn-3', appId, subscriberId: 'sub-3', planId: 'plan-basic', status: 'active', env: 'test', createdAt: '2026-08-01', amount: 9000 },
    ]
  }

  return { apps, subscriptions }
}
