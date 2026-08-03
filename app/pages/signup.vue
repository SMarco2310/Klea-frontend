<!-- app/pages/signup.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const name = ref('')
const email = ref('')
const password = ref('')
const { signup } = useAuth()

function handleSubmit() {
  if (!name.value || !email.value || !password.value) return
  signup(name.value, email.value, password.value)
  navigateTo('/dashboard')
}
</script>

<template>
  <div class="bg-[var(--color-surface)] border border-[var(--color-border-dark)] rounded-xl p-8">
    <h1 class="font-heading text-2xl font-semibold mb-1">Create your account</h1>
    <p class="text-slate-400 text-sm mb-6">Start issuing licenses in minutes</p>
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <Label for="name">Full name</Label>
        <Input id="name" v-model="name" placeholder="Ada Lovelace" required />
      </div>
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input id="email" v-model="email" type="email" placeholder="you@example.com" required />
      </div>
      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input id="password" v-model="password" type="password" placeholder="••••••••" required />
      </div>
      <Button type="submit" class="w-full cursor-pointer">Create account</Button>
    </form>
    <p class="text-sm text-slate-400 mt-6 text-center">
      Already have an account?
      <NuxtLink to="/login" class="text-[var(--color-accent)] cursor-pointer">Log in</NuxtLink>
    </p>
  </div>
</template>
