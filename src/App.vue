<template>
  <router-view v-slot="{ Component, route }">
    <transition name="app-route" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </router-view>
</template>

<style scoped>
.app-route-enter-active,
.app-route-leave-active {
  transition:
    opacity 320ms ease,
    transform 320ms ease,
    filter 320ms ease;
}

.app-route-enter-from,
.app-route-leave-to {
  opacity: 0;
  transform: translateY(18px) scale(0.992);
  filter: blur(8px);
}
</style>
