<script setup lang="ts">
import type { IMotorcycle } from '@/types/motorcycle.ts'
import MotocyclesForm from '~/components/form/MotocyclesForm.vue'

definePageMeta({
  layout: 'frontend'
})

const apiBack = useRuntimeConfig().public.apiback
const motocycle1 = ref<IMotorcycle>()
const motocycle2 = ref<IMotorcycle>()
const motorcycle1Id = ref<string>()
const motorcycle2Id = ref<string>()

async function fetchMotocycles() {
  console.log('Id de la moto 1:', motorcycle1Id.value);
  console.log('Id de la moto 2:', motorcycle2Id.value);
  const data = await $fetch<{ motorcycles: IMotorcycle[] }>(
    `${apiBack}motorcycles`,
    {
      params: {
        project: 'all',
        filter: JSON.stringify({ id: { $in: [motorcycle1Id.value, motorcycle2Id.value] } })
      }
    }
  )
  motocycle1.value = data.motorcycles.find((m) => m.id === motorcycle1Id.value)
  motocycle2.value = data.motorcycles.find((m) => m.id === motorcycle2Id.value)

  console.log('motocycle1.value:', motocycle1.value)
  console.log('motocycle2.value:', motocycle2.value)
}
</script>

<template>
  <div class="container-form">
    <MotocyclesForm v-model="motorcycle1Id" form-title="Moto 1" />
    <MotocyclesForm v-model="motorcycle2Id" form-title="Moto 2" />
    <UButton @click="fetchMotocycles">Comparo</UButton>
  </div>
</template>

<style scoped>
.container-form {
  display: flex;
  gap: 2rem;
  margin: 50px;
  justify-content: center;
}
</style>
