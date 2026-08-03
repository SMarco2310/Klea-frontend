<!-- app/pages/login.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const email = ref('')
const password = ref('')
const { login } = useAuth()

function handleSubmit() {
  if (!email.value || !password.value) return
  login(email.value, password.value)
  navigateTo('/dashboard')
}
</script>

<template>
  <div class="bg-[var(--color-surface)] border border-[var(--color-border-dark)] rounded-xl p-8">
    <h1 class="font-heading text-2xl font-semibold mb-1">Welcome back</h1>
    <p class="text-slate-400 text-sm mb-6">Log in to your Klea workspace</p>
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input id="email" v-model="email" type="email" placeholder="you@example.com" required />
      </div>
      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input id="password" v-model="password" type="password" placeholder="••••••••" required />
      </div>
      <Button type="submit" class="w-full cursor-pointer">Log in</Button>
    </form>
    <p class="text-sm text-slate-400 mt-6 text-center">
      No account?
      <NuxtLink to="/signup" class="text-[var(--color-accent)] cursor-pointer">Sign up</NuxtLink>
    </p>
  </div>
</template>
