<script setup lang="ts">
import { reactive, computed, onMounted, inject, watch } from 'vue'
import type { IFilterObject } from '~/types/ride.js'

const emit = defineEmits(['apply'])

interface IProps {
  maxDistanceSlider: number
  maxDurationSlider: number
  listRideTypes: string[]
  listStartTown: string[]
  listEndTown: string[]
}

const props = defineProps<IProps>()

// Calcul des maximums arrondis
const maxRoundedDuration = computed(
  () => Math.round(props.maxDurationSlider || 0) + 1
)
const maxRoundedDistance = computed(
  () => Math.round(props.maxDistanceSlider || 0) + 1
)

const filters = reactive<IFilterObject>({
  title: '',
  type: [],
  startTown: [],
  endTown: [],
  distance: [0, 9999],
  duration: [0, 99]
})

const STORAGE_KEY_FILTER = inject<string>('STORAGE_KEY_FILTER')

// Initialisation des valeurs par défaut ou depuis le Storage
onMounted(() => {
  if (!STORAGE_KEY_FILTER) return
  let savedFilters: IFilterObject | null = null

  try {
    const item = STORAGE_KEY_FILTER
      ? localStorage.getItem(STORAGE_KEY_FILTER)
      : null
    savedFilters = item ? JSON.parse(item) : null
  } catch (e) {
    console.error('Erreur lors de la récupération du localStorage', e)
  }

  if (savedFilters) {
    // On fusionne les filtres sauvegardés
    Object.assign(filters, savedFilters)
  } else {
    // Sinon on met les valeurs max par défaut
    filters.distance = [0, maxRoundedDistance.value]
    filters.duration = [0, maxRoundedDuration.value]
  }
})

// Watcher pour ajuster les sliders si les props de la map changent
watch(
  maxRoundedDistance,
  (newMax) => {
    if (
      filters.distance[1] &&
      (filters.distance[1] === 0 || filters.distance[1] > newMax)
    ) {
      filters.distance = [0, newMax]
    }
  },
  { immediate: true }
)

const handleApply = () => {
  emit('apply', { ...filters })
}

const resetFilter = () => {
  filters.title = ''
  filters.type = []
  filters.startTown = []
  filters.endTown = []
  filters.distance = [0, maxRoundedDistance.value]
  filters.duration = [0, maxRoundedDuration.value]

  if (STORAGE_KEY_FILTER) {
    localStorage.setItem(STORAGE_KEY_FILTER, JSON.stringify(filters))
  }
}
</script>

<template>
  <div class="filters-container">
    <h3>Filtres</h3>
    <div class="container-fields">
      <UFormField label="Titre de la balade">
        <UInput
          v-model="filters.title"
          class="w-80"
          placeholder="Entrez le titre de la balade..."
        />
      </UFormField>

      <UFormField label="Type de la balade">
        <USelectMenu
          v-model="filters.type"
          multiple
          :items="props.listRideTypes"
          class="w-80"
          placeholder="Sélectionnez le type..."
          :search-input="{ placeholder: 'Rechercher...' }"
        />
      </UFormField>

      <UFormField label="Ville de départ">
        <USelectMenu
          v-model="filters.startTown"
          multiple
          :items="props.listStartTown"
          class="w-80"
          placeholder="Sélectionnez la ville de départ..."
          :search-input="{ placeholder: 'Rechercher...' }"
        />
      </UFormField>

      <UFormField label="Ville d'arrivée">
        <USelectMenu
          v-model="filters.endTown"
          multiple
          :items="props.listEndTown"
          class="w-80"
          placeholder="Sélectionnez la ville d'arrivée..."
          :search-input="{ placeholder: 'Rechercher...' }"
        />
      </UFormField>

      <!-- <UFormField label="Date de la balade">
        <UInputDate trailing-icon="i-lucide-calendar" class="w-80" />
      </UFormField>

      <UFormField label="Date de la balade">
        <UInputTime
          :hour-cycle="24"
          trailing-icon="i-lucide-clock"
          class="w-80"
        />
      </UFormField> -->

      <UFormField label="Distance (km)">
        <div class="value-slider-container">
          <UInputNumber
            v-model="filters.distance[0]"
            :min="0"
            :max="maxRoundedDistance"
            size="xs"
            class="w-40"
          />
          <UInputNumber
            v-model="filters.distance[1]"
            :min="0"
            :max="maxRoundedDistance"
            size="xs"
            class="w-40"
          />
        </div>
        <USlider
          v-model="filters.distance"
          :min="0"
          :max="maxRoundedDistance"
          class="w-80"
        />
      </UFormField>

      <UFormField label="Durée (h)">
        <div class="value-slider-container">
          <UInputNumber
            v-model="filters.duration[0]"
            :min="0"
            :max="maxRoundedDuration"
            size="xs"
            class="w-40"
          />
          <UInputNumber
            v-model="filters.duration[1]"
            :min="0"
            :max="maxRoundedDuration"
            size="xs"
            class="w-40"
          />
        </div>
        <USlider
          v-model="filters.duration"
          :min="0"
          :max="maxRoundedDuration"
          class="w-80"
        />
      </UFormField>

      <div class="container-bottom-buttons">
        <UButton
          color="neutral"
          variant="subtle"
          class="w-80 hover:bg-red-400 hover:text-white transition-colors"
          style="cursor: pointer"
          block
          @click="resetFilter"
        >
          Réinitialiser
        </UButton>
        <UButton
          color="primary"
          variant="solid"
          class="w-80"
          style="cursor: pointer"
          block
          @click="handleApply"
        >
          Appliquer les filtres
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
h3 {
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
}

.container-bottom-buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
}

.value-slider-container {
  display: flex;
  justify-content: start;
  margin-bottom: 0.5rem;
  gap: 2px;
}

:deep(label) {
  color: var(--label-text) !important;
}

:deep(input::placeholder) {
  opacity: 1;
}

.container-fields {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.filters-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: var(--background);
  width: 20dvw;
  min-width: 400px;
  position: absolute;
  top: 60px;
  left: 15px;
  z-index: 999;
  border-radius: 7px;
  border: 1px solid var(--border-gray);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  overflow-y: auto;
}
</style>
