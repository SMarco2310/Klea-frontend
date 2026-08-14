<script setup lang="ts">
import { ref } from 'vue'
import { Copy, Check, ChevronDown, ChevronUp } from '@lucide/vue'
import { useClipboard } from '@vueuse/core'

const props = withDefaults(defineProps<{
  code: string
  lang?: string
  filename?: string
  expandable?: boolean
  maxHeight?: string
}>(), {
  lang: 'typescript',
  expandable: false,
  maxHeight: '300px'
})

const { copy, copied } = useClipboard()

const isExpanded = ref(!props.expandable)

const toggleExpand = () => {
  if (props.expandable) {
    isExpanded.value = !isExpanded.value
  }
}
</script>

<template>
  <div class="relative flex flex-col rounded-xl border border-white/10 bg-[#0d0d0d] overflow-hidden my-4 shadow-xl">
    <!-- Header -->
    <div v-if="filename" class="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#161616]">
      <span class="text-sm font-mono text-zinc-300 font-medium">{{ filename }}</span>
      <button 
        @click="copy(code)" 
        class="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10"
        title="Copy code"
      >
        <Check v-if="copied" class="w-4 h-4 text-green-500" />
        <Copy v-else class="w-4 h-4" />
      </button>
    </div>
    
    <!-- Code Content -->
    <div 
      class="relative transition-all duration-300 ease-in-out"
      :style="{ maxHeight: isExpanded ? 'none' : maxHeight }"
      :class="{ 'overflow-hidden': !isExpanded }"
    >
      <!-- Absolute Copy Button if no header -->
      <button 
        v-if="!filename"
        @click="copy(code)" 
        class="absolute right-4 top-4 z-10 text-zinc-500 hover:text-white transition-colors p-1.5 rounded-md bg-white/5 hover:bg-white/10 backdrop-blur-sm"
        title="Copy code"
      >
        <Check v-if="copied" class="w-4 h-4 text-green-500" />
        <Copy v-else class="w-4 h-4" />
      </button>

      <div class="p-4 text-[13px] font-mono overflow-x-auto custom-scrollbar leading-relaxed">
        <Shiki :code="code" :lang="lang as any" />
      </div>

      <!-- Expand Fade Overlay -->
      <div 
        v-if="expandable && !isExpanded" 
        class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent pointer-events-none flex items-end justify-center pb-6"
      >
        <button 
          @click="toggleExpand"
          class="pointer-events-auto flex items-center gap-2 text-xs font-medium text-zinc-300 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors backdrop-blur-md shadow-lg border border-white/5"
        >
          <ChevronDown class="w-4 h-4" />
          Expand code
        </button>
      </div>
    </div>
    
    <!-- Collapse Button (when expanded) -->
    <div v-if="expandable && isExpanded" class="flex justify-center p-2 border-t border-white/5 bg-[#0d0d0d]/50">
      <button 
        @click="toggleExpand"
        class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 py-1"
      >
        <ChevronUp class="w-3 h-3" />
        Collapse
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Customize Shiki default padding/margin */
:deep(pre.shiki) {
  margin: 0;
  background: transparent !important;
  filter: brightness(1.2);
}

:deep(pre.shiki code) {
  display: block;
}

:deep(pre.shiki span) {
  background-color: transparent !important;
}

.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
