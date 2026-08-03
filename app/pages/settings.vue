<!-- app/pages/settings.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { Building2Icon, CreditCardIcon, SaveIcon, EyeIcon, EyeOffIcon } from '@lucide/vue'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'

const { workspace, updateSettings } = useWorkspace()
const name = ref(workspace.value.name)
const slug = ref(workspace.value.slug)
const apiKey = ref(workspace.value.semoaApiKey)
const merchantId = ref(workspace.value.semoaMerchantId)
const showApiKey = ref(false)

function handleSave() {
  updateSettings({
    name: name.value,
    slug: slug.value,
    semoaApiKey: apiKey.value,
    semoaMerchantId: merchantId.value,
  })
}
</script>

<template>
  <div class="max-w-xl">
    <h1 class="font-heading text-2xl font-semibold mb-8">Settings</h1>

    <section class="mb-8">
      <div class="flex items-center gap-2 mb-1">
        <Building2Icon class="w-4 h-4 text-slate-400" />
        <h2 class="font-heading font-semibold">Workspace</h2>
      </div>
      <p class="text-sm text-slate-400 mb-4">Public name and URL of your workspace.</p>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="ws-name">Workspace name</Label>
          <Input id="ws-name" v-model="name" />
        </div>
        <div class="space-y-2">
          <Label for="ws-slug">Slug</Label>
          <Input id="ws-slug" v-model="slug" />
        </div>
      </div>
    </section>

    <section class="mb-8">
      <div class="flex items-center gap-2 mb-1">
        <CreditCardIcon class="w-4 h-4 text-slate-400" />
        <h2 class="font-heading font-semibold">Payment gateway</h2>
      </div>
      <p class="text-sm text-slate-400 mb-4">Semoa credentials used to process payments for your subscribers.</p>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="semoa-key">Semoa API key</Label>
          <div class="relative">
            <Input
              id="semoa-key"
              v-model="apiKey"
              :type="showApiKey ? 'text' : 'password'"
              placeholder="semoa_live_..."
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
              :aria-label="showApiKey ? 'Hide API key' : 'Show API key'"
              @click="showApiKey = !showApiKey"
            >
              <component :is="showApiKey ? EyeOffIcon : EyeIcon" class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div class="space-y-2">
          <Label for="semoa-merchant">Semoa merchant ID</Label>
          <Input id="semoa-merchant" v-model="merchantId" placeholder="M-XXXXXX" />
        </div>
      </div>
    </section>

    <Button class="cursor-pointer gap-2" @click="handleSave">
      <SaveIcon class="w-4 h-4" /> Save changes
    </Button>
  </div>
</template>
