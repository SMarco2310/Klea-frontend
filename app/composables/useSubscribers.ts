// app/composables/useSubscribers.ts
import type { MaybeRefOrGetter } from 'vue'
import type { Subscriber } from './useSubscriptions'

export function useSubscribers(appId: MaybeRefOrGetter<number | string>) {
  const { subscriptions, pending, error, fetchSubscriptions } = useSubscriptions(appId)

  // The API has no per-application subscribers endpoint — a subscriber only
  // links to an app through their subscriptions, so "subscribers of this
  // app" is derived by deduping the subscriber on each app-scoped subscription.
  const subscribers = computed(() => {
    const seen = new Map<number, Subscriber>()
    for (const s of subscriptions.value) {
      if (s.subscriber && !seen.has(s.subscriber.id)) seen.set(s.subscriber.id, s.subscriber)
    }
    return [...seen.values()]
  })

  return { subscribers, pending, error, fetchSubscribers: fetchSubscriptions }
}
