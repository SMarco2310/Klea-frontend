<!-- app/components/Docs/LanguageTabs.vue -->
<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DocsCodeBlock from './CodeBlock.vue'

// Same request shown in multiple languages — unlike TerminalBlock (which
// hardcodes lang="bash" for every tab), each tab here needs its own syntax
// highlighting language.
const props = defineProps<{
  samples: Record<string, { code: string; lang: string }>
}>()

const tabs = Object.keys(props.samples)
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
            class="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white text-zinc-400 hover:text-zinc-300 rounded-none pb-2.5 px-0 font-medium text-sm transition-none border-b-2 border-transparent focus-visible:ring-0 focus-visible:outline-none focus:outline-none"
          >
            {{ tab }}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        v-for="(sample, tab) in samples"
        :key="tab"
        :value="tab"
        class="mt-0 outline-none flex-grow"
      >
        <DocsCodeBlock
          :code="sample.code"
          :lang="sample.lang"
          class="!my-0 !border-0 !shadow-none !rounded-none"
        />
      </TabsContent>
    </Tabs>
  </div>
</template>
