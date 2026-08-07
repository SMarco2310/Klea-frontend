<!-- app/pages/forgot-password.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

const email = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const isSent = ref(false)
const { forgotPassword } = useAppAuth()

async function handleSubmit() {
  if (!email.value) return
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await forgotPassword(email.value)
    isSent.value = true
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

    <template v-if="!isSent">
      <h1 class="font-heading text-2xl font-semibold mb-2 text-white">Forgot password</h1>
      <p class="text-slate-400 text-sm mb-10">Enter your email and we'll send you a reset link</p>

      <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
        {{ errorMessage }}
      </p>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <Input id="email" v-model="email" type="email" placeholder="Enter Email" required
                 class="h-11 bg-[#1a1f26] border-[#27313f] rounded-lg text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]" />
        </div>

        <div class="py-1"></div>

        <Button type="submit" class="w-full cursor-pointer h-11 rounded-lg bg-white text-black hover:bg-slate-200 font-medium" :disabled="isSubmitting">
          {{ isSubmitting ? 'Sending...' : 'Send reset link' }}
        </Button>
      </form>
    </template>

    <template v-else>
      <h1 class="font-heading text-2xl font-semibold mb-2 text-white">Check your email</h1>
      <p class="text-slate-400 text-sm mb-10">
        If an account exists for <span class="text-white">{{ email }}</span>, we've sent a link to reset your password.
      </p>
    </template>

    <p class="text-sm text-slate-400 mt-10 text-center">
      <NuxtLink to="/login" class="text-[var(--color-accent)] hover:underline cursor-pointer">Back to log in</NuxtLink>
    </p>
  </div>
</template>
