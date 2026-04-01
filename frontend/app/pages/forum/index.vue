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
      <div>
        <ForumPanel :loading :active-filter="filters" @filters="handleFilter" />
      </div>
      <div class="posts">
        <USkeleton v-if="loading" class="size-12 rounded-full" />
        <div v-if="loading === false && posts.length === 0" class="center add-post-empty">
          <p>Aucun post disponible, ajouter le premier</p>
          <LazyForumModalAddPost />
        </div>
        <div v-for="post in posts" :key="post._id">
          <ForumPost :post="post" :is-user="isUserOfPost" class="cursor-pointer" :loading />
        </div>
      </div>
      <div class="panel">
        <ForumMyPosts />
        <ForumMyFavoritesPost />
      </div>
    </div>
  </div>
</template>

<style scoped>
/** Style version PC */
@media (max-width: 1024px) {
  #navbar-pc {
    display: none;
  }

  .panel {
    display: none;
  }
}

/** Style version mobile */

@media (min-width: 1024px) {
  #navbar-mobile {
    display: none;
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
}

.center {
  text-align: center;
}

.add-post-empty {
  display: flex;
  gap: 0.5em;
  margin: auto;
}

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
  margin: 2em;
  gap: 2em;
}

.forum-filters>div:nth-child(2) {
  flex: 1;
  min-width: 0;
}

.posts {
  display: flex;
  flex-direction: column;
  gap: 1.5em;
}
</style>