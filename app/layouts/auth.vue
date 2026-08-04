<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--color-bg)] bg-cover bg-center p-4 md:p-8 relative" style="background-image: url('/images/auth-bg.png')">
    <!-- Optional overlay to darken background slightly -->
    <div class="absolute inset-0 bg-black/40"></div>
    
    <!-- Main Card Container -->
    <div class="w-full max-w-[1100px] min-h-[650px] flex flex-col md:flex-row rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 border border-white/10 bg-white/5 backdrop-blur-md">
      
      <!-- Left Form Side -->
      <div class="w-full md:w-[45%] bg-[#12171c] p-8 md:p-12 flex flex-col justify-center border-r border-white/5">
        <slot />
      </div>

      <!-- Right Glass/Image Side -->
      <div class="hidden md:flex w-full md:w-[55%] relative items-center justify-center p-12">
        <div class="absolute inset-0 bg-gradient-to-br from-[var(--color-surface)]/20 to-transparent"></div>
        <!-- You can place a logo or some abstract 3D element here if desired -->
      </div>

    </div>
  </div>
</template>
