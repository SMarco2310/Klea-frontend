<!-- app/pages/admin/login.vue -->
<script setup lang="ts">
// No 'admin' middleware here deliberately — this is the one admin page an
// unauthenticated operator must be able to reach (see app/middleware/admin.ts).
definePageMeta({ layout: 'auth' })

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const { login } = useAdminAuth()

async function handleSubmit() {
  if (!email.value || !password.value) return
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await login(email.value, password.value)
    await navigateTo('/admin')
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm mx-auto flex flex-col h-full justify-center pb-12">
    <div class="mb-16">
      <span class="notranslate text-3xl font-heading font-bold text-white tracking-tight">Klea<span class="text-[var(--color-accent)]">.</span></span>
    </div>

    <h1 class="font-heading text-2xl font-semibold mb-2 text-white">Operator login</h1>
    <p class="text-slate-400 text-sm mb-10">Sign in to the admin console.</p>

    <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <Label for="email" class="text-slate-300">Email</Label>
        <Input id="email" v-model="email" type="email" placeholder="operator@klea.com" required
               class="h-11 bg-[#1a1f26] border-[#27313f] rounded-lg text-white [--autofill-bg:#1a1f26] [--autofill-fg:white] placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]" />
      </div>
      <div class="space-y-2">
        <Label for="password" class="text-slate-300">Password</Label>
        <Input id="password" v-model="password" type="password" placeholder="Enter password" required
               class="h-11 bg-[#1a1f26] border-[#27313f] rounded-lg text-white [--autofill-bg:#1a1f26] [--autofill-fg:white] placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]" />
      </div>

      <div class="py-1"></div>

      <Button type="submit" class="w-full cursor-pointer h-11 rounded-lg bg-white text-black hover:bg-slate-200 font-medium" :disabled="isSubmitting">
        {{ isSubmitting ? 'Logging in...' : 'Log in' }}
      </Button>
    </form>
  </div>
</template>
