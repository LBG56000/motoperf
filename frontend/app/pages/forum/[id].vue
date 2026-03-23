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
      <div class="flex row end">
        <div>
          <UBadge size="lg" class="margin-2">{{ post?.brand.name }}</UBadge>
          <UBadge size="lg">{{ post?.category.name }}</UBadge>
        </div>
        <div class="icon-and-text">
          <UIcon class="size-7" name="i-lucide-messages-square" />
          <p>{{ responses.length || 0 }} réponses </p>
        </div>
      </div>
      <div class="flex row end">
        <p>Par {{ post?.user.firstname }}, {{ formatTimeAgo(post?.createdAt)
        }}</p>
        <div class="icon-and-text">
          <UIcon class="size-7" name="i-lucide-eye" />
          <p>{{ post?.views }} vues</p>
        </div>
      </div>
      <img :src="post?.image" :alt="`Image du post ${post?.question} par ${post?.user.firstname}`"
        :title="`Image du post ${post?.question} par ${post?.user.firstname}`" class="img">
      <h4>{{ post?.content }}</h4>
      <div class="icon-and-text">
        <UIcon name="i-lucide-star" class="size-7" />
        <p>Mettre ma réponse en favori</p>
      </div>
      <div>
        <UFormField label="Ecrire une réponse" required>
          <UTextarea v-model="newReponseOfPost" />
        </UFormField>
        <UButton>Ecrire mon post</UButton>
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

.flex.row.end {
  display: flex;
  flex-direction: row;
  align-items: end;
  justify-content: space-between;
}

.img {
  width: 75%;
}
</style>