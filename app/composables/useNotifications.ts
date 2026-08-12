import { ref, watch, onUnmounted } from 'vue'
import { toast } from 'vue-sonner'
import type { Transaction } from './useEarnings'
import type { Paginated } from './useApi'

export function useNotifications() {
  const api = useApi()
  const { mode } = useEnvMode()
  const { user } = useAppAuth()
  
  const recentTransactions = ref<Transaction[]>([])
  const lastSeenTxId = ref<number | null>(null)
  
  let pollInterval: any = null
  
  async function fetchRecentTransactions(isPolling = false) {
    if (!user.value) return
    
    try {
      const res = await api.get<Paginated<Transaction>>(`/transactions?environment=${mode.value}`)
      
      // We only want the first 5 transactions for the notification dropdown
      const newTxs = res.data.slice(0, 5)
      
      if (isPolling && lastSeenTxId.value !== null) {
        // Find transactions that are newer than the last seen
        const novelTxs = newTxs.filter(tx => tx.id > lastSeenTxId.value!)
        
        // Show toasts for novel successful transactions
        for (const tx of novelTxs) {
          if (tx.status === 'successful') {
            const formattedAmount = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: tx.currency || 'USD'
            }).format(tx.amount)
            toast.success(`New payment received: ${formattedAmount}`)
          }
        }
      }
      
      recentTransactions.value = newTxs
      
      if (newTxs.length > 0) {
        // Update highest seen ID
        const maxId = Math.max(...newTxs.map(t => t.id))
        lastSeenTxId.value = Math.max(lastSeenTxId.value || 0, maxId)
      }
      
    } catch (e) {
      // Silently fail for polling so we don't spam errors
      console.error('Failed to fetch recent transactions for notifications', e)
    }
  }

  function startPolling() {
    if (import.meta.server) return
    if (pollInterval) clearInterval(pollInterval)
    pollInterval = setInterval(() => {
      fetchRecentTransactions(true)
    }, 30000) // 30 seconds
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  // Fetch initial data
  if (import.meta.client) {
    fetchRecentTransactions(false)
    startPolling()
  }

  // Restart polling and fetch fresh data when mode changes
  watch(mode, () => {
    fetchRecentTransactions(false)
    startPolling()
  })
  
  onUnmounted(() => {
    stopPolling()
  })

  return {
    recentTransactions
  }
}
