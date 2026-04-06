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
import { Time, CalendarDate } from '@internationalized/date'
import InputDate from '~/components/global/InputDate.vue'
import InputTime from '~/components/global/InputTime.vue'

const isSelectLoading = ref<boolean>(false) // État de chargement des listes déroulantes
const isMapLoading = ref<boolean>(false) // État de chargement de la carte
const isAutoUpdating = ref(false) // Verrou pour éviter les boucles lors des mises à jour automatiques
const { user } = useAuth() // User actuel

const route = useRoute() // Récupérer les paramètres get passé (notamment pour le scroll automatique)
const router = useRouter() // Changer l'URL pour enlever le paramètre GET quand le scroll est fini

// Termes de recherche séparés pour chaque select
const startTownSearch = ref<string>('')
const endTownSearch = ref<string>('')

const durationHours = ref<number>(0)
const durationMinutes = ref<number>(0)

const mapKey = ref(0) // Permet de recharger la carte quand un tracé GPS est supprimé

const isGpsRoute = ref<boolean>(false)
const isGeomCreated = computed(() => {
  if (stateForm.geom) {
    return true
  }
  return false
}) // Vérifie si une geom est créé

const now = new Date()

const rideTypeOptions = Object.values(RideType).map((type: string) => ({
  label: type,
  value: type
})) // Chercher dans l'enum les types

const listCommunes = ref<IValueCommuneSelect[]>([])

const stateForm = reactive<IValueForm>({
  title: '',
  duration: 0,
  distance: 0,
  description: '',
  startTown: undefined,
  endTown: undefined,
  rideType: '',
  picture: undefined,
  is_event: false,
  date_event: new CalendarDate(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  ),
  hour_event: new Time(now.getHours(), now.getMinutes()),
  geom: null
})

const resetCommunesList = () => {
  startTownSearch.value = ''
  endTownSearch.value = ''
  loadInitialCommunes()
}

// Propriété calculer pour le calcul de la distance automatique
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

// Permet la recherche dynamique dans les select des villes
const searchCommunes = async (query: string) => {
  // Permet de re fetch seulement s'il y a 1 charactères
  if (!query || query.length <= 1) return

  isSelectLoading.value = true
  try {
    const res = await fetch(
      `https://geo.api.gouv.fr/communes?nom=${query}&limit=20&fields=nom,code,codesPostaux`
    )
    const data = await res.json()

    // Tri alphabétique sur le nom
    const sortedData = data.sort((a: any, b: any) => a.nom.localeCompare(b.nom))

    // Ajout dans le select
    listCommunes.value = sortedData.map((c: ICommune) => ({
      label: `${c.nom} ${c.codesPostaux ? '(' + c.codesPostaux[0] + ')' : ''}`,
      value: c.nom
    }))
  } catch (e) {
    console.error(e)
  } finally {
    isSelectLoading.value = false
  }
}

// Fonction pour charger les 50 premières communes
const loadInitialCommunes = async () => {
  isSelectLoading.value = true
  try {
    const res = await fetch(
      `https://geo.api.gouv.fr/communes?limit=50&fields=nom,codesPostaux`
    )
    const data = await res.json()
    const sortedData = data.sort((a: any, b: any) => a.nom.localeCompare(b.nom))

    // Ajouter les communes trouvées dans le select
    listCommunes.value = sortedData.map((c: ICommune) => ({
      label: `${c.nom} ${c.codesPostaux ? '(' + c.codesPostaux[0] + ')' : ''}`,
      value: c.nom
    }))
  } catch (e) {
    console.error(e)
  } finally {
    isSelectLoading.value = false
  }
}

// Quand les select sont ouverts, vidés tout et recharger les communes de base (les 50)
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

