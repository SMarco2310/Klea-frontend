<!-- app/pages/onboarding.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'auth' })
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const tenantName = ref('')
const slug = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const hasManuallyEditedSlug = ref(false)

watch(tenantName, (newVal) => {
  if (!hasManuallyEditedSlug.value) {
    slug.value = newVal
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }
})

function onSlugInput() {
  hasManuallyEditedSlug.value = true
}

const { createWorkspace } = useWorkspace()

async function handleSubmit() {
  if (!tenantName.value || !slug.value) return
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await createWorkspace(tenantName.value, slug.value)
    await navigateTo('/dashboard')
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
      <NuxtLink to="/" class="flex items-center gap-2">
        <span class="notranslate text-3xl font-heading font-bold text-white tracking-tight">Klea<span class="text-[var(--color-accent)]">.</span></span>
      </NuxtLink>
    </div>

    <h1 class="font-heading text-2xl font-semibold mb-2 text-white">Welcome to <span class="notranslate">Klea</span></h1>
    <p class="text-slate-400 text-sm mb-10">Let's set up your workspace to get started.</p>

    <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <Label for="tenantName" class="text-slate-300">Workspace Name</Label>
        <Input id="tenantName" v-model="tenantName" type="text" placeholder="e.g. Acme Corp" required 
               class="h-11 bg-[#1a1f26] border-[#27313f] rounded-lg text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]" />
      </div>
      
      <div class="space-y-2">
        <Label for="slug" class="text-slate-300">Workspace URL</Label>
        <div class="flex items-center h-11 bg-[#1a1f26] border border-[#27313f] rounded-lg focus-within:ring-1 focus-within:ring-[var(--color-accent)] focus-within:border-[var(--color-accent)] overflow-hidden transition-shadow">
          <span class="text-slate-500 pl-3 pr-2 select-none text-sm font-medium">klea.io/</span>
          <Input id="slug" v-model="slug" @input="onSlugInput" type="text" placeholder="acme-corp" required 
                 class="h-full flex-grow border-0 focus-visible:ring-0 bg-transparent text-white placeholder:text-slate-500 px-0" />
        </div>
      </div>
      
      <div class="py-2"></div>

      <Button type="submit" class="w-full cursor-pointer h-11 rounded-lg bg-white text-black hover:bg-slate-200 font-medium" :disabled="isSubmitting">
        {{ isSubmitting ? 'Creating workspace...' : 'Create workspace' }}
      </Button>
    </form>
  </div>
</template>
