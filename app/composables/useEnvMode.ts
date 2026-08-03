// app/composables/useEnvMode.ts
const mode = ref<'test' | 'live'>('live')

export function useEnvMode() {
  function toggle() {
    mode.value = mode.value === 'live' ? 'test' : 'live'
  }
  return { mode, toggle }
}
