<!-- app/pages/apps/[slug]/overview.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { WebhookIcon } from '@lucide/vue'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import TheSubTabs from '~/components/layout/TheSubTabs.vue'

const { currentApp, apps } = useApps()

const webhookUrl = ref(currentApp.value?.webhookUrl ?? '')

function saveWebhook() {
  const app = apps.value.find((a) => a.id === currentApp.value?.id)
  if (app) app.webhookUrl = webhookUrl.value || null
}
</script>

<template>
  <div v-if="currentApp">
    <TheSubTabs />
    <div class="max-w-xl">
      <h2 class="font-heading font-semibold mb-1">App details</h2>
      <p class="text-sm text-slate-400 mb-6">{{ currentApp.name }} · {{ currentApp.slug }}</p>

      <div class="flex items-center gap-2 mb-1">
        <WebhookIcon class="w-4 h-4 text-slate-400" />
        <h3 class="font-medium">Webhook endpoint</h3>
      </div>
      <p class="text-sm text-slate-400 mb-4">We'll POST subscription events to this URL.</p>
      <div class="space-y-2 mb-4">
        <Label for="webhook-url">Endpoint URL</Label>
        <Input id="webhook-url" v-model="webhookUrl" placeholder="https://yourapp.com/webhooks/klea" />
      </div>
      <Button class="cursor-pointer" @click="saveWebhook">Save</Button>
    </div>
  </div>
</template>
