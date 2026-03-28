<script setup lang="ts">
import { RideType, type ICommune, type IValueCommuneSelect } from '~/types/ride'
import DisplayMapRide from './DisplayMapRide.vue'

const isLoading = ref<boolean>(false)

const title = ref<string>('')
const description = ref<string>('')
const startTown = ref<IValueCommuneSelect | undefined>(undefined)
const endTown = ref<IValueCommuneSelect | undefined>(undefined)
const rideType = ref<string>('')

// Termes de recherche séparés pour chaque select
const startTownSearch = ref<string>('')
const endTownSearch = ref<string>('')

const map = ref<any>(null) // Instance de la carte Leaflet
const L_instance = ref<any>(null) // Layer instances courant de leaflet

const rideTypeOptions = Object.values(RideType).map((type: string) => ({
  label: type,
  value: type
}))

const listCommunes = ref<IValueCommuneSelect[]>([])

const searchCommunes = async (query: string) => {
  // Permet de re fetch seulement s'il y a 3 charactères
  if (!query || query.length < 3) return

  isLoading.value = true
  try {
    const res = await fetch(
      `https://geo.api.gouv.fr/communes?nom=${query}&limit=20&fields=nom,code,codesPostaux`
    )
    const data = await res.json()

    // Tri alphabétique sur le nom
    const sortedData = data.sort((a: any, b: any) => a.nom.localeCompare(b.nom))

    listCommunes.value = sortedData.map((c: ICommune) => ({
      label: `${c.nom} ${c.codesPostaux ? '(' + c.codesPostaux[0] + ')' : ''}`,
      value: c.nom
    }))
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

// Watch les termes de recherche, pas les valeurs sélectionnées
watch(startTownSearch, (val) => searchCommunes(val))
watch(endTownSearch, (val) => searchCommunes(val))

// Fonction pour charger les 50 premières communes
const loadInitialCommunes = async () => {
  isLoading.value = true
  try {
    const res = await fetch(
      `https://geo.api.gouv.fr/communes?limit=50&fields=nom,codesPostaux`
    )
    const data = await res.json()
    const sortedData = data.sort((a: any, b: any) => a.nom.localeCompare(b.nom))

    listCommunes.value = sortedData.map((c: ICommune) => ({
      label: `${c.nom} ${c.codesPostaux ? '(' + c.codesPostaux[0] + ')' : ''}`,
      value: c.nom
    }))
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const handleMenuClose = (isOpen: boolean) => {
  if (
    !isOpen &&
    startTownSearch.value === '' &&
    endTownSearch.value === '' &&
    startTown.value?.label === '' &&
    endTown.value?.label === ''
  ) {
    loadInitialCommunes()
    startTownSearch.value = ''
    endTownSearch.value = ''
  }
}

onMounted(async () => {
  loadInitialCommunes()

  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')
  L_instance.value = L

  map.value = L.map('map', { zoomControl: false }).setView([48.21, -3], 8)
  L.control.zoom({ position: 'bottomleft' }).addTo(map.value)
  L.control.scale({ imperial: false }).addTo(map.value)

  L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    attribution: '&copy; Google',
    maxZoom: 20
  }).addTo(map.value)
})
</script>
<template>
  <div id="container-form" class="container-form">
    <h3>Ajouter votre balade</h3>

    <div class="form-wrapper">
      <UFormField label="Titre de la balade" name="title" required>
        <UInput
          v-model="title"
          class="w-full"
          placeholder="Entrez un titre..."
          size="xl"
        />
      </UFormField>

      <UFormField label="Description de la balade" name="description">
        <UTextarea
          v-model="description"
          class="w-full"
          placeholder="Entrez une description..."
          size="xl"
          :rows="5"
        />
      </UFormField>

      <div class="row-towns">
        <UFormField label="Ville de départ" name="startTown" required>
          <USelectMenu
            v-model="startTown"
            :items="listCommunes"
            class="w-full"
            placeholder="Chercher une ville..."
            :search-input="{
              placeholder: 'Rechercher...',
              modelValue: startTown, // Fonctionne même si erreur
              'onUpdate:modelValue': (val: string) => (endTownSearch = val) // Fonctionne même si erreur
            }"
            size="xl"
            option-attribute="label"
            value-attribute="value"
            :loading="isLoading"
            @update:open="handleMenuClose"
          />
        </UFormField>

        <UFormField label="Ville d'arrivée" name="endTown" required>
          <USelectMenu
            v-model="endTown"
            :items="listCommunes"
            class="w-full"
            placeholder="Chercher une ville..."
            :search-input="{
              placeholder: 'Rechercher...',
              modelValue: endTownSearch, // Fonctionne même si erreur
              'onUpdate:modelValue': (val: string) => (endTownSearch = val) // Fonctionne même si erreur
            }"
            size="xl"
            option-attribute="label"
            value-attribute="value"
            :loading="isLoading"
            @update:open="handleMenuClose"
          />
        </UFormField>
      </div>

      <UFormField label="Type de la balade" name="rideType" required>
        <USelect
          v-model="rideType"
          :items="rideTypeOptions"
          class="w-full"
          placeholder="Sélectionnez le type..."
          size="xl"
        />
      </UFormField>
      <DisplayMapRide display-enlarge-button display-editor-container />
    </div>
  </div>
</template>

<style scoped>
/* Carte et ce qu'il y a au dessus 
.map-container {
  position: relative !important;
  width: 100%;
  height: 100%;
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
}

.map-container.is-fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 99999 !important;
  margin: 0 !important;
  border-radius: 0 !important;
}

.is-fullscreen .button-enlarge {
  bottom: 20px;
  right: 20px;
}

.button-enlarge {
  position: absolute;
  bottom: 25px;
  right: 15px;
  z-index: 1010;
  pointer-events: auto;
}

#map {
  width: 100%;
  height: 100%;
  min-height: 24rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}*/

.container-form {
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.form-wrapper {
  width: 100%;
  max-width: 70rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.row-towns {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .row-towns {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
