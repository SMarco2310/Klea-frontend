// app/composables/useAuth.ts
const user = ref<{ name: string; email: string } | null>(null)

export function useAuth() {
  const isLoggedIn = computed(() => user.value !== null)

  function login(email: string, _password: string) {
    user.value = { name: email.split('@')[0], email }
  }
  function signup(name: string, email: string, _password: string) {
    user.value = { name, email }
  }
  function logout() {
    user.value = null
  }

  return { user, isLoggedIn, login, signup, logout }
}
