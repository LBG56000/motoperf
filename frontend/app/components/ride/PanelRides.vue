<script setup lang="ts">
import { ref } from 'vue'
import type { IRide } from '~/types/ride.js'
import CardRide from './CardRide.vue'

interface IProps {
  filteredRides: IRide[]
}

const props = defineProps<IProps>()
const isSidebarOpen = ref(false) // État du volet latéral (ouvert/fermé)
</script>

<template>
  <div class="sidebar" :class="{ 'is-open': isSidebarOpen }">
    <div class="toggle-wrapper">
      <UButton
        :icon="
          isSidebarOpen ? 'i-lucide-chevron-right' : 'i-lucide-chevron-left'
        "
        color="neutral"
        variant="subtle"
        class="sidebar-toggle"
        @click="isSidebarOpen = !isSidebarOpen"
      />
    </div>

    <div class="sidebar-content">
      <h3 class="sidebar-title">Liste des balades</h3>
      <div class="ride-container">
        <div
          v-for="ride in props.filteredRides"
          :key="ride._id"
          class="ride-item"
        >
          <CardRide
            :ride="ride"
            @update:like="(newCount) => (ride.like = newCount)"
            @update:participants="
              (newList) => (ride.participating_user = newList)
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ride-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 20px;
}

.ride-item {
  border-radius: 12px;
  height: auto;
  width: 100%;
}

.sidebar {
  position: absolute;
  top: 80px;
  bottom: 20px;
  right: 0;
  width: 40dvw;
  background-color: var(--background);
  backdrop-filter: blur(8px);
  z-index: 1020;
  transition: transform 0.3s ease-in-out;
  transform: translateX(100%);
  border-left: 1px solid #e5e7eb;
  border-radius: 12px 0 0 12px;
  display: flex;
}

.sidebar.is-open {
  transform: translateX(0);
}

.toggle-wrapper {
  position: absolute;
  left: -40px;
  top: 50%;
  transform: translateY(-50%);
  height: 40px;
  width: 40px;
  z-index: 1002;
}

.sidebar-toggle {
  width: 40px;
  height: 40px;
  border-radius: 8px 0 0 8px !important;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  background-color: var(--background) !important;
}

.sidebar-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  font-family: sans-serif;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-color);
}

@media (max-width: 1024px) {
  .sidebar {
    width: 90dvw;
  }
}
</style>
