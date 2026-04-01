<script setup lang="ts">
import {
  RideType,
  type ICommune,
  type IValueCommuneSelect,
  type IValueForm
} from '~/types/ride'
import DisplayMapRide from './DisplayMapRide.vue'
import * as turf from '@turf/turf'

const isLoading = ref<boolean>(false)

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

async function onSubmit() {
  console.log('stateForm : ', stateForm)
  const runtimeConfig = useRuntimeConfig()
  try {
    let directoryImageRide
    if (stateForm.picture) {
      directoryImageRide = await uploadFile(stateForm.picture, 'image', 'rides')
    }

    const payload = {
      ...stateForm,
      imageLink: directoryImageRide,
      distance: parseFloat(rideDistance.value.toString())
    }

    await $fetch(`${runtimeConfig.public.apiBase}rides`, {
      method: 'POST',
      body: payload
    })

    await navigateTo('/ride')

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
</script>
<template>
  <div id="container-form" class="container-form">
    <h3>Ajouter votre balade</h3>

    <UForm
      class="form-wrapper"
      :state="stateForm"
      :validate="validate"
      @submit="onSubmit"
    >
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
          :rows="5"
        />
      </UFormField>

      <div class="row-towns">
        <UFormField label="Ville de départ" name="startTown" required>
          <USelectMenu
            v-model="stateForm.startTown"
            :items="listCommunes"
            class="w-full"
            placeholder="Chercher une ville..."
            style="cursor: pointer"
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
            :items="listCommunes"
            class="w-full"
            placeholder="Chercher une ville..."
            style="cursor: pointer"
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

      <UFormField label="Durée de la balade (h)" name="duration" required>
        <UInputNumber
          v-model="stateForm.duration"
          class="w-full"
          placeholder="Entrez une durée..."
          size="xl"
        />
      </UFormField>

      <UFormField label="Type de la balade" name="rideType" required>
        <USelect
          v-model="stateForm.rideType"
          :items="rideTypeOptions"
          class="w-full"
          placeholder="Sélectionnez le type..."
          style="cursor: pointer"
          size="xl"
        />
      </UFormField>

      <UFormField label="Image de la balade" name="picture" required>
        <div class="card-image" style="cursor: pointer">
          <UFileUpload
            v-model="stateForm.picture"
            class="w-full h-full"
            :ui="{
              base: 'h-full w-full',
              container: 'h-full w-full flex items-center justify-center'
            }"
          />
        </div>
      </UFormField>

      <UFormField label="Tracé de la balade" name="geom" required>
        <DisplayMapRide
          v-model:geom="stateForm.geom"
          display-enlarge-button
          display-editor-container
        />
      </UFormField>

      <UButton
        type="submit"
        label="Ajouter la balade"
        color="primary"
        size="xl"
        class="self-end"
        icon="i-lucide-check"
        style="cursor: pointer"
        loading-auto
      />
    </UForm>
  </div>
</template>

<style scoped>
.container-form {
  width: 60%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
}

h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.card-image {
  width: 40dvw;
  height: 25dvh;
  background-size: cover;
  background-position: center;
  position: relative;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
