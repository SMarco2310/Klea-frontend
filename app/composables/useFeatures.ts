// app/composables/useFeatures.ts
export function useFeatures(appId: string) {
  const { features } = useSeedData()

  const scopedFeatures = computed(() => features.value.filter((f) => f.appId === appId))

  function createFeature(input: Omit<import('./useSeedData').Feature, 'id' | 'appId'>) {
    const feature = { ...input, id: `feat-${Date.now()}`, appId }
    features.value.push(feature)
    return feature
  }
  function updateFeature(id: string, patch: Partial<import('./useSeedData').Feature>) {
    const idx = features.value.findIndex((f) => f.id === id)
    if (idx !== -1) features.value[idx] = { ...features.value[idx], ...patch } as import('./useSeedData').Feature
  }
  function deleteFeature(id: string) {
    features.value = features.value.filter((f) => f.id !== id)
  }

  return { features: scopedFeatures, createFeature, updateFeature, deleteFeature }
}
