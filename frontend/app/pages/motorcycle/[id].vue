<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { IMotorcycle } from '~/types/motorcycles'

const route = useRoute()
const id = route.params.id as string
const apiBase = useRuntimeConfig().public.apiBase
const m = ref<IMotorcycle | null>(null)

const fieldCategories = {
  numbers: [
    'year',
    'engine_size',
    'horsePower',
    'torque',
    'weight',
    'consumption',
    'acceleration',
    'speedMax',
    'price'
  ],
  sound: 'soundLink',
  image: 'imageUrl'
}

const fieldLabels: Record<string, string> = {
  year: 'Année',
  engine_size: 'Cylindrée (cc)',
  horsePower: 'Puissance (ch)',
  torque: 'Couple (Nm)',
  weight: 'Poids (kg)',
  consumption: 'Consommation (L/100km)',
  acceleration: 'Accélération (0-100)',
  speedMax: 'Vitesse max (km/h)',
  price: 'Prix (€)'
}

const statsNumbers = computed(() => {
  if (!m.value) return []
  return fieldCategories.numbers
    .filter((key) => m.value![key as keyof IMotorcycle] !== undefined)
    .map((key) => ({
      label: fieldLabels[key] ?? key,
      value: m.value![key as keyof IMotorcycle]
    }))
})

async function fetchData() {
  const data = await $fetch<{ motorcycles: IMotorcycle[] }>(
    `${apiBase}motorcycles`,
    {
      params: {
        filter: JSON.stringify({ _id: id }),
        project: 'all'
      }
    }
  )
  m.value = data.motorcycles?.[0] ?? null
}

onMounted(async () => {
  await fetchData()
})
</script>

<template>
  <div v-if="m" class="main-content">
    <h1 class="title">{{ m.name }}</h1>
    <img :src="m.imageUrl" :alt="`Image de la moto ${m.name}`" />

    <div class="detail">
      <p><span>Modèle:</span> {{ m.brand.name }} {{ m.name }}</p>
      <p><span>Année:</span> {{ m.year }}</p>
      <p><span>Moteur:</span> {{ m.engineSize }} cc</p>
    </div>

    <div class="stats-section">
      <h3>Caractéristiques</h3>
      <div class="stats-grid">
        <div v-for="stat in statsNumbers" :key="stat.label" class="stat-card">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-value">{{ stat.value }}</span>
        </div>
      </div>

      <div v-if="m.soundLink" class="sound-section">
        <h4>Son du moteur</h4>
        <audio :src="m.soundLink" controls />
      </div>
    </div>
  </div>
</template>

<style scoped>
.title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2em;
}
.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2em;
  padding-bottom: 4em;
}
.detail {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  border: black solid 1px;
  border-radius: 5px;
  padding: 1em;
  width: 50%;
}
span {
  font-weight: bold;
}
.stats-section {
  width: 60%;
}
.stats-section h3 {
  text-align: center;
  margin-bottom: 1em;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1em;
}
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1em;
  border: 1px solid #c0c0c0;
  border-radius: 8px;
  gap: 0.5em;
}
.stat-label {
  font-size: 0.85em;
  color: #666;
  text-align: center;
}
.stat-value {
  font-size: 1.4em;
  font-weight: bold;
}
.sound-section {
  margin-top: 2em;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
}
</style>
