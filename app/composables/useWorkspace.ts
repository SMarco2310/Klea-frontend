// app/composables/useWorkspace.ts
const workspace = ref({
  name: 'Kleaaaa',
  slug: 'kleaaaa',
  semoaApiKey: '',
  semoaMerchantId: '',
})

export function useWorkspace() {
  function updateSettings(patch: Partial<typeof workspace.value>) {
    workspace.value = { ...workspace.value, ...patch }
  }
  return { workspace, updateSettings }
}
