import { ref } from 'vue'

const isSidebarOpen = ref(false)

export const useSidebar = () => {
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
    console.log('Sidebar toggled! Now:', isSidebarOpen.value)
  }

  return {
    isSidebarOpen,
    toggleSidebar,
  }
}
