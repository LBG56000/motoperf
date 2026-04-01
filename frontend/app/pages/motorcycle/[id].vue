<script setup lang="ts">
import { onMounted, ref, computed, watch, nextTick } from 'vue'
import type { IMotorcycle } from '~/types/motorcycles'
import CountUp from 'vue-countup-v3'
import type { IMessage } from '~/types/messages'

const route = useRoute()
const id = route.params.id as string
const apiBase = useRuntimeConfig().public.apiBase
const m = ref<IMotorcycle | null>(null)
const commentsMotorcycle = ref<IMessage[]>([])

const statsRef = ref<HTMLElement | null>(null)
const countStarted = ref(false)

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

async function fetchMessages() {
  const post1 = m.value?.post

  if (post1) {
    const data = await $fetch<{ messages: IMessage[] }>(
      `${apiBase}posts/${post1}/responses`,
      {
        params: {
          project: 'content, user, createdAt',
          deep: true,
          limit: 5
        }
      }
    )
    commentsMotorcycle.value = data.messages
  }
}

onMounted(() => {
  fetchData()
  fetchMessages()
})

watch(
  m,
  async () => {
    await nextTick()

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          countStarted.value = true
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (statsRef.value) observer.observe(statsRef.value)
  },
  { once: true }
)
</script>

<template>
  <div v-if="m" class="main-content">
    <h1 class="title">{{ m.name }}</h1>
    <img
      :src="m.imageUrl"
      :alt="`Image de la moto ${m.name}`"
      class="motorcycle-image"
    />

    <div class="detail">
      <p><span>Modèle:</span> {{ m.brand.name }} {{ m.name }}</p>
      <p><span>Année:</span> {{ m.year }}</p>
      <p><span>Moteur:</span> {{ m.engine_size }} m3</p>
    </div>

    <div ref="statsRef" class="stats-section">
      <h3>Caractéristiques</h3>
      <div class="stats-grid">
        <div v-for="stat in statsNumbers" :key="stat.label" class="stat-card">
          <span class="stat-label">{{ stat.label }}</span>
          <CountUp
            :key="countStarted ? stat.label : ''"
            class="stat-value"
            :end-val="Number(stat.value)"
            :duration="2"
            :options="{ useEasing: true, separator: ' ' }"
            :autoplay="true"
          />
        </div>
      </div>
    </div>

    <div class="sound-section">
      <AudioPlayer v-if="m.soundLink" :src="m.soundLink" />
      <p v-else>Pas d'audio</p>
    </div>

    <div>
      <h4>Commentaires sur la {{ m.name }}</h4>
      <Comment
        v-if="commentsMotorcycle.length > 0"
        :responses="commentsMotorcycle"
      />
      <p v-else>Postez le premier commentaire !</p>
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

.motorcycle-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}
</style>
