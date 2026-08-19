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
import ScrollReveal from '~/components/landing/ScrollReveal.vue'
import GridBeams from '~/components/landing/GridBeams.vue'
</script>

<template>
  <div class="overflow-x-hidden">
    <GridBeams />

    <LandingNavbar />
    
    <HeroSection />
    
    <ScrollReveal direction="up" :duration="800">
      <FeatureGrid />
    </ScrollReveal>
    
    <ScrollReveal direction="up" :duration="800">
      <HowItWorks />
    </ScrollReveal>
    
    <ScrollReveal direction="fade" :duration="800">
      <CodePreview />
    </ScrollReveal>
    
    <ScrollReveal direction="up" :duration="800">
      <PricingSection />
    </ScrollReveal>
    
    <ScrollReveal direction="up" :duration="800">
      <CtaBanner />
    </ScrollReveal>
    
    <LandingFooter />
  </div>
</template>
