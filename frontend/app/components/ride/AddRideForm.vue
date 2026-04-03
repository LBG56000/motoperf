<script setup lang="ts">
import {
  RideType,
  type ICommune,
  type IValueCommuneSelect,
  type IValueForm
} from '~/types/ride'
import DisplayMapRide from './DisplayMapRide.vue'
import * as turf from '@turf/turf'
import { useAuth } from '~/composable/useAuth.js'
import type { un } from 'vue-router/dist/router-CWoNjPRp.mjs'

const isLoading = ref<boolean>(false)
const { user } = useAuth()

// Termes de recherche séparés pour chaque select
const startTownSearch = ref<string>('')
const endTownSearch = ref<string>('')

const rideTypeOptions = Object.values(RideType).map((type: string) => ({
  label: type,
  value: type
}))

const listCommunes = ref<IValueCommuneSelect[]>([])

const rideDistance = computed(() => {
  // On vérifie que la géométrie existe et possède des features
  if (
    !stateForm.geom ||
    !stateForm.geom.features ||
    stateForm.geom.features.length === 0
  ) {
    return 0
  }

  try {
    // Calcul de la longueur en kilomètres
    const distanceKm = turf.length(stateForm.geom as any, {
      units: 'kilometers'
    })
    return parseFloat(distanceKm.toFixed(2))
  } catch (e) {
    console.error('Erreur de calcul Turf:', e)
    return 0
  }
})

const searchCommunes = async (query: string) => {
  // Permet de re fetch seulement s'il y a 1 charactères
  if (!query || query.length <= 1) return

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
watch(startTownSearch, (val: string) => searchCommunes(val))
watch(endTownSearch, (val: string) => searchCommunes(val))

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
    stateForm.startTown?.label === '' &&
    stateForm.endTown?.label === ''
  ) {
    loadInitialCommunes()
    startTownSearch.value = ''
    endTownSearch.value = ''
  }
}

onMounted(async () => {
  loadInitialCommunes()

  setTimeout(() => {
    scrollToMap('map')
  }, 350)
})

const stateForm = reactive<IValueForm>({
  title: '',
  duration: 0,
  description: '',
  startTown: undefined,
  endTown: undefined,
  rideType: '',
  picture: undefined,
  geom: null
})

