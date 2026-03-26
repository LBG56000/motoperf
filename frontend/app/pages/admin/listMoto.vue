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

const columns = [
  { accessorKey: 'brand', header: 'Marque' },
  { accessorKey: 'name', header: 'Modèle' },
  { accessorKey: 'year', header: 'Année' },
  {
    accessorKey: 'published',
    header: 'Statut',
    cell: ({ row }) => {
      const value = row.getValue('published') as boolean

      const color = value ? 'success' : 'error'
      const label = value ? 'complète' : 'Incomplète'

      return h(
        UBadge,
        { variant: 'subtle', color, class: 'capitalize' },
        () => label
      )
    }
  },
  {
    accessorKey: 'is_public',
    header: 'Publiée',
    cell: ({ row }) => {
      const value = row.getValue('is_public') as boolean
      const label = value ? 'Oui' : 'Non'

      return h(() => label)
    }
  }
]

async function fetchData() {
  try {
    const data = await $fetch<{ motorcycles: IMotorcycle[] }>(
      `${apiBase}motorcycles`,
      {
        //http://localhost:5000/api/v1/motorcycles?project=name,year,is_new,withAllField
        params: {
          project: 'name,year,is_new,withAllField',
          limit: 10000
        }
      }
    )

    if (data?.motorcycles) {
      motos.value = data.motorcycles.map((moto) => ({
        id: moto._id,
        brand: moto.brand?.name || '',
        name: moto.name || '',
        year: moto.year || '',
        is_public: moto.is_public,
        published: moto.withAllFiled
      }))
    }
  } catch (err) {
    console.error('Erreur fetch motos:', err)
  }
}

onMounted(() => {
  fetchData()
})
const panelOpen = ref(false)

function closePanel() {
  panelOpen.value = false
  selectedMoto.value = null
}

const refreshing = ref(false)

async function refreshAll() {
  refreshing.value = true
  await fetchData()
  refreshing.value = false
}

function onRowClick(row: any) {
  selectedMoto.value = row.original
  panelOpen.value = true
  console.log('aaaaaaaa')
}
</script>

<template>
  <div>
    <Header />
    <hr />

    <main>
      <UDashboardSidebar side="right" resizable collapsible>
        <h1>AAAAAAAA</h1>
      </UDashboardSidebar>
      <div class="header-page">
        <UInput icon="i-lucide-search" size="md" variant="outline" placeholder="Rechercher une moto..." />
        <USlideover v-model:open="panelOpen" title="Ajout d'une moto">
          <UButton size="md" color="primary" label="Open">Ajouter une moto</UButton>

          <template #body>
            <CardMoto :mode="selectedMoto ? 'edit' : 'create'" :moto="selectedMoto" :onClosePanel="closePanel"
              :onRefresh="refreshAll" />
          </template>
        </USlideover>
      </div>

      <div class="main-content">
        <h3>Liste des motos</h3>
        <UTable :data="motos" :columns="columns" :ui="{
          tr: 'cursor-pointer hover:bg-gray-50'
        }" @row:click="onRowClick" />
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

.main-content {
  margin: 4em;
}
</style>
