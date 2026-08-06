<!-- app/components/dashboard/VerifyEmailBanner.vue -->
<script setup lang="ts">
import { MailWarningIcon, XIcon, CheckIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'

const { user, resendVerificationEmail } = useKleaAuth()

const dismissed = ref(false)
const isSending = ref(false)
const sent = ref(false)

const shouldShow = computed(() => !dismissed.value && !!user.value && !user.value.email_verified_at)

async function handleResend() {
  isSending.value = true
  try {
    await resendVerificationEmail()
    sent.value = true
  } catch {
    // Silently ignore — a failed resend isn't worth blocking the user with an error state here.
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div
    v-if="shouldShow"
    class="flex items-center gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 mb-6"
  >
    <MailWarningIcon class="w-4 h-4 text-amber-400 shrink-0" />
    <p class="text-sm text-amber-200 flex-1">
      <template v-if="sent">Verification email sent — check your inbox.</template>
      <template v-else>Verify your email to unlock all features.</template>
    </p>
    <Button
      v-if="!sent"
      variant="ghost"
      size="sm"
      class="cursor-pointer h-7 text-amber-200 hover:text-amber-100 hover:bg-amber-400/10"
      :disabled="isSending"
      @click="handleResend"
    >
      {{ isSending ? 'Sending...' : 'Resend email' }}
    </Button>
    <CheckIcon v-else class="w-4 h-4 text-amber-400 shrink-0" />
    <button
      class="text-amber-400/70 hover:text-amber-200 cursor-pointer shrink-0"
      aria-label="Dismiss"
      @click="dismissed = true"
    >
      <XIcon class="w-4 h-4" />
    </button>
  </div>
</template>
