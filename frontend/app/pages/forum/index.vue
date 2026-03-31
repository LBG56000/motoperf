<script setup lang="ts">
import ForumMyFavoritesPost from '~/components/forum/ForumMyFavoritesPost.vue';
import HeaderInfo from '~/components/global/HeaderInfo.vue';
import type { IPost } from '~/types/post';

const posts = ref<IPost[]>([])
const loading = ref(true)
const filters = ref({
  brandIds: [] as string[],
  categoryIds: [] as string[],
  onlyMyPost: true,
  searchBar: ''
})

const filter = computed(() => {
  const conditions = []

  if (filters.value.brandIds.length) {
    conditions.push({
      brand: { $in: filters.value.brandIds }
    })
  }

  if (filters.value.categoryIds.length) {
    conditions.push({
      category: { $in: filters.value.categoryIds }
    })
  }

  if (filters.value.searchBar && filters.value.searchBar.trim().length !== 0) {
    conditions.push({
      title: { $regex: filters.value.searchBar, $options: 'i' }
    })
  }

  if (!conditions.length) return undefined

  return JSON.stringify({
    $or: conditions
  })
})

const getPosts = async () => {
  const res = await $fetch<{ posts: IPost[] }>(`${useRuntimeConfig().public.apiBase}posts`, {
    params: {
      deep: true,
      project: 'content,title,id,createdAt,views',
      filter: filter.value
    }
  })
  posts.value = await Promise.all(
    res.posts.map(async (post: IPost) => {
      post.responses = await getResponseOfPost(post._id)
      // await getResponsesOfResponses()
      return post
    })
  )
}

const getResponseOfPost = async (postId: string) => {
  const res = await fetch(`${useRuntimeConfig().public.apiBase}posts/${postId}/responses`)
  const data = await res.json()
  return data.messages
}

// const getResponsesOfResponses = async () => {
//   posts.value.forEach(async (response: IMessage) => {
//     const res = await fetch(`${useRuntimeConfig().public.apiBase}messages/${response.id}/responses`)
//     const data = await res.json()
//     return posts.value.push(data.messages)
//   })
// }

const isUserOfPost = computed(() => {
  return true
})

const handleFilter = async (updateFilter: any) => {
  filters.value = {
    ...filters.value,
    ...updateFilter
  }
  await getPosts()
}

const handleSearch = () => {
  if (filters.value.searchBar.trim().length > 0) {
    getPosts()
  }
}

onMounted(async () => {
  await Promise.all([
    getPosts()
  ])
  loading.value = false
})
</script>

<template>
  <div>
    <HeaderInfo :scroll-to-element-id="'forum'">
      <template #title>
        <h1>
          Bienvenue sur le <br />
          <span style="color: red">Forum</span>
        </h1>
      </template>
      <template #subtitle>
        <p>
          Échanger librement sur votre sujet favori en lien avec la moto.
        </p>
      </template>
    </HeaderInfo>
    <div id="forum" class="forum-filters">
      <ForumFilters :loading :active-filter="filters" @filters="handleFilter" />
      <div>
        <USkeleton v-if="loading" class="size-12 rounded-full" />
        <UFormField label="Rechercher un post dans le forum">
          <UInput v-model="filters.searchBar" placeholder="Rechercher un post" @update:model-value="handleSearch">
            <template v-if="filters.searchBar?.length" #trailing>
              <UButton color="neutral" variant="link" size="sm" icon="i-lucide-circle-x" aria-label="Clear input"
                class="cursor-pointer" @click="filters.searchBar = ''; getPosts()" />
            </template>
          </UInput>
        </UFormField>
        <p v-if="loading === false && posts.length === 0">Aucun post disponible</p>
        <div v-for="post in posts" :key="post._id">
          <ForumPost :post="post" :is-user="isUserOfPost" class="cursor-pointer" :loading />
        </div>
      </div>
      <div class="panel">
        <ForumMyFavoritesPost class="my-favorites" />
        <ForumMyPosts class="my-favorites" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.forum {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 25vh;
  gap: 1em;
}

.cursor-pointer {
  cursor: pointer;
}

.forum-filters {
  display: flex;
  flex-direction: row;
  align-items: start;
  gap: 2em;
  margin: 2em;
}

.forum-filters>div:nth-child(2) {
  flex: 1;
  min-width: 0;
}

.forum-filters>div>div,
.my-favorites {
  margin-top: 2em;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 300px;
  position: sticky;
  top: 0;
  right: 0;
}
</style>