<!-- app/components/layout/AppSwitcherModal.vue -->
<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { CheckIcon, SettingsIcon, SearchIcon, NetworkIcon, HelpCircleIcon, StarIcon } from '@lucide/vue'
import CreateAppModal from '~/components/layout/CreateAppModal.vue'

const open = defineModel<boolean>('open', { required: true })
const { apps, selectApp } = useApps()
const search = ref('')
const showCreate = ref(false)
const route = useRoute()
const currentSlug = computed(() => route.params.slug as string)

const activeTab = ref('Recent')

const filtered = computed(() =>
  apps.value.filter((a) => a.name.toLowerCase().includes(search.value.toLowerCase()))
)

function pick(slug: string) {
  open.value = false
  selectApp(slug)
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-[760px] p-0 gap-0 border border-[#3c4043] bg-[#2d2e31] text-[#e8eaed] shadow-2xl rounded-lg font-sans overflow-hidden [&>button.absolute]:hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4">
        <DialogHeader class="p-0">
          <DialogTitle class="text-[22px] font-normal tracking-wide text-[#e8eaed]">Select a project</DialogTitle>
        </DialogHeader>
        <div class="flex items-center gap-2">
          <button class="bg-[#a8c7fa] text-[#202124] p-1.5 rounded flex items-center justify-center transition-colors">
            <SettingsIcon class="w-4 h-4" />
          </button>
          <button class="text-[#8ab4f8] hover:bg-[#8ab4f8]/10 px-3 py-1.5 rounded font-medium text-sm flex items-center gap-1 transition-colors" @click="showCreate = true">
            New app
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="px-6 pt-2 pb-4">
        <div class="relative mt-1 group">
          <label class="absolute -top-2.5 left-3 bg-[#2d2e31] px-1 text-xs text-[#8ab4f8] z-10 transition-colors font-medium">Search apps and folders</label>
          <div class="relative flex items-center border-2 border-[#8ab4f8] rounded bg-transparent overflow-hidden">
            <SearchIcon class="w-5 h-5 text-[#e8eaed] ml-3 opacity-70" />
            <input 
              v-model="search"
              type="text" 
              class="block w-full bg-transparent border-0 py-2 pl-3 text-[#e8eaed] focus:ring-0 outline-none sm:text-sm" 
            />
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="px-6 border-b border-[#3c4043]">
        <div class="flex gap-6 text-sm">
          <button 
            v-for="tab in ['Recent', 'Starred', 'All']" 
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'px-2 py-2 font-medium border-b-[3px] transition-colors',
              activeTab === tab ? 'text-[#8ab4f8] border-[#8ab4f8]' : 'text-[#9aa0a6] border-transparent hover:text-[#e8eaed]'
            ]"
          >
            {{ tab }}
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="flex-grow overflow-y-auto max-h-[350px] min-h-[250px] bg-[#202124]">
        <table class="min-w-full text-sm text-left border-collapse">
          <thead class="sticky top-0 z-10 bg-[#202124] border-b border-[#3c4043]">
            <tr>
              <th scope="col" class="w-12 px-2 py-2 font-medium text-[#e8eaed]"></th>
              <th scope="col" class="px-2 py-2 font-medium text-[#e8eaed]">Name</th>
              <th scope="col" class="px-2 py-2 font-medium text-[#e8eaed]">Type</th>
              <th scope="col" class="px-2 py-2 font-medium text-[#e8eaed]">ID</th>
              <th scope="col" class="w-12 px-6 py-2 font-medium text-[#e8eaed] text-right"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#3c4043]">
            <tr 
              v-for="app in filtered" 
              :key="app.id" 
              class="hover:bg-[#3c4043]/50 cursor-pointer group" 
              @click="pick(app.slug)"
            >
              <td class="px-2 py-2 whitespace-nowrap text-center align-middle w-12">
                <CheckIcon v-if="app.slug === currentSlug" class="w-5 h-5 text-[#8ab4f8] mx-auto" />
              </td>
              <td class="px-2 py-2 whitespace-nowrap align-middle">
                <div class="flex items-center gap-2">
                  <NetworkIcon class="w-5 h-5 text-[#e8eaed]" />
                  <span class="text-[#8ab4f8] group-hover:underline text-[15px]">{{ app.name }}</span>
                  <HelpCircleIcon class="w-4 h-4 text-[#9aa0a6]" />
                </div>
              </td>
              <td class="px-2 py-2 whitespace-nowrap text-[#9aa0a6] align-middle">App</td>
              <td class="px-2 py-2 whitespace-nowrap text-[#9aa0a6] align-middle">{{ app.slug }}</td>
              <td class="px-6 py-2 whitespace-nowrap text-right align-middle">
                <StarIcon class="w-5 h-5 text-[#9aa0a6] inline-block hover:text-[#e8eaed] hover:fill-[#e8eaed]" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-[#2d2e31] border-t border-[#3c4043] flex justify-end">
        <button class="text-[#e8eaed] hover:bg-white/5 px-4 py-2 rounded font-medium text-sm transition-colors uppercase tracking-wide" @click="open = false">Cancel</button>
      </div>
    </DialogContent>
  </Dialog>
  <CreateAppModal v-model:open="showCreate" />
</template>
