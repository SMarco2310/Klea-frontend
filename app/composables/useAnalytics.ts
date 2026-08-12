// app/composables/useAnalytics.ts
import type { Subscription } from './useSubscriptions'
import type { Ref } from 'vue'

function bucketByDate(subscriptions: Subscription[], value: (s: Subscription) => number, range: number) {
  const buckets = new Map<string, number>()
  for (const s of subscriptions) {
    const d = new Date(s.created_at)
    let key = ''
    if (range <= 30) {
      key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else {
      key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
    buckets.set(key, (buckets.get(key) ?? 0) + value(s))
  }
  
  // Sort chronologically
  return [...buckets.entries()]
    .map(([date, amount]) => {
      // Adding a dummy year if bucketing by day to make parsing robust
      const time = new Date(range <= 30 ? `${date}, ${new Date().getFullYear()}` : date).getTime()
      return { date, amount, time }
    })
    .sort((a, b) => a.time - b.time)
    .map(({ date, amount }) => ({ date, amount }))
}

function periodDelta(currentAmt: number, previousAmt: number) {
  if (previousAmt === 0) return null
  return Math.round(((currentAmt - previousAmt) / previousAmt) * 100)
}

export function useAnalytics(appId: number | string, timeRange: Ref<number> = ref(30)) {
  const { subscriptions, pending, error, fetchSubscriptions } = useSubscriptions(appId)

  // Subscriptions created within the current selected time period
  const currentPeriodSubscriptions = computed(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - timeRange.value)
    const cutoffTime = cutoff.getTime()
    return subscriptions.value.filter(s => new Date(s.created_at).getTime() >= cutoffTime)
  })

  // Subscriptions created within the previous equivalent time period (for delta)
  const previousPeriodSubscriptions = computed(() => {
    const currentCutoff = new Date()
    currentCutoff.setDate(currentCutoff.getDate() - timeRange.value)
    
    const previousCutoff = new Date(currentCutoff)
    previousCutoff.setDate(previousCutoff.getDate() - timeRange.value)
    
    const currentCutoffTime = currentCutoff.getTime()
    const previousCutoffTime = previousCutoff.getTime()
    
    return subscriptions.value.filter(s => {
      const t = new Date(s.created_at).getTime()
      return t >= previousCutoffTime && t < currentCutoffTime
    })
  })

  const activeSubs = computed(() => {
    return new Set(currentPeriodSubscriptions.value.filter((s) => s.status === 'active').map((s) => s.subscriber_id)).size
  })
  const prevActiveSubs = computed(() => {
    return new Set(previousPeriodSubscriptions.value.filter((s) => s.status === 'active').map((s) => s.subscriber_id)).size
  })

  const revenue = computed(() =>
    currentPeriodSubscriptions.value
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + Number(s.plan?.price ?? 0), 0)
  )
  const prevRevenue = computed(() =>
    previousPeriodSubscriptions.value
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + Number(s.plan?.price ?? 0), 0)
  )

  const transactions = computed(() => currentPeriodSubscriptions.value.length)

  const successRate = computed(() => {
    if (transactions.value === 0) return null
    const successful = currentPeriodSubscriptions.value.filter((s) => s.status === 'active').length
    return Math.round((successful / transactions.value) * 100)
  })

  const revenueTrend = computed(() => bucketByDate(currentPeriodSubscriptions.value, (s) => Number(s.plan?.price ?? 0), timeRange.value))
  const subscriptionTrend = computed(() => bucketByDate(currentPeriodSubscriptions.value, () => 1, timeRange.value))
  
  const revenueDelta = computed(() => periodDelta(revenue.value, prevRevenue.value))
  const subscriptionsDelta = computed(() => periodDelta(activeSubs.value, prevActiveSubs.value))

  const planDistribution = computed(() => {
    const counts = new Map<string, number>()
    for (const s of currentPeriodSubscriptions.value) {
      if (s.status !== 'active' || !s.plan) continue
      counts.set(s.plan.name, (counts.get(s.plan.name) ?? 0) + 1)
    }
    return [...counts.entries()].map(([name, count]) => ({ name, count }))
  })

  const recentSubscriptions = computed(() =>
    [...currentPeriodSubscriptions.value]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)
  )

  return {
    activeSubs,
    revenue,
    transactions,
    successRate,
    revenueTrend,
    subscriptionTrend,
    revenueDelta,
    subscriptionsDelta,
    planDistribution,
    recentSubscriptions,
    pending,
    error,
    fetchAnalytics: fetchSubscriptions,
  }
}
