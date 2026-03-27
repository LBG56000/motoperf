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
const refreshing = ref(false)

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

  const moto = motos.value[rowIndex - 2]

  if (!moto) return console.error('moto introuvable')
  selectedMoto.value = moto
  openPanel()
}
</script>

<template>
  <div>
    <Header />
    <hr />

    <main>
      <div class="header-page">
        <UInput
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
            :data="motos"
            :columns="columns"
            :ui="{
              tr: 'cursor-pointer hover:bg-gray-50'
            }"
            @select="onRowClick"
          />
        </div>
        <div v-if="panelOpen" class="panel-moto">
          <CardMoto
            :key="selectedMoto?.id ?? 'create'"
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
  align-items: center;
}

.header-list {
  margin-left: 1em;
}
</style>
