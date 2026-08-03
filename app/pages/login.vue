<!-- app/pages/login.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const { login } = useAuth()
const { signIn, isLoaded } = useSignIn()

async function handleSubmit() {
  if (!email.value || !password.value) return
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await login(email.value, password.value)
    await navigateTo('/dashboard')
  } catch (e) {
    errorMessage.value = extractAuthErrorMessage(e)
  } finally {
    isSubmitting.value = false
  }
}

async function handleOAuth(strategy: 'oauth_google' | 'oauth_github') {
  if (!isLoaded.value || !signIn.value) return
  errorMessage.value = ''
  try {
    await signIn.value.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/sso-callback',
    })
  } catch (e) {
    errorMessage.value = 'Could not start sign-in. Please try again.'
  }
}
</script>

<template>
  <div class="bg-[var(--color-surface)] border border-[var(--color-border-dark)] rounded-xl p-8">
    <h1 class="font-heading text-2xl font-semibold mb-1">Welcome back</h1>
    <p class="text-slate-400 text-sm mb-6">Log in to your Klea workspace</p>

    <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input id="email" v-model="email" type="email" placeholder="you@example.com" required />
      </div>
      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input id="password" v-model="password" type="password" placeholder="••••••••" required />
      </div>
      <Button type="submit" class="w-full cursor-pointer" :disabled="isSubmitting">
        {{ isSubmitting ? 'Logging in...' : 'Log in' }}
      </Button>
    </form>

    <div class="flex items-center gap-3 my-6">
      <div class="h-px bg-[var(--color-border-dark)] flex-1" />
      <span class="text-xs text-slate-500">or continue with</span>
      <div class="h-px bg-[var(--color-border-dark)] flex-1" />
    </div>

    <div class="space-y-2">
      <Button variant="secondary" class="w-full cursor-pointer" @click="handleOAuth('oauth_google')">
        Continue with Google
      </Button>
      <Button variant="secondary" class="w-full cursor-pointer" @click="handleOAuth('oauth_github')">
        Continue with GitHub
      </Button>
    </div>

    <p class="text-sm text-slate-400 mt-6 text-center">
      No account?
      <NuxtLink to="/signup" class="text-[var(--color-accent)] cursor-pointer">Sign up</NuxtLink>
    </p>
  </div>
</template>
