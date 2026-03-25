<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { IBrand } from '~/types/brand'

const apiBack = useRuntimeConfig().public.apiback

const props = defineProps({
  mode: { type: String, default: 'create' },
  onClosePanel: { type: Function, required: true },
  onRefresh: { type: Function, required: true }
})

const schema = v.object({
  brand: v.string('Brand is required'),
  model: v.pipe(v.string(), v.minLength(1, 'Model is required')),
  year: v.number('Year is required'),
  engineSize: v.number('Engine size is required'),
  horsepower: v.optional(v.number()),
  maxSpeed: v.optional(v.number()),
  time_0_100: v.optional(v.number()),
  time_100_200: v.optional(v.number()),
  time_200_300: v.optional(v.number()),
  braking_100_0: v.optional(v.number()),
  braking_vmax_0: v.optional(v.number()),
  isPublished: v.boolean()
})

type Schema = v.InferOutput<typeof schema>

const state = reactive<Schema>({
  brand: '',
  model: '',
  year: 2026,
  engineSize: undefined,
  power: undefined,
  horsepower: undefined,
  maxSpeed: undefined,
  time_0_100: undefined,
  time_100_200: undefined,
  time_200_300: undefined,
  braking_100_0: undefined,
  braking_vmax_0: undefined,
  isPublished: false
})

const brandList = ref<IBrand[]>([])
const brandItems = ref<string[]>([])

async function fetchData() {
  const data = await $fetch<{ brands: IBrand[] }>(
    `${apiBack}brands?project=name`
  )
  if (data?.brands) {
    brandList.value = data.brands
    brandItems.value = data.brands.map((b) => b.name)
  }
}

onMounted(fetchData)

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const selectedBrand = brandList.value.find(
      (b) => b.name === event.data.brand
    )

    if (!selectedBrand?._id) {
      toast.add({
        title: 'Error',
        description: 'Brand not found',
        color: 'error'
      })
      return
    }

    const motorcycleData = {
      id: crypto.randomUUID(),
      brand: selectedBrand._id,
      model: event.data.model,
      year: event.data.year,
      engine_size: event.data.engineSize,
      horsePower: event.data.horsepower || event.data.power,
      speedMax: event.data.maxSpeed,
      time_0_100: event.data.time_0_100,
      time_100_200: event.data.time_100_200,
      time_200_300: event.data.time_200_300,
      is_public: event.data.isPublished
    }

    await $fetch(`${apiBack}motorcycles`, {
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

    Object.assign(state, {
      brand: '',
      model: '',
      year: undefined,
      engineSize: undefined,
      horsepower: undefined,
      maxSpeed: undefined,
      time_0_100: undefined,
      time_100_200: undefined,
      time_200_300: undefined,
      braking_100_0: undefined,
      braking_vmax_0: undefined,
      isPublished: false
    })
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

    <UFormField label="Modèle" name="model" required>
      <UInput v-model="state.model" />
    </UFormField>

    <UFormField label="Année" name="year" required>
      <UInputNumber v-model="state.year" />
    </UFormField>

    <UFormField label="Cylindrée" name="engineSize" required>
      <UInputNumber v-model="state.engineSize" />
    </UFormField>

    <UFormField label="Chevaux" name="horsepower">
      <UInputNumber v-model="state.horsepower" />
    </UFormField>

    <UFormField label="Vitesse max" name="maxSpeed">
      <UInputNumber v-model="state.maxSpeed" />
    </UFormField>

    <h4>Accélération</h4>

    <UFormField label="0 à 100" name="time_0_100">
      <UInputNumber v-model="state.time_0_100" />
    </UFormField>

    <UFormField label="100 à 200" name="time_100_200">
      <UInputNumber v-model="state.time_100_200" />
    </UFormField>

    <UFormField label="200 à 300" name="time_200_300">
      <UInputNumber v-model="state.time_200_300" />
    </UFormField>

    <h4>Freinage</h4>

    <UFormField label="100 à 0" name="braking_100_0">
      <UInputNumber v-model="state.braking_100_0" />
    </UFormField>

    <UFormField label="Vmax à 0" name="braking_vmax_0">
      <UInputNumber v-model="state.braking_vmax_0" />
    </UFormField>

    <UFormField name="isPublished">
      <USwitch v-model="state.isPublished" label="Publier la moto" />
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
