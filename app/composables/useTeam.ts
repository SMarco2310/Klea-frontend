// app/composables/useTeam.ts
export interface TeamInvitation {
  id: number
  tenant_id: number
  email: string
  role: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at: string
  created_at: string
}

export function useTeam() {
  const api = useApi()
  const invitations = ref<TeamInvitation[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function fetchInvitations() {
    pending.value = true
    error.value = null
    try {
      const page = await api.get<Paginated<TeamInvitation>>('/tenant-invitations')
      invitations.value = page.data.filter((i) => i.status === 'pending')
    } catch (e) {
      error.value = extractApiErrorMessage(e)
    } finally {
      pending.value = false
    }
  }

  async function inviteMember(email: string, role: string) {
    // The backend passes expires_at straight through to the insert even when
    // omitted, which nulls out a NOT NULL column and 500s — send it explicitly.
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const invitation = await api.post<TeamInvitation>('/tenant-invitations', { email, role, expires_at: expiresAt })
    invitations.value.push(invitation)
    return invitation
  }

  async function revokeInvitation(id: number) {
    await api.delete(`/tenant-invitations/${id}`)
    invitations.value = invitations.value.filter((i) => i.id !== id)
  }

  return { invitations, pending, error, fetchInvitations, inviteMember, revokeInvitation }
}
