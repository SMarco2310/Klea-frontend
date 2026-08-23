// app/middleware/admin.ts
// Guards admin pages. Checks the operator token only (useAdminToken(), the
// 'admin_token' cookie) — never the tenant 'auth_token' — so a signed-in
// tenant developer with no operator credentials is still redirected to the
// admin login instead of slipping through.
export default defineNuxtRouteMiddleware(() => {
  const token = useAdminToken()
  if (!token.value) {
    return navigateTo('/admin/login')
  }
})
