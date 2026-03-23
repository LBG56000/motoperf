<script setup lang="ts">
import type { IPost } from '~/types/post';

const props = defineProps<{
  post: IPost,
  isUser: boolean
}>()

const handleEditFilter = () => {
  console.log('Edit post')
}
</script>
<template>
  <UCard class="postCard">
    <div class="card-forum">
      <UAvatar :src="`/_nuxt/assets/images/users/${props.post.user.image}`" size="3xl" loading="lazy"
        class="margin-2" />
      <div>
        <div class="container title">
          <h4>{{ props.post.content }}</h4>
          <UIcon v-if="props.isUser" class="size-6" name="i-lucide-square-pen" @click="handleEditFilter" />
        </div>
        <div class="container">
          <div class="mark-and-category">
            <UBadge size="lg" class="margin-2">{{ props.post.brand.name }}</UBadge>
            <UBadge size="lg">{{ props.post.category.name }}</UBadge>
          </div>
          <div class="icon-and-text">
            <UIcon class="size-7 margin-2" name="i-lucide-messages-square" />
            <p>{{ props.post.responses.length || 0 }} réponses </p>
          </div>
        </div>
        <div class="container">
          <p>Par {{ props.post.user.firstname }}, {{ formatTimeAgo(props.post.createdAt)
            }}</p>
          <div class="icon-and-text">
            <UIcon class="size-7 margin-2" name="i-lucide-eye" />
            <p>{{ props.post.views }} vues</p>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
<style scoped>
.postCard {
  margin: 0.5em;
  padding: 0.5em;
}

.margin-2 {
  margin-right: 0.5em;
}

.icon-and-text {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.card-forum {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.img {
  border-radius: 10em;
  margin-right: 0.5em;
}

.title {
  align-items: center;
}

.title>h4 {
  margin-right: 2em;
}
</style>