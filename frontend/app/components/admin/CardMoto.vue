<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { IBrand } from '~/types/brand'
import { MotorcycleCategory, type IMotorcycle } from '~/types/motorcycles'

const apiBase = useRuntimeConfig().public.apiBase

async function uploadFile(
  file: File,
  type: 'image' | 'sound'
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  formData.append('motoName', state.name)
  formData.append('motoYear', String(state.year))

  const res = await $fetch<{ url: string }>('/api/upload', {
    method: 'POST',
    body: formData
  })
  return res.url
}

async function onImageChange(file: File | null | undefined) {
  if (!file) return
  state.imageUrl = await uploadFile(file, 'image')
}

async function onSoundChange(file: File | null | undefined) {
  if (!file) return
  state.soundLink = await uploadFile(file, 'sound')
}
const props = defineProps({
  mode: { type: String, default: 'create' },
  moto: { type: Object as () => IMotorcycle | null, default: null },
  onClosePanel: { type: Function, required: true },
  onRefresh: { type: Function, required: true }
})

async function fetchMotoDetails(id: string) {
  const data = await $fetch<{ motorcycles: IMotorcycle[] }>(
    `${apiBase}motorcycles`,
    {
      params: {
        filter: JSON.stringify({ _id: id }),
        project: 'all'
      }
    }
  )

  const m = data.motorcycles[0]

  const brand = brandList.value.find((b) => b._id === m.brand._id)
  state.brand = brand?.name ?? ''
  state.name = m.name ?? ''
  state.year = m.year ?? 2026
  state.category = m.category ?? ''
  state.engine_size = m.engine_size
  state.horsePower = m.horsePower
  state.torque = m.torque
  state.weight = m.weight
  state.consumption = m.consumption
  state.soundLink = m.soundLink ?? ''
  state.imageUrl = m.imageUrl ?? ''
  state.isAvailableA2 = m.isAvailableA2 ?? false
  state.is_public = m.is_public ?? false
  state.speedMax = m.speedMax
  state.numberOfComparison = m.numberOfComparison
  state.withAllField = m.withAllFiled ?? false
  state.price = m.price
  state.acceleration = {
    time_0_100: m.acceleration?.time_0_100,
    time_100_200: m.acceleration?.time_100_200,
    time_200_300: m.acceleration?.time_200_300
  }
}

const listMotorcycleCategory = Object.values(MotorcycleCategory).filter(
  (item) => {
    return isNaN(Number(item))
  }
)

const schema = v.object({
  brand: v.string('La marque est requise'),
  name: v.pipe(v.string(), v.minLength(3)),
  year: v.number(),
  category: v.enum(MotorcycleCategory),
  engine_size: v.number(),
  horsePower: v.number(),
  torque: v.number(),
  weight: v.number(),
  consumption: v.number(),
  soundLink: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  isAvailableA2: v.boolean(),
  is_public: v.boolean(),
  acceleration: v.object({
    time_0_100: v.optional(v.number()),
    time_100_200: v.optional(v.number()),
    time_200_300: v.optional(v.number())
  }),
  speedMax: v.optional(v.number()),
  numberOfComparison: v.optional(v.number()),
  withAllField: v.optional(v.boolean()),
  price: v.optional(v.number())
})

type Schema = v.InferOutput<typeof schema>

const state = reactive<Schema>({
  brand: '',
  name: '',
  year: 2026,
  category: '',
  engine_size: undefined,
  horsePower: undefined,
  torque: undefined,
  weight: undefined,
  consumption: undefined,
  soundLink: '',
  imageUrl: '',
  isAvailableA2: false,
  is_public: false,
  acceleration: {
    time_0_100: undefined,
    time_100_200: undefined,
    time_200_300: undefined
  },
  speedMax: undefined,
  numberOfComparison: undefined,
  withAllField: false,
  price: undefined
})

const brandList = ref<IBrand[]>([])
const brandItems = ref<string[]>([])

async function fetchData() {
  const data = await $fetch<{ brands: IBrand[] }>(
    `${apiBase}brands?project=name`
  )
  brandList.value = data.brands
  brandItems.value = data.brands.map((b) => b.name)
}

