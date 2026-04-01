<script setup lang="ts">
import { useAuth } from '~/composable/useAuth';
import type { IPost } from '~/types/post'
import type { IUser } from '~/types/users';

const props = defineProps<{
  post: IPost
  loading: boolean
}>()

const handleEditAPost = () => {
  console.log('Edit post')
}

const apiBase = useRuntimeConfig().public.apiBase

const addViewInAPost = async (id: string) => {
  await $fetch(`${apiBase}posts/add-view`, {
    method: 'POST',
    params: {
      filter: JSON.stringify({ id: id }),
    }
  })
}

const handleOpenAPost = async (id: string) => {
  await addViewInAPost(id)
  navigateTo(`/forum/${id}`)
}

const isSameUserConnected = (userPost: IUser): boolean => {
  const { user } = useAuth()
  return user.value?._id === userPost._id

}
</script>
<template>
  <UCard class="card-forum custom-border" @click="handleOpenAPost(post._id)">
    <div class="postCard">
      <USkeleton v-if="props.loading" class="size-12 rounded-full" />
      <UAvatar v-else :src="`/images/users/${props.post.user.image}`" size="3xl" loading="lazy" class="margin-2" />
      <div class="main">
        <div class="top">
          <h4>{{ props.post.title }}</h4>
          <!--TODO: à compléter pour la gestion utilisateur-->
          <UIcon v-if="isSameUserConnected(props.post.user)" class="size-6" name="i-lucide-square-pen"
            @click.stop="handleEditAPost" />
        </div>
        <div class="grid">
          <div>
            <div class="badges">
              <UBadge size="lg" class="margin-2">{{
                props.post.brand.name
                }}</UBadge>
              <UBadge size="lg">{{ props.post.category.name }}</UBadge>
            </div>

            <p>
              Par {{ props.post.user.firstname }},
              {{ formatTimeAgo(props.post.createdAt) }}
            </p>
          </div>
          <div class="statsContainer">
            <div class="stats">
              <UIcon class="size-7 margin-2" name="i-lucide-messages-square" />
              <p>{{ props.post.responses.length || 0 }} réponses</p>
            </div>
            <div class="stats">
              <UIcon class="size-7 margin-2" name="i-lucide-eye" />
              <p>{{ props.post.views }} vues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
<style scoped>
.card-forum {
  width: 100%;
  max-width: 1100px;
  /* margin: 0.5rem auto; */
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.statsContainer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
}

.postCard {
  width: 100%;
  padding: 0.75rem 1.25rem;
  display: flex;
  gap: 1.5em;
  align-items: flex-start;
}

.top {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
}

.top h3 {
  margin: 0;
}

.badges {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 1em;
  margin-top: 1em;
}

.stats:nth-child(2) {
  margin-bottom: 0;
}

.stats {
  display: flex;
  gap: 0.3em;
  margin-top: 1em;
  align-items: center;
  justify-content: flex-start;
}

.grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5em;
  width: 100%;
}

.custom-border {
  border: 0.5px solid var(--border-gray);
}
</style>
