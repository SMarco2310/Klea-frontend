// app/composables/useFeatures.ts
export interface Feature {
  id: number
  application_id: number
  name: string
  code: string
  description: string
  pivot?: {
    limit: number | null
  }
}

import { toValue, type MaybeRefOrGetter } from 'vue'

export function useFeatures(appId: MaybeRefOrGetter<number | string>) {
  const api = useApi()
  const features = ref<Feature[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function fetchFeatures() {
    pending.value = true
    error.value = null
    try {
      const page = await api.get<Paginated<Feature>>('/features')
      features.value = page.data.filter((f) => f.application_id === Number(toValue(appId)))
    } catch (e) {
      error.value = extractApiErrorMessage(e)
    } finally {
      pending.value = false
    }
  }

  async function createFeature(input: { name: string; code: string; description: string }) {
    const feature = await api.post<Feature>('/features', { ...input, application_id: Number(toValue(appId)) })
    features.value.push(feature)
    return feature
  }

  async function updateFeature(id: number, patch: Partial<Pick<Feature, 'name' | 'code' | 'description'>>) {
    const feature = await api.patch<Feature>(`/features/${id}`, patch)
    const idx = features.value.findIndex((f) => f.id === id)
    if (idx !== -1) features.value[idx] = feature
    return feature
  }

  async function deleteFeature(id: number) {
    await api.delete(`/features/${id}`)
    features.value = features.value.filter((f) => f.id !== id)
  }

  return { features, pending, error, fetchFeatures, createFeature, updateFeature, deleteFeature }
}
