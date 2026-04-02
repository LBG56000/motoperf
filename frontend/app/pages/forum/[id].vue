<script setup lang="ts">
import Comment from '~/components/forum/Comment.vue'
import HeaderInfo from '~/components/global/HeaderInfo.vue'
import type { IMessage } from '~/types/messages'
import type { IPost } from '~/types/post'

const route = useRoute()

const post = ref<IPost>()
const responses = ref<IMessage[]>([])
const apiBase = useRuntimeConfig().public.apiBase

const newReponseOfPost = ref('')

const getPost = async () => {
  const data = await $fetch<{ data: IPost }>(`${apiBase}posts`, {
    params: {
      filter: JSON.stringify({ _id: route.params.id }),
      project: 'image,content,title,createdAt,views',
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

onMounted(async () => {
  await Promise.all([getPost(), getResponsesOfPost()])
})
</script>

<template>
  <div>
    <HeaderInfo :scroll-to-element-id="'post'">
      <template #title>
        <h1>
          Bienvenue sur le <br />
          <span style="color: red">Forum</span>
        </h1>
      </template>
      <template #subtitle>
        <p>Échanger librement sur votre sujet favori en lien avec la moto.</p>
      </template>
    </HeaderInfo>
    <div id="post" class="post-filters">
      <div>
        <ForumPanel />
      </div>
      <div>
        <div class="icon-and-text">
          <UAvatar :src="`/images/users/${post?.user.image}`" size="3xl" loading="lazy" class="margin-2" />
          <h2>{{ post?.title }}</h2>
        </div>
        <div>
          <div class="grid margin-1_5">
            <div>
              <UBadge size="xl" class="margin-2">{{ post?.brand.name }}</UBadge>
              <UBadge size="xl">{{ post?.category.name }}</UBadge>
            </div>
            <div class="icon-and-text right">
              <UIcon class="size-7 margin-2" name="i-lucide-messages-square" />
              <p>{{ responses.length || 0 }} réponses</p>
            </div>
            <p>
              Par {{ post?.user.firstname }},
              {{ formatTimeAgo(post?.createdAt) }}
            </p>
            <div class="icon-and-text right">
              <UIcon class="size-7 margin-2" name="i-lucide-eye" />
              <p>{{ post?.views }} vues</p>
            </div>
          </div>
          <div class="icon-and-text margin-bottom-1 margin-top-0_5">
            <UIcon name="i-lucide-star" class="size-7" />
            <p>Mettre ce post en favori</p>
          </div>
          <img :src="`${post?.image}`" :alt="`Image du post ${post?.title} par ${post?.user.firstname}`"
            :title="`Image du post ${post?.title} par ${post?.user.firstname}`" class="img margin-1_5 margin-bottom-1">
        </div>
        <h4 class="margin-bottom-1">{{ post?.content }}</h4>
        <UFormField label="Ecrire une réponse" required :ui="{ container: 'w-5/6' }">
          <UTextarea v-model="newReponseOfPost" class="w-5/6" />
        </UFormField>
        <UButton class="margin-top-0_5" :disabled="newReponseOfPost === ''">Ajouter ma réponse</UButton>
        <p v-if="responses.length === 0">
          Aucune réponse à ce post, ajouter la première
        </p>
        <div v-else class="margin-bottom-1 w-5/6">
          <Comment :responses="responses" />
        </div>
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
  align-items: start;
  gap: 3rem;
  margin: 2rem 5rem;
}

.post-filters>div:first-child {
  flex-shrink: 0;
}

.post-filters>div:nth-child(2) {
  flex: 1;
  min-width: 0;
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

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 0.5em;
}

.right {
  justify-self: end;
}
</style>
