<script setup lang="ts">
import Header from '~/components/admin/Header.vue'
import { h, resolveComponent } from 'vue'
import CardMoto from '../../components/admin/CardMoto.vue'
import type { IMotorcycle } from '~/types/motorcycles'

definePageMeta({
  layout: 'admin'
})

const UBadge = resolveComponent('UBadge')
const apiBase = useRuntimeConfig().public.apiBase
const motos = ref<IMotorcycle[]>([])
const selectedMoto = ref<IMotorcycle | null>(null)
const search = ref<string>()
const panelOpen = ref(false)
const refreshing = ref(false)
const UButton = resolveComponent('UButton')

const columns = [
  {
    accessorKey: 'brand',
    header: ({ column }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Marque',
        icon:
          column.getIsSorted() === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : column.getIsSorted() === 'desc'
              ? 'i-lucide-arrow-down-wide-narrow'
              : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
  },
  {
    accessorKey: 'name',
    header: ({ column }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Modèle',
        icon:
          column.getIsSorted() === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : column.getIsSorted() === 'desc'
              ? 'i-lucide-arrow-down-wide-narrow'
              : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
  },
  {
    accessorKey: 'year',
    header: ({ column }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Année',
        icon:
          column.getIsSorted() === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : column.getIsSorted() === 'desc'
              ? 'i-lucide-arrow-down-wide-narrow'
              : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
  },
  {
    accessorKey: 'withAllField',
    header: ({ column }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Statut',
        icon:
          column.getIsSorted() === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : column.getIsSorted() === 'desc'
              ? 'i-lucide-arrow-down-wide-narrow'
              : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      }),
    cell: ({ row }) => {
      const value = row.getValue('withAllField') as boolean
      return h(
        UBadge,
        {
          variant: 'subtle',
          color: value ? 'success' : 'error',
          class: 'capitalize'
        },
        () => (value ? 'Complète' : 'Incomplète')
      )
    }
  },
  {
    accessorKey: 'is_public',
    header: ({ column }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Publiée',
        icon:
          column.getIsSorted() === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : column.getIsSorted() === 'desc'
              ? 'i-lucide-arrow-down-wide-narrow'
              : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      }),
    cell: ({ row }) => h(() => (row.getValue('is_public') ? 'Oui' : 'Non'))
  }
]

async function fetchData() {
  try {
    const data = await $fetch<{ motorcycles: IMotorcycle[] }>(
      `${apiBase}motorcycles`,
      {
        //http://localhost:5000/api/v1/motorcycles?project=name,year,is_new,withAllField
        params: {
          project: 'name,year,is_public,withAllField',
          limit: 10000
        }
      }
    )
    if (data?.motorcycles) {
      motos.value = data.motorcycles.map((moto) => ({
        _id: moto._id,
        brand: moto.brand?.name || '',
        name: moto.name || '',
        year: moto.year || '',
        is_public: moto.is_public,
        withAllField: moto.withAllField
      }))
    }
  } catch (err) {
    console.error('Erreur fetch motos:', err)
  }
}

function openPanel() {
  panelOpen.value = true
}

function closePanel() {
  panelOpen.value = false
  selectedMoto.value = null
}

async function refreshAll() {
  refreshing.value = true
  await fetchData()
  refreshing.value = false
}

function onRowClick(row) {
  const rowIndex = row.srcElement.parentElement.rowIndex

  const moto = listMotosearch.value[rowIndex - 2]

  if (!moto) return console.error('moto introuvable')
  selectedMoto.value = moto
  openPanel()
}

const listMotosearch = computed(() => {
  if (search.value) {
    return motos.value.filter(
      (moto) =>
        moto.name.toLowerCase().includes(search.value.toLowerCase()) ||
        moto.brand.toLowerCase().includes(search.value.toLowerCase())
    )
  } else {
    return motos.value
  }
})

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <Header />
    <hr />

    <main>
      <div class="header-page">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          size="md"
          variant="outline"
          placeholder="Rechercher une moto..."
        />
        <UButton size="md" color="primary" label="Open" @click="openPanel"
          >Ajouter une moto</UButton
        >
      </div>

      <h3 class="header-list">Liste des motos</h3>
      <div class="main-content">
        <div class="table-moto">
          <UTable
            sticky
            :data="listMotosearch"
            :columns="columns"
            :ui="{
              tr: 'cursor-pointer hover:bg-gray-50'
            }"
            @select="onRowClick"
          />
        </div>
        <div v-if="panelOpen" class="panel-moto">
          <CardMoto
            :key="selectedMoto?._id ?? 'create'"
            :mode="selectedMoto ? 'edit' : 'create'"
            :moto="selectedMoto"
            :onClosePanel="closePanel"
            :onRefresh="refreshAll"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.header-page {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 3rem;
}

.table-moto {
  flex: 1;
  padding: 1em;
}
.panel-moto {
  margin: 2em;
  border: 1px solid var(--border-gray);
  border-radius: 15px;
  padding: 1em;
}

.main-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-list {
  margin-left: 1em;
}

.panel-moto {
  margin: 2em;
  border: 1px solid var(--border-gray);
  border-radius: 15px;
  padding: 1em;
  height: calc(150vh - 200px);
  overflow-y: auto;
  position: sticky;
  top: 60px;
}
</style>
