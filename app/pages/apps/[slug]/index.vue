<!-- app/pages/apps/[slug]/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const route = useRoute()
await navigateTo(`/apps/${route.params.slug}/analytics`, { redirectCode: 302 })
</script>
<template><div /></template>
