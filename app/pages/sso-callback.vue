<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { loginWithClerkToken, user } = useAppAuth()
const clerk = useClerk()
const errorMessage = ref('')
const started = ref(false)

async function exchangeToken() {
  if (started.value) return
  started.value = true

  // Landing here with no OAuth params at all (direct visit, refresh after the
  // handshake already consumed them) is not a failure worth reporting as one —
  // handleRedirectCallback resolves without creating a session, which is
  // indistinguishable from a real error unless we check first.
  const hasCallbackParams = typeof window !== 'undefined'
    && /__clerk|__client_transfer|rotating_token_nonce/.test(window.location.search + window.location.hash)

  if (!hasCallbackParams && !clerk.value?.session) {
    errorMessage.value = 'This sign-in link is no longer valid. Please start again from the login page.'
    return
  }

  try {
    // Clerk's authenticateWithRedirect flow lands here mid-handshake — the
    // OAuth callback params are in the URL, but no session exists yet until
    // this actually runs. Without it, clerk.value.session stays null forever.
    await clerk.value?.handleRedirectCallback({}, async (to: string) => {
      // Do nothing: we want to handle the navigation manually after backend auth
    })
  } catch (e: any) {
    // Surface Clerk's own reason (unverified email, CAPTCHA failure, provider
    // denial). The generic message hid which of these actually happened.
    console.error('Clerk redirect callback failed:', e)
    errorMessage.value = e?.errors?.[0]?.longMessage
      || e?.errors?.[0]?.message
      || e?.message
      || 'Sign-in did not complete. Please try again.'
    return
  }

  const session = clerk.value?.session
  if (!session) {
    // handleRedirectCallback can resolve while leaving the sign-up in a
    // "needs more input" state (missing email, CAPTCHA pending) rather than
    // throwing. Report that status instead of a blanket failure.
    const status = clerk.value?.client?.signUp?.status
      || clerk.value?.client?.signIn?.status
    const missing = clerk.value?.client?.signUp?.missingFields?.join(', ')

    console.error('No session after redirect callback', { status, missing })
    errorMessage.value = missing
      ? `Sign-in needs more information (${missing}). Please try again.`
      : 'Sign-in did not complete. Please try again.'
    return
  }
  const clerkToken = await session.getToken()
  if (!clerkToken) {
    errorMessage.value = 'Sign-in did not complete. Please try again.'
    return
  }
  try {
    await loginWithClerkToken(clerkToken)
    if (user.value?.current_tenant_id) {
      await navigateTo('/dashboard')
    } else {
      await navigateTo('/onboarding')
    }
  } catch (e) {
    errorMessage.value = 'Could not complete sign-in with our server. Please try again.'
  }
}

watchEffect(() => {
  if (clerk.value?.loaded) {
    exchangeToken()
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="text-center">
      <p v-if="!errorMessage" class="text-slate-400">Completing sign-in...</p>
      <div v-else class="space-y-4">
        <p class="text-sm text-red-400">{{ errorMessage }}</p>
        <NuxtLink to="/login" class="text-[var(--color-accent)] cursor-pointer text-sm">
          Back to login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
