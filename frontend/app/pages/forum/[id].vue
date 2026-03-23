<script setup lang="ts">
import type { IMessage } from '~/types/message'
import type { IPost } from '~/types/post'

const route = useRoute()

const post = ref<IPost>()
const responses = ref<IMessage[]>([])
const apiBase = useRuntimeConfig().public.apiBase

const newReponseOfPost = ref('')

const getPost = async () => {
  const data = await $fetch<({ data: IPost })>(`${apiBase}posts`, {
    params: {
      filter: JSON.stringify({ id: route.params.id }),
      project: 'image,content,question,createdAt,views',
      deep: true
    }
  })

  post.value = data.posts[0]
}

const getResponsesOfPost = async () => {
  const res = await fetch(`${apiBase}posts/${route.params.id}/responses`)
  const data = await res.json()
  responses.value = data.messages
}

const handleReturnForumList = () => {
  navigateTo('/forum')
}

onMounted(async () => {
  await Promise.all([
    getPost(),
    getResponsesOfPost()
  ])
})
</script>

<template>
  <div class="post-filters">
    <div>
      <UButton @click="handleReturnForumList">Retour à la liste</UButton>
      <ForumFilters />
    </div>
    <div>
      <div class="icon-and-text">
        <UAvatar src="https://thispersondoesnotexist.com/" size="3xl" loading="lazy" class="margin-2" />
        <h2>{{ post?.question }}</h2>
      </div>
      <div>
        <div class="flex row end margin-1_5">
          <div>
            <UBadge size="xl" class="margin-2">{{ post?.brand.name }}</UBadge>
            <UBadge size="xl">{{ post?.category.name }}</UBadge>
          </div>
          <div class="icon-and-text">
            <UIcon class="size-7 margin-2" name="i-lucide-messages-square" />
            <p>{{ responses.length || 0 }} réponses </p>
          </div>
        </div>
        <div class="flex row end margin-1_5">
          <p>Par {{ post?.user.firstname }}, {{ formatTimeAgo(post?.createdAt)
            }}</p>
          <div class="icon-and-text">
            <UIcon class="size-7 margin-2" name="i-lucide-eye" />
            <p>{{ post?.views }} vues</p>
          </div>
        </div>
        <img :src="post?.image" :alt="`Image du post ${post?.question} par ${post?.user.firstname}`"
          :title="`Image du post ${post?.question} par ${post?.user.firstname}`" class="img margin-1_5 margin-bottom-1">
      </div>
      <h4 class="margin-bottom-1">{{ post?.content }}</h4>
      <div class="icon-and-text margin-bottom-1">
        <UIcon name="i-lucide-star" class="size-7" />
        <p>Mettre ma réponse en favori</p>
      </div>
      <div class="margin-bottom-1 w-5/6">
        <UFormField label="Ecrire une réponse" required :ui="{ container: 'w-5/6' }">
          <UTextarea v-model="newReponseOfPost" class="w-5/6" />
        </UFormField>
        <UButton class="margin-top-0_5">Ecrire mon post</UButton>
        <ForumResponse :responses="responses" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.margin-2 {
  margin-right: 0.5em;
}

.icon-and-text {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.post-filters {
  display: flex;
  flex-direction: row;
  margin: 5em;
}

.post-filters>div:nth-child(1) {
  margin-right: 10em;
}

.flex.row.end {
  display: flex;
  flex-direction: row;
  align-items: end;
  justify-content: space-between;
  margin-right: 20em;
}

.img {
  width: 75%;
}

.margin-1_5 {
  margin-top: 1.5em;
}

.margin-top-0_5 {
  margin-top: 0.5em;
}

.margin-bottom-1 {
  margin-bottom: 1em;
}
</style>