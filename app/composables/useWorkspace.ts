// app/composables/useWorkspace.ts
const workspace = ref({
  name: 'Kleaaaa',
  slug: 'kleaaaa',
  semoaApiKey: '',
  semoaMerchantId: '',
  currency: 'XAF',
})

export function useWorkspace() {
  function updateSettings(patch: Partial<typeof workspace.value>) {
    workspace.value = { ...workspace.value, ...patch }
  }
  return { workspace, updateSettings }
}
