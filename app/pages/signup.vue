<!-- app/pages/signup.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })
import { EyeIcon, EyeOffIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)
const { register, user } = useAppAuth()
const { signIn, isLoaded } = useSignIn()
const clerk = useClerk()

function getPasswordError(value: string): string {
  if (value.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter.'
  if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter.'
  if (!/[0-9]/.test(value)) return 'Password must contain at least one number.'
  if (!/[^A-Za-z0-9]/.test(value)) return 'Password must contain at least one special character.'
  return ''
}

async function handleSubmit() {
  if (!name.value || !email.value || !password.value || !passwordConfirmation.value) return
  errorMessage.value = ''

  const passwordError = getPasswordError(password.value)
  if (passwordError) {
    errorMessage.value = passwordError
    return
  }
  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  isSubmitting.value = true
  try {
    await register(name.value, email.value, password.value, passwordConfirmation.value)
    if (user.value?.current_tenant_id) {
      await navigateTo('/dashboard')
    } else {
      await navigateTo('/onboarding')
    }
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
    errorMessage.value = e?.message || e?.errors?.[0]?.message || 'Could not start sign-up. Please try again.'
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

    <h1 class="font-heading text-2xl font-semibold mb-2 text-white">Sign up</h1>
    <p class="text-slate-400 text-sm mb-10">Start issuing licenses in minutes</p>

    <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <Input id="name" v-model="name" placeholder="Enter Full Name" required 
               class="h-11 bg-[#1a1f26] border-[#27313f] rounded-lg text-white [--autofill-bg:#1a1f26] [--autofill-fg:white] placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]" />
      </div>
      <div>
        <Input id="email" v-model="email" type="email" placeholder="Enter Email" required 
               class="h-11 bg-[#1a1f26] border-[#27313f] rounded-lg text-white [--autofill-bg:#1a1f26] [--autofill-fg:white] placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]" />
      </div>
      <div class="relative">
        <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Create Password" required
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
      <div class="relative">
        <Input id="password_confirmation" v-model="passwordConfirmation" :type="showPassword ? 'text' : 'password'" placeholder="Confirm Password" required
               class="h-11 bg-[#1a1f26] border-[#27313f] rounded-lg text-white [--autofill-bg:#1a1f26] [--autofill-fg:white] placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] pr-11" />
      </div>

      <div class="flex items-center gap-2 py-1">
        <input type="checkbox" id="terms" class="w-4 h-4 rounded border-[#27313f] bg-[#1a1f26] checked:bg-[var(--color-accent)] focus:ring-[var(--color-accent)]" required />
        <label for="terms" class="text-xs text-slate-400 select-none cursor-pointer">I Agree To The Terms & Privacy Policy</label>
      </div>

      <Button type="submit" class="w-full cursor-pointer h-11 rounded-lg bg-white text-black hover:bg-slate-200 font-medium mt-2" :disabled="isSubmitting">
        {{ isSubmitting ? 'Creating account...' : 'Create Account' }}
      </Button>
    </form>

    <div class="flex items-center gap-3 my-8">
      <div class="h-px bg-white/10 flex-1" />
      <span class="text-xs text-slate-500">or sign up via</span>
      <div class="h-px bg-white/10 flex-1" />
    </div>

    <div class="flex items-center gap-4">
      <Button variant="secondary" class="flex-1 cursor-pointer h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg gap-2" @click="handleOAuth('oauth_google')">
        <img src="/images/google.png" alt="Google" class="w-5 h-5 opacity-90" />
        Google
      </Button>
      <Button variant="secondary" class="flex-1 cursor-pointer h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg gap-2" @click="handleOAuth('oauth_github')">
        <img src="/images/github.png" alt="GitHub" class="w-5 h-5 opacity-90" />
        GitHub
      </Button>
    </div>

    <p class="text-sm text-slate-400 mt-10 text-center">
      Already Have An Account?
      <NuxtLink to="/login" class="text-[var(--color-accent)] hover:underline cursor-pointer">Login</NuxtLink>
    </p>
  </div>
</template>