onMounted(async () => {
  await fetchData()

  if (props.mode === 'edit' && props.moto?.id) {
    await fetchMotoDetails(props.moto.id)
  }
})

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const selectedBrand = brandList.value.find(
      (b) => b.name === event.data.brand
    )
    if (!selectedBrand?._id) {
      return
    }

    const { brand, ...rest } = event.data
    const motorcycleData = { brand: selectedBrand._id, ...rest }

    if (props.mode === 'edit' && props.moto?.id) {
      // Put edit
      await $fetch(`${apiBase}motorcycles/${props.moto.id}`, {
        method: 'PUT',
        body: motorcycleData
      })
    } else {
      // Post creation
      await $fetch(`${apiBase}motorcycles`, {
        method: 'POST',
        body: { motorcycleData, createdAt: new Date().toISOString() }
      })
    }

    toast.add({
      title: 'Success',
      description: 'Moto enregistrée',
      color: 'success'
    })
    props.onClosePanel()
    props.onRefresh()
  } catch (err) {
    toast.add({
      title: 'Error',
      description: 'Échec de la sauvegarde',
      color: 'error'
    })
  }
}
</script>
<template>
  <div class="header-cardMoto">
    <h3>{{ mode === 'edit' ? 'Modifier la moto' : "Ajout d'une moto" }}</h3>
    <UIcon
      name="i-lucide-x"
      class="cursor-pointer size-6"
      @click="props.onClosePanel"
    />
  </div>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Marque" name="brand" required>
      <UInputMenu v-model="state.brand" :items="brandItems" />
    </UFormField>

    <UFormField label="Modèle" name="name" required>
      <UInput v-model="state.name" />
    </UFormField>

    <UFormField label="Catégorie" name="category" required>
      <UInputMenu v-model="state.category" :items="listMotorcycleCategory" />
    </UFormField>

    <UFormField label="Prix" name="price">
      <UInputNumber v-model="state.price" />
    </UFormField>

    <UFormField label="Année" name="year" required>
      <UInputNumber v-model="state.year" />
    </UFormField>

    <UFormField label="Cylindrée" name="engine_size" required>
      <UInputNumber v-model="state.engine_size" />
    </UFormField>

    <UFormField label="Chevaux" name="horsePower" required>
      <UInputNumber v-model="state.horsePower" />
    </UFormField>

    <UFormField label="Couple" name="torque" required>
      <UInputNumber v-model="state.torque" />
    </UFormField>

    <UFormField label="Poids" name="weight" required>
      <UInputNumber v-model="state.weight" />
    </UFormField>

    <UFormField label="Consommation" name="consumption" required>
      <UInputNumber v-model="state.consumption" />
    </UFormField>

    <UFormField label="Vitesse max" name="speedMax">
      <UInputNumber v-model="state.speedMax" />
    </UFormField>

    <UFormField label="Son" name="soundLink">
      <UFileUpload
        icon="i-lucide-music"
        label="Glisser le son ici"
        description="MP3, WAV"
        accept="audio/mpeg,audio/wav,audio/ogg"
        @update:model-value="onSoundChange"
      />
      <p v-if="state.soundLink" class="text-sm text-gray-500 mt-1">
        ✓ {{ state.soundLink }}
      </p>
    </UFormField>
    <UFormField label="Image" name="imageUrl">
      <UFileUpload
        icon="i-lucide-image"
        label="Glisser l'image ici"
        description="PNG, JPG, WEBP"
        accept="image/png,image/jpeg,image/webp"
        @update:model-value="onImageChange"
      />
      <img
        v-if="state.imageUrl"
        :src="state.imageUrl"
        class="mt-2 h-24 rounded object-cover"
      />
    </UFormField>

    <h4>Accélération</h4>

    <UFormField label="0 à 100" name="acceleration.time_0_100">
      <UInputNumber v-model="state.acceleration.time_0_100" />
    </UFormField>

    <UFormField label="100 à 200" name="acceleration.time_100_200">
      <UInputNumber v-model="state.acceleration.time_100_200" />
    </UFormField>

    <UFormField label="200 à 300" name="acceleration.time_200_300">
      <UInputNumber v-model="state.acceleration.time_200_300" />
    </UFormField>

    <UFormField label="Nombre de comparaisons" name="numberOfComparison">
      <UInputNumber v-model="state.numberOfComparison" />
    </UFormField>

    <UFormField name="isAvailableA2">
      <USwitch v-model="state.isAvailableA2" label="Compatible A2" />
    </UFormField>

    <UFormField name="is_public">
      <USwitch v-model="state.is_public" label="Public" />
    </UFormField>

    <UFormField name="withAllField">
      <USwitch v-model="state.withAllField" label="Complet" />
    </UFormField>

    <UButton type="submit" color="primary"> Enregistrer </UButton>
  </UForm>
</template>

<style scoped>
.form-div {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.header-cardMoto {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
