export default defineNuxtRouteMiddleware(async () => {
  const { isSignedIn, fetchCurrentUser, user } = useKleaAuth()
  if (!isSignedIn.value) {
    return navigateTo('/login')
  }
  if (!user.value) {
    await fetchCurrentUser()
  }
})
