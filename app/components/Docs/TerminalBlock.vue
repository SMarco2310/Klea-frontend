<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DocsCodeBlock from './CodeBlock.vue'

const props = defineProps<{
  commands: Record<string, string>
}>()

const tabs = Object.keys(props.commands)
const defaultTab = tabs[0]
</script>

<template>
  <div class="rounded-xl border border-white/10 bg-[#0d0d0d] overflow-hidden my-4 shadow-xl flex flex-col">
    <Tabs :default-value="defaultTab" class="w-full flex flex-col">
      <div class="border-b border-white/5 bg-[#161616] px-4 pt-3 flex items-center">
        <TabsList class="bg-transparent h-auto p-0 gap-6">
          <TabsTrigger 
            v-for="tab in tabs" 
            :key="tab" 
            :value="tab"
            class="data-active:!bg-transparent data-active:!shadow-none data-active:!text-[var(--color-accent)] data-active:!border-b-2 data-active:!border-b-[var(--color-accent)] data-active:!border-x-transparent data-active:!border-t-transparent text-zinc-400 hover:text-zinc-300 rounded-none pb-2.5 px-0 font-medium text-sm transition-none border-b-2 border-transparent uppercase focus-visible:ring-0 focus-visible:outline-none focus:outline-none"
          >
            {{ tab }}
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent 
        v-for="(command, tab) in commands" 
        :key="tab" 
        :value="tab"
        class="mt-0 outline-none flex-grow"
      >
        <DocsCodeBlock 
          :code="command" 
          lang="bash" 
          filename="terminal"
          class="!my-0 !border-0 !shadow-none !rounded-none" 
        />
      </TabsContent>
    </Tabs>
  </div>
</template>
