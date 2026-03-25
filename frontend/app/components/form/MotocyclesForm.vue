<script setup lang="ts">
import type { IBrand } from '@/types/brands'
import type { IMotorcycle } from '@/types/motorcycles'

// Moto 1 || Moto 2
const props = defineProps<{
  formTitle: string
}>()
const selectedId = defineModel<string>()
const placeholderMotorcycle = {
  brand: 'Yamaha',
  name: 'MT-07',
  year: 2020
}

// Motorcycle choice
const motorcycle = ref<{
  brand: IBrand | undefined
  model: IMotorcycle | undefined
  year: number | undefined
}>({
  brand: undefined,
  model: undefined,
  year: undefined
})
// Full Brands list
const brandsList = ref<IBrand[]>([])
const motorcyclesList = ref<IMotorcycle[]>([])
const isMotorcyclesFetched = ref<boolean>(false)
const apiBase = useRuntimeConfig().public.apiBase
// Pont string ↔ objet pour UInputMenu
const brandInput = computed({
  get: () => motorcycle.value.brand?.name ?? '',
  set: (name: string) => {
    motorcycle.value.brand = brandsList.value.find((b) => b.name === name)
    motorcycle.value.model = undefined
    motorcycle.value.year = undefined
    isMotorcyclesFetched.value = false
  }
})

const modelInput = computed({
  get: () => motorcycle.value.model?.name ?? '',
  set: (name: string) => {
    motorcycle.value.model = motorcyclesList.value.find((m) => m.name === name)
    motorcycle.value.year = undefined
  }
})

// Brands list filtered by user input
const brandFilteredList = computed(() => {
  const search = brandInput.value.toLowerCase()
  return brandsList.value
    .filter((brand) => brand.name?.toLowerCase().includes(search))
    .map((brand) => brand.name)
    .filter((name): name is string => !!name)
})
// Model list filtered by user input
const motorcycleFilteredList = computed(() => {
  const search = modelInput.value.toLowerCase()
  return [
    ...new Set(
      motorcyclesList.value
        .filter((motorcycle) => motorcycle.name?.toLowerCase().includes(search))
        .map((motorcycle) => motorcycle.name)
        .filter((name): name is string => !!name)
    )
  ]
})

const yearFilteredList = computed(() => {
  return [
    ...new Set(
      motorcyclesList.value
        .filter((m) => m.name === motorcycle.value.model?.name)
        .map((m) => m.year)
    )
  ]
})

watch(
  () => [motorcycle.value.model?.name, motorcycle.value.year],
  ([name, year]) => {
    if (name && year) {
      const found = motorcyclesList.value.find(
        (m) => m.name === name && m.year === year
      )
      selectedId.value = found?.id
    } else {
      selectedId.value = undefined
    }
  }
)

async function fetchBrands() {
  const data = await $fetch<{ brands: IBrand[] }>(`${apiBase}brands`, {
    params: { project: 'name' }
  })
  brandsList.value = data.brands
}

async function fetchMotorcyclesByBrand() {
  // If first change on model input, fetch motorcycles list for the selected brand
  if (!isMotorcyclesFetched.value) {
    const data = await $fetch<{ motorcycles: IMotorcycle[] }>(
      `${apiBase}motorcycles`,
      {
        params: {
          project: 'id,name,year',
          filter: JSON.stringify({ brandId: motorcycle.value.brand?._id })
        }
      }
    )
    motorcyclesList.value = data.motorcycles
    isMotorcyclesFetched.value = true
  }
}

onMounted(() => {
  fetchBrands()
})
</script>

<template>
  <div class="form">
    <h3>{{ props.formTitle }}</h3>
    <UFormField label="Marque" name="brand">
      <UInputMenu
        v-model="brandInput"
        :placeholder="placeholderMotorcycle.brand"
        :items="brandFilteredList"
        clear
      >
        <template #empty>
          Aucune marque trouvée
        </template>
      </UInputMenu>
    </UFormField>

    <UFormField label="Modèle" name="model">
      <UInputMenu
        v-model="modelInput"
        :placeholder="placeholderMotorcycle.name"
        :items="motorcycleFilteredList"
        clear
        @update:open="fetchMotorcyclesByBrand"
      >
        <template #empty>
          Aucun modèle trouvé
        </template>
      </UInputMenu>
    </UFormField>

    <UFormField label="Année" name="year">
      <UInputMenu
        v-model="motorcycle.year"
        :placeholder="String(placeholderMotorcycle.year)"
        :items="yearFilteredList"
        clear
        @update:open="fetchMotorcyclesByBrand"
      >
        <template #empty>
          Aucune année trouvée
        </template>
      </UInputMenu>
    </UFormField>
  </div>
</template>

<style scoped>
.form {
  border: 1px solid #dddddd;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  width: fit-content;
  border-radius: 13px;
}

h3 {
  text-align: center;
}

:deep(input) {
  background-color: #f4f4f4;
}
</style>
