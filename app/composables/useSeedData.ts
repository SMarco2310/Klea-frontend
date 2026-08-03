// app/composables/useSeedData.ts
export interface App {
  id: string
  name: string
  slug: string
  status: 'active' | 'inactive'
  webhookUrl: string | null
}
export interface Plan {
  id: string
  appId: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
}
export interface Feature {
  id: string
  appId: string
  key: string
  description: string
}
export interface Subscriber {
  id: string
  appId: string
  email: string
  planId: string
  status: 'active' | 'canceled'
  joinedAt: string
  env: 'test' | 'live'
}
export interface Subscription {
  id: string
  appId: string
  subscriberId: string
  planId: string
  status: 'active' | 'past_due' | 'canceled'
  env: 'test' | 'live'
  createdAt: string
  amount: number
}
export interface WebhookDelivery {
  id: string
  appId: string
  event: string
  status: 'success' | 'failed'
  createdAt: string
}
export interface ApiKey {
  id: string
  appId: string
  name: string
  env: 'test' | 'live'
  maskedKey: string
  createdAt: string
}

const apps = ref<App[]>([])
const plans = ref<Plan[]>([])
const features = ref<Feature[]>([])
const subscribers = ref<Subscriber[]>([])
const subscriptions = ref<Subscription[]>([])
const webhookDeliveries = ref<WebhookDelivery[]>([])
const apiKeys = ref<ApiKey[]>([])
let seeded = false

export function useSeedData() {
  if (!seeded) {
    seeded = true
    const appId = 'app-demo'
    apps.value = [
      { id: appId, name: 'Demo App', slug: 'demo-app', status: 'active', webhookUrl: null },
    ]
    const proPlanId = 'plan-pro'
    const basicPlanId = 'plan-basic'
    plans.value = [
      { id: basicPlanId, appId, name: 'Basic', price: 9, interval: 'month', features: ['feat-auth'] },
      { id: proPlanId, appId, name: 'Pro', price: 29, interval: 'month', features: ['feat-auth', 'feat-api'] },
    ]
    features.value = [
      { id: 'feat-auth', appId, key: 'auth_multiple', description: 'User can sign in on multiple devices' },
      { id: 'feat-api', appId, key: 'api_access', description: 'Access to the REST API' },
    ]
    subscribers.value = [
      { id: 'sub-1', appId, email: 'ada@example.com', planId: proPlanId, status: 'active', joinedAt: '2026-06-01', env: 'live' },
      { id: 'sub-2', appId, email: 'grace@example.com', planId: basicPlanId, status: 'active', joinedAt: '2026-07-10', env: 'live' },
      { id: 'sub-3', appId, email: 'test@example.com', planId: basicPlanId, status: 'active', joinedAt: '2026-08-01', env: 'test' },
    ]
    subscriptions.value = [
      { id: 'txn-1', appId, subscriberId: 'sub-1', planId: proPlanId, status: 'active', env: 'live', createdAt: '2026-06-01', amount: 29 },
      { id: 'txn-2', appId, subscriberId: 'sub-2', planId: basicPlanId, status: 'active', env: 'live', createdAt: '2026-07-10', amount: 9 },
      { id: 'txn-3', appId, subscriberId: 'sub-3', planId: basicPlanId, status: 'active', env: 'test', createdAt: '2026-08-01', amount: 9 },
    ]
    webhookDeliveries.value = []
    apiKeys.value = []
  }

  return { apps, plans, features, subscribers, subscriptions, webhookDeliveries, apiKeys }
}
