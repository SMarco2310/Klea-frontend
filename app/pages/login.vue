<!-- app/pages/login.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })
import { EyeIcon, EyeOffIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const route = useRoute()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)
const showResetSuccess = ref(route.query.reset === 'success')
const { login, user } = useAppAuth()
const { signIn, isLoaded } = useSignIn()
const clerk = useClerk()

async function handleSubmit() {
  if (!email.value || !password.value) return
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    const workspaceSlug = await login(email.value, password.value)
    // Straight to the workspace when we know it: /dashboard is only an
    // interstitial that looks the slug up and redirects, costing an extra
    // page load on every sign-in.
    await navigateTo(workspaceSlug ? `/${workspaceSlug}/dashboard` : '/dashboard')
  } catch (e) {
    errorMessage.value = extractAuthErrorMessage(e)
  } finally {
    isSubmitting.value = false
  }
}

async function handleOAuth(strategy: 'oauth_google' | 'oauth_github') {
  if (!isLoaded.value || !signIn.value) {
    errorMessage.value = 'Still loading sign-in, please try again in a moment.'
    return
  }
  errorMessage.value = ''
  
  try {
    if (clerk.value?.session) {
      await clerk.value.signOut()
    }
  } catch (e) {
    // Ignore signout errors
  }

  try {
    await signIn.value.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/sso-callback',
    })
  } catch (e: any) {
    console.error('OAuth error:', e)
    errorMessage.value = e?.message || e?.errors?.[0]?.message || 'Could not start sign-in. Please try again.'
  }
}
</script>

<template>
  <div class="w-full max-w-sm mx-auto flex flex-col h-full justify-center pb-12">
    <!-- Logo Placeholder -->
    <div class="mb-16">
      <NuxtLink to="/" class="flex items-center gap-2">
        <span class="notranslate text-3xl font-heading font-bold text-white tracking-tight">Klea<span class="text-[var(--color-accent)]">.</span></span>
      </NuxtLink>
    </div>

    <h1 class="font-heading text-2xl font-semibold mb-2 text-white">Log in</h1>
    <p class="text-slate-400 text-sm mb-10">Log in to your <span class="notranslate">Klea</span> workspace</p>

    <p v-if="showResetSuccess" class="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-md px-3 py-2 mb-4">
      Password updated — log in with your new password.
    </p>

    <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <Input id="email" v-model="email" type="email" placeholder="Enter Email" required
               class="h-11 bg-[#1a1f26] border-[#27313f] rounded-lg text-white [--autofill-bg:#1a1f26] [--autofill-fg:white] placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]" />
      </div>
      <div class="relative">
        <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Enter Password" required
               class="h-11 bg-[#1a1f26] border-[#27313f] rounded-lg text-white [--autofill-bg:#1a1f26] [--autofill-fg:white] placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] pr-11" />
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="showPassword = !showPassword"
        >
          <component :is="showPassword ? EyeOffIcon : EyeIcon" class="w-4 h-4" />
        </button>
      </div>
      <div class="text-right -mt-2">
        <NuxtLink to="/forgot-password" class="text-xs text-slate-400 hover:text-[var(--color-accent)] hover:underline cursor-pointer">Forgot password?</NuxtLink>
      </div>

      <div class="py-1"></div>

      <Button type="submit" class="w-full cursor-pointer h-11 rounded-lg bg-white text-black hover:bg-slate-200 font-medium" :disabled="isSubmitting">
        {{ isSubmitting ? 'Logging in...' : 'Log in' }}
      </Button>
    </form>

    <div class="flex items-center gap-3 my-8">
      <div class="h-px bg-white/10 flex-1" />
      <span class="text-xs text-slate-500">or log in via</span>
      <div class="h-px bg-white/10 flex-1" />
    </div>

    <!-- Clerk's Smart CAPTCHA (Turnstile) renders here. The instance has
         captcha_widget_type=smart, and without this element Clerk falls back to
         the Invisible widget, which fails on localhost and makes OAuth/sign-up
         abort before a session is ever created. -->
    <div id="clerk-captcha" class="empty:hidden mb-4" />

    <div class="flex items-center gap-4">
      <Button variant="secondary" class="flex-1 cursor-pointer h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg gap-2 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!isLoaded" @click="handleOAuth('oauth_google')">
        <img src="/images/google.png" alt="Google" class="w-5 h-5 opacity-90" />
        Google
      </Button>
      <Button variant="secondary" class="flex-1 cursor-pointer h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg gap-2 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!isLoaded" @click="handleOAuth('oauth_github')">
        <img src="/images/github.png" alt="GitHub" class="w-5 h-5 opacity-90" />
        GitHub
      </Button>
    </div>

    <p class="text-sm text-slate-400 mt-10 text-center">
      Already Have An Account?
      <NuxtLink to="/signup" class="text-[var(--color-accent)] hover:underline cursor-pointer">Sign up</NuxtLink>
    </p>
  </div>
</template>
