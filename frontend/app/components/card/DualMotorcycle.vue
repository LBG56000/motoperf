<script setup lang="ts">


const props = defineProps<{
  leftMotorcycleUrl?: string;
  leftName?: string;
  rightMotorcycleUrl?: string;
  rightName?: string;
}>();

const emit = defineEmits<{
  (e: 'compare' | 'delete'): void
}>()

</script>

<template>
  <div class="dual-motorcycle">
    <div class="slot-container">
      <div class="motorcycle-left">
        <img v-if="props.leftMotorcycleUrl" :src="props.leftMotorcycleUrl" alt="Left Motorcycle">
        <UIcon v-else name="i-lucide-motorbike" class="size-20" />
        <p>{{ props.leftName }}</p>
      </div>
      <UButton icon="i-lucide-arrow-left-right" class="w-fit rounded-4xl m-1" @click="emit('compare')">
        Sélectionner
        </UButton
      >
      <div class="motorcycle-right">
        <img v-if="props.rightMotorcycleUrl" :src="props.rightMotorcycleUrl" alt="Right Motorcycle">
        <UIcon v-else name="i-lucide-motorbike" class="size-20" />
        <p>{{ props.rightName }}</p>
      </div>
    </div>
    <div class="footer">
      <h6>Comparer les motos</h6>
      <UIcon name="i-lucide-circle-x" class="size-5" @click="emit('delete')"/>
    </div>
  </div>
</template>

<style scoped>
.dual-motorcycle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 400px;
}

.slot-container {
  display: flex;
  align-items: end;
  justify-content: space-between;
  width: 100%;
  gap: 1rem;
}

.motorcycle-left,
.motorcycle-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: fit-content;
  width: 100%;
  height: 150px;
  border: 1px dashed var(--text-color);
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--background);
  z-index: -5;
}

.motorcycle-left p,
.motorcycle-right p {
  font-size: small;
}

.motorcycle-left {
    rotate: -10deg;
}

.motorcycle-right {
    rotate: 10deg;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 94%;
  gap: 0.5rem;
  padding: 20px 0.5rem;
  border-radius: 0 0 8px 8px;
  color: var(--background);
  background-color: var(--text-color);
}
</style>