// Fonction qui génère la geom via OSRM à partir des deux villes
const calculateRouteFromCities = async () => {
  if (
    !stateForm.startTown?.value ||
    !stateForm.endTown?.value ||
    isAutoUpdating.value ||
    stateForm.geom
  )
    return

  isMapLoading.value = true
  isAutoUpdating.value = true

  try {
    const startCoords = await getCoordsFromCity(stateForm.startTown.value)
    const endCoords = await getCoordsFromCity(stateForm.endTown.value)

    if (startCoords && endCoords) {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startCoords.join(',')};${endCoords.join(',')}?overview=full&geometries=geojson`
      )
      const data = await res.json()

      if (data.routes && data.routes.length > 0) {
        const rawGeom = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: data.routes[0].geometry
            }
          ]
        }

        // On simplifie la geom poru éviter que ça lag trop car le tracé est très précis
        stateForm.geom = simplifyGeometry(rawGeom, 0.00005)
        isGpsRoute.value = true

        // On met à jour la durée et la distance ici aussi pour être sûr
        stateForm.duration = parseFloat(
          (data.routes[0].duration / 3600).toFixed(2)
        )

        stateForm.distance = parseFloat(
          (data.routes[0].distance / 1000).toFixed(2)
        )
      }
    }
  } finally {
    isSelectLoading.value = false
    isMapLoading.value = false

    // On attend un peu avant de déverrouiller pour laisser les watchers se terminer
    setTimeout(() => {
      isAutoUpdating.value = false
    }, 500)
  }
}

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

    // Conversion en chaînes de caractères
    if (stateForm.is_event) {
      payload.date_event = stateForm.date_event.toString()
      payload.hour_event = stateForm.hour_event.toString()
    } else {
      // Si ce n'est pas une balade groupée, on nettoie les valeurs
      payload.date_event = undefined
      payload.hour_event = undefined
    }

    await $fetch(`${runtimeConfig.public.apiBase}rides`, {
      method: 'POST',
      body: payload
    })

    await navigateTo({
      path: '/ride',
      query: { scroll: 'true' }
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

// Message personnalisé pour les champs requis
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

onMounted(async () => {
  // Si le paramètre est présent dans l'URL on scroll
  if (route.query.scroll === 'true') {
    setTimeout(() => {
      scrollToMap('map')
      // Nettoyage de l'URL pour éviter de rescroller au prochain refresh
      router.replace({ query: {} })
    }, 400)
  }

  loadInitialCommunes()

  setTimeout(() => {
    scrollToMap('map')
  }, 350)
})

watch(
  () => stateForm.geom,
  async (newGeom) => {
    // Si la geom change (se supprime) on lave tous les champs calculer en fonction
    if (!newGeom || !newGeom.features || newGeom.features.length === 0) {
      stateForm.startTown = undefined
      stateForm.endTown = undefined
      stateForm.duration = 0
      isGpsRoute.value = false
      return
    }

    if (isAutoUpdating.value) return
    if (isGpsRoute.value) return

    const feature = newGeom.features[0]
    if (feature?.geometry.type !== 'LineString') return

    const coords = feature.geometry.coordinates
    if (coords.length < 2) return

    isSelectLoading.value = true

    // On ajoute le calcul de durée aux requêtes parallèles
    const [startCity, endCity, estimatedTime] = await Promise.all([
      getCommuneFromCoords(coords[0]), // Point de départ de la geom
      getCommuneFromCoords(coords[coords.length - 1]), // Point d'arrivé de la geom
      getEstimatedDuration(newGeom)
    ])

    stateForm.startTown = startCity
    stateForm.endTown = endCity

    // On met à jour la durée automatiquement
    if (estimatedTime) {
      stateForm.duration = estimatedTime
    }

    isSelectLoading.value = false
  },
  { deep: true }
)

// On surveille les villes, mais on n'agit que si c'est un changement utilisateur et pas celui automatique après le tracé manuel
watch(
  [() => stateForm.startTown, () => stateForm.endTown],
  ([newStart, newEnd], [oldStart, oldEnd]) => {
    // Si l'un des deux a changé et que les deux sont remplis
    if (newStart?.value && newEnd?.value) {
      // On vérifie si les valeurs sont différentes des précédentes pour éviter les déclenchements inutiles
      if (
        newStart.value !== oldStart?.value ||
        newEnd.value !== oldEnd?.value
      ) {
        calculateRouteFromCities() // Lancement du calcul GPS
      }
    }
  }
)

// Quand la ville de départ est sélectionnée permet de reset les choix
watch(
  () => stateForm.startTown,
  (newVal) => {
    if (newVal) {
      resetCommunesList()
    }
  }
)

// Quand la ville d'arrivée est sélectionnée permet de reset les choix
watch(
  () => stateForm.endTown,
  (newVal) => {
    if (newVal) {
      resetCommunesList()
    }
  }
)

// Prendre les heures et minutes de la duréer en décimal pour le back
watch([durationHours, durationMinutes], ([h, m]) => {
  const decimalValue = h + m / 60
  stateForm.duration = parseFloat(decimalValue.toFixed(2))
})

// Si la durée change via le calcul automatique, on met à jour les champs Heures / Minutes
watch(
  () => stateForm.duration,
  (newVal) => {
    const h = Math.floor(newVal)
    const m = Math.round((newVal - h) * 60)

    // On ne met à jour que si les valeurs sont différentes pour éviter les boucles infinies
    if (h !== durationHours.value) durationHours.value = h
    if (m !== durationMinutes.value) durationMinutes.value = m
  }
)

// Quand le tracé GPS est supprimé, on force le rechargement du composant pour reset leaflet draw qui bug sinon
watch(isGpsRoute, (newVal) => {
  if (!newVal) {
    mapKey.value++
  }
})

// Watch les input de recherche dans les select des villes, pas les valeurs sélectionnées
watch(startTownSearch, (val: string) => searchCommunes(val))
watch(endTownSearch, (val: string) => searchCommunes(val))
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
            :key="mapKey"
            v-model:geom="stateForm.geom"
            v-model:is-map-loading="isMapLoading"
            display-editor-container
            :disable-editing="isGpsRoute"
            :disable-creating="isGeomCreated"
            class="grow min-h-100 lg:min-h-0"
          />

          <div
            v-if="isGpsRoute"
            class="mt-2 text-red-500 flex items-center gap-2 text-sm font-medium"
          >
            <UIcon name="i-lucide-alert-triangle" class="size-5" />
            Pour des raisons de lenteur, la modification est désactivé lors des
            tracés générer par GPS.
          </div>

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
              <div class="flex items-center gap-2">
                <UInputNumber
                  v-model="durationHours"
                  class="w-30"
                  placeholder="H"
                  :min="0"
                  size="xl"
                />
                <span>h</span>
                <UInputNumber
                  v-model="durationMinutes"
                  class="w-30"
                  placeholder="Min"
                  :min="0"
                  :max="59"
                  size="xl"
                />
                <span>min</span>
              </div>
            </div>
          </div>
        </UFormField>
      </UContainer>

      <UContainer class="flex flex-col space-y-6">
        <header class="form-header">
          <UButton
            to="/ride?scroll=true"
            icon="i-lucide-chevron-left"
            variant="ghost"
            color="neutral"
            label="Retour"
          />
          <h3>Nouvelle balade</h3>
          <p class="text-gray-500 text-sm mt-1">
            Tracez à la main avec
            <UIcon name="i-lucide-pen" class="size-4 text-primary" /> ou
            <strong class="text-primary">choisissez deux villes</strong> pour un
            calcul GPS automatique.
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
              :loading="isSelectLoading"
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
              :loading="isSelectLoading"
              @update:open="handleMenuClose"
            />
          </UFormField>
        </div>

        <UFormField
          label="Type de la balade"
          name="rideType"
          required
          class="w-full"
        >
          <USelect
            v-model="stateForm.rideType"
            class="w-full"
            :items="rideTypeOptions"
            placeholder="Sélectionnez le type..."
            size="xl"
          />
        </UFormField>

        <UFormField name="groupRide" required class="w-full">
          <div class="switch-container">
            <USwitch v-model="stateForm.is_event" />
            <p>Créer une balade groupée</p>
          </div>
        </UFormField>

        <div
          v-if="stateForm.is_event"
          class="w-full grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <UFormField label="Date de la balade" required class="w-full">
            <InputDate v-model="stateForm.date_event" />
          </UFormField>

          <UFormField label="Heure de la balade" required class="w-full">
            <InputTime v-model="stateForm.hour_event" />
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
/* --- CONTENEURS PRINCIPAUX --- */
.container-form {
  width: 100%;
  padding: 2rem;
}

.form-wrapper {
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
  width: 100%;
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

/* --- ÉLÉMENTS DE FORMULAIRE --- */
.row-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.switch-container {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  gap: 10px;
}

.switch-container p {
  font-size: medium;
}

.card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

/* --- INFORMATIONS SOUS CARTE --- */
.container-info-under-map {
  display: flex;
  flex-direction: row;
  gap: 50px;
  margin-top: 1rem;
}

.ride-line-info {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: start;
  align-items: center;
}

/* --- RESPONSIVE (TABLETTES ET MOBILES) --- */
@media (max-width: 1024px) {
  .form-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .form-wrapper > * {
    width: 100%;
  }

  .container-info-under-map {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
