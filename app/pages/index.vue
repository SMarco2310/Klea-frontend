<!-- app/pages/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'default' })
import LandingNavbar from '~/components/landing/LandingNavbar.vue'
import HeroSection from '~/components/landing/HeroSection.vue'
import FeatureGrid from '~/components/landing/FeatureGrid.vue'
import HowItWorks from '~/components/landing/HowItWorks.vue'
import CodePreview from '~/components/landing/CodePreview.vue'
import PricingSection from '~/components/landing/PricingSection.vue'
import CtaBanner from '~/components/landing/CtaBanner.vue'
import LandingFooter from '~/components/landing/LandingFooter.vue'
</script>

<template>
  <div>
    <LandingNavbar />
    <HeroSection />
    <FeatureGrid />
    <HowItWorks />
    <CodePreview />
    <PricingSection />
    <CtaBanner />
    <LandingFooter />
  </div>
</template>
