export default defineNuxtRouteMiddleware(async () => {
  const { isSignedIn, fetchCurrentUser, user } = useAppAuth()
  if (!isSignedIn.value) {
    return navigateTo('/login')
  }
  if (!user.value) {
    try {
      await fetchCurrentUser()
    } catch {
      // Token was rejected (expired/revoked) — fetchCurrentUser already
      // cleared it; send the user back to log in instead of leaving them
      // on a page that has no valid session behind it.
      return navigateTo('/login')
    }
  }
})
