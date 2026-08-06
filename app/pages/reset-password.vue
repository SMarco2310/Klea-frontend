<!-- app/pages/reset-password.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

const route = useRoute()
const token = computed(() => String(route.query.token ?? ''))
const email = computed(() => String(route.query.email ?? ''))

const password = ref('')
const passwordConfirmation = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const { resetPassword } = useKleaAuth()

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
      <div>
        <Input id="password" v-model="password" type="password" placeholder="New password" required
               class="h-11 bg-[#1a1f26] border-[#27313f] rounded-lg text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]" />
      </div>
      <div>
        <Input id="password_confirmation" v-model="passwordConfirmation" type="password" placeholder="Confirm new password" required
               class="h-11 bg-[#1a1f26] border-[#27313f] rounded-lg text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]" />
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
