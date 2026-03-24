<script setup lang="ts">
import ForumPost from '~/components/forum/ForumPost.vue';
import type { IPost } from '~/types/post';

const posts = ref<IPost[]>([])

const loading = ref(true)
const getPosts = async () => {
  const res = await fetch(`${useRuntimeConfig().public.apiBase}posts?deep=true&project=content,question,id,createdAt,views`)
  const data = await res.json()
  posts.value = await Promise.all(
    data.posts.map(async (post: IPost) => {
      post.responses = await getResponseOfPost(post.id)
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

const handleOpenAPost = (id: string) => {
  navigateTo(`/forum/${id}`)
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
    <USkeleton v-if="loading" class="size-12 rounded-full" />
    <div v-else class="forum-filters">
      <ForumFilters />
      <div>
        <div v-for="post in posts" :key="post.id">
          <ForumPost :post="post" :is-user="isUserOfPost" class="cursor-pointer" @click="handleOpenAPost(post.id)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.forum-filters {
  display: flex;
  flex-direction: row;
  align-items: start;
  margin: 5em;
}

.forum-filters>div>div {
  margin-top: 2em;
}
</style>