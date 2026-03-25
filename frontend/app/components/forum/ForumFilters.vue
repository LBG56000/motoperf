<script setup lang="ts">
import type { IBrand } from '~/types/brand'
import type { ICategory } from '~/types/category'

const categories = ref<ICategory[]>([])
const brands = ref<IBrand[]>([])
const onlyMyPosts = ref(true)
const props = defineProps({
  loading: Boolean
})

const handleHaveAllPosts = () => {
  navigateTo('/forum')
}

const getCategories = async () => {
  const res = await fetch(`${useRuntimeConfig().public.apiBase}categories?project=name,id,icon`)
  const data = await res.json()
  categories.value = data.categories
}

const getBrands = async () => {
  const res = await fetch(`${useRuntimeConfig().public.apiBase}brand?project=name,id,icon`)
  const data = await res.json()
  brands.value = data.brands
}

const handleHaveMyFavorites = () => {
  console.log('Myfavorite')
}

const handlClickOnCategory = (id: string) => {
  console.log('Click on category ' + id)
}

const handlClickBrand = (id: string) => {
  console.log('Click on brand' + id)
}

onMounted(async () => {
  await Promise.all([
    getBrands(), getCategories()
  ])
})
</script>

<template>
  <div class="filters">
    <div>
      <LazyForumModalAddPost />
    </div>
    <UCard class="margin-top_0_5">
      <div class="icon-and-text filter cursor-pointer" @click="handleHaveAllPosts">
        <UIcon class="size-7 margin-0_5" name="i-lucide-messages-square" />
        <p>Tous les posts</p>
      </div>
      <div class="icon-and-text filter cursor-pointer" @click="handleHaveMyFavorites">
        <UIcon class="size-7 margin-0_5" name="i-lucide-star" />
        <p>Mes favoris</p>
      </div>
      <div class="filter">
        <div class="icon-and-text">
          <UIcon class="size-7 margin-0_5" name="i-lucide-grid-2x2-check" />
          <p>Catégories</p>
        </div>
        <div class="filter">
          <USkeleton v-if="props.loading" class="size-12 rounded-full" />
          <div v-else v-for="category in categories" :key="category.id" class="icon-and-text sub-filter cursor-pointer"
            @click="handlClickOnCategory(category.id)">
            <UIcon class="size-7 margin-0_5" :name="'i-lucide-' + category.icon" />
            <p>{{ category.name }}</p>
          </div>
        </div>
      </div>
      <div class="filter">
        <div class="icon-and-text">
          <UIcon class="size-7 margin-0_5" name="i-lucide-warehouse" />
          <p>Marques</p>
        </div>
        <div class="filter">
          <USkeleton v-if="props.loading" class="size-12 rounded-full" />
          <div v-else v-for="brand in brands" :key="brand.id" class="icon-and-text sub-filter cursor-pointer"
            @click="handlClickBrand(brand.id)">
            <img :src="brand.icon" :alt="brand.name" :title="brand.name" width="40" height="40" class="margin-0_5">
            <p>{{ brand.name }}</p>
          </div>
        </div>
      </div>
      <USwitch v-model="onlyMyPosts" label="Uniquement mes posts" class="filter" />
    </UCard>
  </div>
</template>

<style scoped>
.icon-and-text {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.filter {
  margin: 2em;
}

.filters {
  margin-right: 2em;
  position: sticky;
  top: 0;
  left: 0;
}

.sub-filter {
  margin: 1em;
}

.margin-0_5 {
  margin-right: 0.5em;
}

.margin-top_0_5 {
  margin-top: 0.5em;
}
</style>