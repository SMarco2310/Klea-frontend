<!-- app/pages/sso-callback.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { loginWithClerkToken } = useAppAuth()
const clerk = useClerk()
const errorMessage = ref('')
const started = ref(false)

async function exchangeToken() {
  if (started.value) return
  started.value = true

  try {
    // Clerk's authenticateWithRedirect flow lands here mid-handshake — the
    // OAuth callback params are in the URL, but no session exists yet until
    // this actually runs. Without it, clerk.value.session stays null forever.
    await clerk.value?.handleRedirectCallback({}, () => {
      // Do nothing: we want to handle the navigation manually after backend auth
    })
  } catch (e) {
    errorMessage.value = 'Sign-in did not complete. Please try again.'
    return
  }

  const session = clerk.value?.session
  if (!session) {
    errorMessage.value = 'Sign-in did not complete. Please try again.'
    return
  }
  const clerkToken = await session.getToken()
  if (!clerkToken) {
    errorMessage.value = 'Sign-in did not complete. Please try again.'
    return
  }
  try {
    await loginWithClerkToken(clerkToken)
    await navigateTo('/dashboard')
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
