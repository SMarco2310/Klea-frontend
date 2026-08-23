// app/middleware/admin.ts
// Guards admin pages. Checks the operator token only (useAdminToken(), the
// 'admin_token' cookie) — never the tenant 'auth_token' — so a signed-in
// tenant developer with no operator credentials is still redirected to the
// admin login instead of slipping through.
export default defineNuxtRouteMiddleware(async () => {
  const token = useAdminToken()
  if (!token.value) {
    return navigateTo('/admin/login')
  }

  const { admin, fetchCurrentAdmin } = useAdminAuth()
  if (!admin.value) {
    try {
      await fetchCurrentAdmin()
    } catch {
      // Presence of a cookie is not proof of a live session: a revoked or
      // expired token would otherwise leave the operator on an empty queue
      // with no route back to the login page. Mirrors app/middleware/auth.ts.
      return navigateTo('/admin/login')
    }
  }
})
