<!-- app/pages/reset-password.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })
import { EyeIcon, EyeOffIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

const route = useRoute()
const token = computed(() => String(route.query.token ?? ''))
const email = computed(() => String(route.query.email ?? ''))

const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)
const { resetPassword } = useAppAuth()

async function handleSubmit() {
  if (!password.value || !passwordConfirmation.value) return
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await resetPassword(token.value, email.value, password.value, passwordConfirmation.value)
    await navigateTo('/login?reset=success')
  } catch (e) {
    errorMessage.value = extractAuthErrorMessage(e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm mx-auto flex flex-col h-full justify-center pb-12">
    <!-- Logo Placeholder -->
    <div class="mb-16">
      <NuxtLink to="/" class="flex items-center gap-2">
        <span class="text-3xl font-heading font-bold text-white tracking-tight">Klea<span class="text-[var(--color-accent)]">.</span></span>
      </NuxtLink>
    </div>

    <h1 class="font-heading text-2xl font-semibold mb-2 text-white">Reset password</h1>
    <p class="text-slate-400 text-sm mb-10">Choose a new password for {{ email }}</p>

    <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="relative">
        <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="New password" required
               class="h-11 bg-[#1a1f26] border-[#27313f] rounded-lg text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] pr-11" />
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
        <Input id="password_confirmation" v-model="passwordConfirmation" :type="showPassword ? 'text' : 'password'" placeholder="Confirm new password" required
               class="h-11 bg-[#1a1f26] border-[#27313f] rounded-lg text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] pr-11" />
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="showPassword = !showPassword"
        >
          <component :is="showPassword ? EyeOffIcon : EyeIcon" class="w-4 h-4" />
        </button>
      </div>

      <div class="py-1"></div>

      <Button type="submit" class="w-full cursor-pointer h-11 rounded-lg bg-white text-black hover:bg-slate-200 font-medium" :disabled="isSubmitting">
        {{ isSubmitting ? 'Resetting...' : 'Reset password' }}
      </Button>
    </form>

    <p class="text-sm text-slate-400 mt-10 text-center">
      <NuxtLink to="/login" class="text-[var(--color-accent)] hover:underline cursor-pointer">Back to log in</NuxtLink>
    </p>
  </div>
</template>