async function uploadFile(
  file: File,
  type: 'image' | 'sound',
  directory: string
): Promise<string> {
  const clearString = (s: string | undefined) => {
    return s ? s.replace(' ', '_').toLowerCase() : ''
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  formData.append('directory', directory)
  formData.append(
    'name',
    `${clearString(stateForm.startTown?.value)}_${clearString(stateForm.endTown?.value)}-${new Date().getTime()}`
  )

  const res = await $fetch<{ url: string }>('/api/uploadFile', {
    method: 'POST',
    body: formData
  })
  return res.url
}

// Fonction pour trouver une commune à partir de coordonnées [long, lat]
const getCommuneFromCoords = async (
  coords: number[] | undefined
): Promise<IValueCommuneSelect | undefined> => {
  try {
    let data
    if (coords) {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/reverse/?lon=${coords[0]}&lat=${coords[1]}`
      )
      data = await res.json()
    }

    // On vérifie qu'on a au moins un résultat
    if (data.features && data.features.length > 0) {
      // On prend le premier résultat (le plus proche)
      const properties = data.features[0].properties

      return {
        label: `${properties.city} (${properties.postcode})`,
        value: properties.city
      }
    }
  } catch (e) {
    console.error('Erreur lors du reverse geocoding:', e)
  }
  return undefined
}

async function onSubmit() {
  const runtimeConfig = useRuntimeConfig()
  try {
    let directoryImageRide
    if (stateForm.picture) {
      directoryImageRide = await uploadFile(stateForm.picture, 'image', 'rides')
    }

    const payload = {
      ...stateForm,
      imageLink: directoryImageRide,
      distance: parseFloat(rideDistance.value.toString()),
      userId: user.value?._id
    }

    await $fetch(`${runtimeConfig.public.apiBase}rides`, {
      method: 'POST',
      body: payload
    })

    await navigateTo({
      path: '/ride',
      query: { created: 'true' }
    })

    const toast = useToast()
    toast.add({
      title: 'Succès',
      description: 'Votre balade a été ajouté.',
      color: 'success'
    })
  } catch (error) {
    console.error("Erreur lors de l'envoi:", error)
  }
}

async function validate(data: Partial<typeof stateForm>) {
  if (!data.title?.length)
    return [{ name: 'title', message: 'Le titre de la balade est requis' }]
  if (!data.startTown?.label.length)
    return [{ name: 'startTown', message: 'La ville de départ est requise' }]
  if (!data.endTown?.label.length)
    return [{ name: 'endTown', message: "La ville d'arrivée est requise" }]
  if (!data.rideType?.length)
    return [{ name: 'rideType', message: 'Le type de balade est requis' }]
  if (!data.picture)
    return [{ name: 'picture', message: "L'image de la balade est requise" }]
  if (!data.geom)
    return [{ name: 'geom', message: 'Le tracé de la balade est requis' }]
  return []
}

const getEstimatedDuration = async (geom: any): Promise<number | undefined> => {
  try {
    const feature = geom.features[0]
    const coords = feature.geometry.coordinates

    // OSRM demande les coordonnées sous forme long,lat;long,lat...
    // On peut échantillonner les points si le tracé est trop long (limite d'URL)
    const polyline = coords.map((c: any) => `${c[0]},${c[1]}`).join(';')

    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${polyline}?overview=false`
    )
    const data = await res.json()

    if (data.routes && data.routes.length > 0) {
      // La durée est en secondes, on la convertit en heures pour ton champ duration
      const durationSeconds = data.routes[0].duration
      const durationHours = durationSeconds / 3600
      return parseFloat(durationHours.toFixed(2))
    }
  } catch (e) {
    console.error('Erreur calcul durée OSRM:', e)
  }
  return undefined
}

watch(
  () => stateForm.geom,
  async (newGeom) => {
    if (!newGeom || !newGeom.features || newGeom.features.length === 0) return

    const feature = newGeom.features[0]
    if (feature?.geometry.type !== 'LineString') return

    const coords = feature.geometry.coordinates
    if (coords.length < 2) return

    isLoading.value = true

    // On ajoute le calcul de durée aux requêtes parallèles
    const [startCity, endCity, estimatedTime] = await Promise.all([
      getCommuneFromCoords(coords[0]),
      getCommuneFromCoords(coords[coords.length - 1]),
      getEstimatedDuration(newGeom)
    ])

    stateForm.startTown = startCity
    stateForm.endTown = endCity

    // On met à jour la durée automatiquement
    if (estimatedTime) {
      stateForm.duration = estimatedTime
    }

    isLoading.value = false
  },
  { deep: true }
)
</script>
<template>
  <div id="container-form" class="container-form">
    <UForm
      class="form-wrapper"
      :state="stateForm"
      :validate="validate"
      @submit="onSubmit"
    >
      <UContainer class="flex flex-col h-full">
        <UFormField
          label="Tracé de la balade"
          name="geom"
          required
          class="flex flex-col grow"
          :ui="{ container: 'flex-grow' }"
        >
          <DisplayMapRide
            v-model:geom="stateForm.geom"
            display-enlarge-button
            display-editor-container
            class="grow min-h-100 lg:min-h-0"
          />

          <div class="container-info-under-map">
            <div v-if="rideDistance > 0" class="ride-line-info">
              <UIcon name="i-lucide-map-pinned" class="w-4 h-4" />
              <span
                >Distance estimée :
                <strong style="color: var(--ui-primary)"
                  >{{ rideDistance }} km</strong
                ></span
              >
            </div>
            <div class="ride-line-info">
              <UIcon name="i-lucide-timer" class="w-4 h-4" />
              <span>Durée estimée :</span>
              <UInputNumber
                v-model="stateForm.duration"
                class="w-40"
                placeholder="Ex: 2"
                size="xl"
              />
              h
            </div>
          </div>
        </UFormField>
      </UContainer>

      <UContainer class="flex flex-col space-y-6">
        <header class="form-header">
          <UButton
            to="/ride"
            icon="i-lucide-chevron-left"
            variant="ghost"
            color="neutral"
            label="Retour"
          />
          <h3>Nouvelle balade</h3>
          <p class="text-gray-500 text-sm mt-1">
            Configurez les détails de votre itinéraire
          </p>
        </header>

        <UFormField label="Titre de la balade" name="title" required>
          <UInput
            v-model="stateForm.title"
            class="w-full"
            placeholder="Entrez un titre..."
            size="xl"
          />
        </UFormField>

        <UFormField label="Description de la balade" name="description">
          <UTextarea
            v-model="stateForm.description"
            class="w-full"
            placeholder="Entrez une description..."
            size="xl"
            :rows="4"
          />
        </UFormField>

        <div class="row-container">
          <UFormField label="Ville de départ" name="startTown" required>
            <USelectMenu
              v-model="stateForm.startTown"
              class="w-full"
              :items="listCommunes"
              placeholder="Chercher une ville..."
              :search-input="{
                placeholder: 'Rechercher...',
                modelValue: startTownSearch,
                'onUpdate:modelValue': (val: string) => (startTownSearch = val)
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
              v-model="stateForm.endTown"
              class="w-full"
              :items="listCommunes"
              placeholder="Chercher une ville..."
              :search-input="{
                placeholder: 'Rechercher...',
                modelValue: endTownSearch,
                'onUpdate:modelValue': (val: string) => (endTownSearch = val)
              }"
              size="xl"
              option-attribute="label"
              value-attribute="value"
              :loading="isLoading"
              @update:open="handleMenuClose"
            />
          </UFormField>
        </div>

        <div class="row-container">
          <UFormField
            label="Type de la balade"
            name="rideType"
            required
            class="full-width"
          >
            <USelect
              v-model="stateForm.rideType"
              class="w-full"
              :items="rideTypeOptions"
              placeholder="Sélectionnez le type..."
              size="xl"
            />
          </UFormField>
        </div>

        <UFormField label="Image de la balade" name="picture" required>
          <div class="card-image">
            <UFileUpload v-model="stateForm.picture" class="w-full h-full" />
          </div>
        </UFormField>

        <UButton
          type="submit"
          label="Ajouter la balade"
          color="primary"
          size="xl"
          class="justify-center"
          icon="i-lucide-check"
          loading-auto
        />
      </UContainer>
    </UForm>
  </div>
</template>

<style scoped>
.full-width {
  grid-column: span 2;
}

.container-info-under-map {
  display: flex;
  flex-direction: row;
  gap: 50px;
}

.ride-line-info {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: start;
  align-items: center;
}

.container-form {
  width: 100%;
  padding: 2rem;
}

.form-wrapper {
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
  width: 100%;
  /* Aligne les hauteurs des deux colonnes */
  align-items: stretch;
}

.form-wrapper > * {
  flex: 1;
  width: 50%;
}

:deep(.u-container) {
  max-width: none !important;
  margin: 0 !important;
  width: 100%;
}

.card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.row-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 1024px) {
  .form-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  .form-wrapper > * {
    width: 100%;
  }
}
</style>
