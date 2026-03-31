<script setup lang="ts">
import type { IPost } from '~/types/post'

const props = defineProps<{
  post: IPost
  isUser: boolean
  loading: boolean
}>()

const handleEditAPost = () => {
  console.log('Edit post')
}

const handleOpenAPost = (id: string) => {
  navigateTo(`/forum/${id}`)
}
</script>
<template>
  <UCard class="card-forum" @click="handleOpenAPost(post._id)">
    <div class="postCard">
      <USkeleton v-if="props.loading" class="size-12 rounded-full" />
      <UAvatar
        v-else
        :src="`/_nuxt/assets/images/users/${props.post.user.image}`"
        size="3xl"
        loading="lazy"
        class="margin-2"
      />
      <div class="main">
        <div class="top">
          <h3>{{ props.post.title }}</h3>
          <!--TODO: à compléter pour la gestion utilisateur-->
          <UIcon
            v-if="props.isUser"
            class="size-6"
            name="i-lucide-square-pen"
            @click.stop="handleEditAPost"
          />
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
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.statsContainer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
}

.postCard {
  width: 55vw;
  margin: 1em auto;
  padding: 1em;
  display: flex;
  gap: 1em;
  align-items: flex-start;
}

.top {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
}

.badges {
  display: flex;
  gap: 0.5em;
  margin-bottom: 1em;
  margin-top: 1em;
}

.stats:nth-child(2) {
  margin-bottom: 0;
}

.stats {
  display: flex;
  gap: 0.5em;
  margin-top: 1em;
}

.grid {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 0.5em;
  width: 100%;
}
</style>
