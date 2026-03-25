<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { IBrand } from '~/types/brand'
import { MotorcycleCategory, type IMotorcycle } from '~/types/motorcycles'

const apiBase = useRuntimeConfig().public.apiBase

const props = defineProps({
  mode: { type: String, default: 'create' },
  onClosePanel: { type: Function, required: true },
  onRefresh: { type: Function, required: true }
})

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

onMounted(fetchData)

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const selectedBrand = brandList.value.find(
      (b) => b.name === event.data.brand
    )
    console.log(selectedBrand)
    if (!selectedBrand?._id) {
      toast.add({
        title: 'Error',
        description: 'Brand not found',
        color: 'error'
      })
      return
    }
    const { brand, ...rest } = event.data
    const motorcycleData: IMotorcycle = {
      id: crypto.randomUUID(),
      brand: selectedBrand._id,
      ...rest,
      createdAt: new Date().toISOString()
    }
    console.log(motorcycleData)

    await $fetch(`${apiBase}motorcycles`, {
      method: 'POST',
      body: motorcycleData
    })

    toast.add({
      title: 'Success',
      description: 'Motorcycle saved',
      color: 'success'
    })

    props.onClosePanel()
    props.onRefresh()
  } catch (err) {
    toast.add({
      title: 'Error',
      description: 'Failed to save motorcycle',
      color: 'error'
    })
  }
}
</script>
<template>
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

    <UFormField label="Lien son" name="soundLink">
      <UInput v-model="state.soundLink" />
    </UFormField>

    <UFormField label="Image URL" name="imageUrl">
      <UInput v-model="state.imageUrl" />
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
</style>
