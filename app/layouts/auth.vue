<template>
  <div class="min-h-screen flex items-center justify-center bg-[#0b0f14] bg-cover bg-center p-4 md:p-8 relative" style="background-image: url('/images/Gemini_Generated_Image_yvnpjhyvnpjhyvnp.png')">
    <!-- Overlay to slightly darken background for contrast, but NO blur -->
    <div class="absolute inset-0 bg-black/20"></div>
    
    <!-- Main Card Container -->
    <div class="w-full max-w-[1100px] min-h-[650px] flex flex-col md:flex-row rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] relative z-10">
      
      <!-- Left Form Side (Opaque).
           Deliberately a fixed dark panel in both themes, not var(--color-surface):
           it sits on a dark photo backdrop and the form inside uses hardcoded
           white text, so a light-mode surface would render white-on-white. -->
      <div class="w-full md:w-[45%] bg-[#1e293b] p-8 md:p-12 flex flex-col justify-center rounded-l-[2rem] border border-r-0 border-white/10 relative z-20">
        <slot />
      </div>

      <!-- Right Glass Side (Transparent) -->
      <div class="hidden md:block w-full md:w-[55%] relative rounded-r-[2rem] border border-l-0 border-white/20">
        <!-- Subtle inner glare to enhance glass effect -->
        <div class="absolute inset-0 rounded-r-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none"></div>
        <div class="absolute inset-y-0 left-0 w-px bg-white/10"></div>
      </div>

    </div>
  </div>
</template>
