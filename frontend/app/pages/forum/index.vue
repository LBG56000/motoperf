<script setup lang="ts">
import ForumMyFavoritesPost from '~/components/forum/ForumMyFavoritesPost.vue';
import HeaderInfo from '~/components/global/HeaderInfo.vue';
import type { IPost } from '~/types/post';

const posts = ref<IPost[]>([])

const loading = ref(true)
const getPosts = async () => {
  const res = await fetch(`${useRuntimeConfig().public.apiBase}posts?deep=true&project=content,question,id,createdAt,views`)
  const data = await res.json()
  posts.value = await Promise.all(
    data.posts.map(async (post: IPost) => {
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
      <ForumFilters :loading />
      <div>
        <USkeleton v-if="loading" class="size-12 rounded-full" />
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
  justify-content: space-between;
  margin: 5em;
}

.forum-filters>div>div,
.my-favorites {
  margin-top: 2em;
}

.panel {
  display: flex;
  flex-direction: column;
  margin-left: 2em;
  position: sticky;
  top: 0;
  right: 0;
}
</style>