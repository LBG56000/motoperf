<script setup lang="ts">
import { useAuth } from '~/composable/useAuth';
import type { IMessage } from '~/types/messages'

const props = defineProps<{
  response: IMessage
}>()

const { user } = useAuth()

const apiBase = useRuntimeConfig().public.apiBase

const handleAddLikeOrDislike = async (isLike: boolean, messageId: string) => {
  await $fetch(`${apiBase}messages`, {
    method: 'PATCH',
    body: {
      userId: user.value?._id,
      messageId: messageId,
      like: isLike
    }
  })
}

const handleAddResponse = () => {
  console.log('Add response')
}
</script>

<template>
  <div class="comment">
    <UAvatar :src="`/images/users/${response.user.image}`" :alt="response.user.firstname" size="3xl"
      :title="response.user.firstname" class="margin-right-0_5" />

    <div class="comment-content">
      <div class="comment-header">
        <p class="bold">{{ response.user.firstname }},&nbsp;</p>
        <p>{{ formatTimeAgo(response.createdAt) }}</p>
      </div>
      <p class="comment-text">{{ response.content }}</p>
      <div class="comment-actions">
        <div class="action-button" @click="handleAddLikeOrDislike(true, response._id)">
          <UIcon name="i-lucide-thumbs-up" class="size-6" />
          <p>{{ response.like }}</p>
        </div>
        <div class="action-button" @click="handleAddLikeOrDislike(false, response._id)">
          <UIcon name="i-lucide-thumbs-down" class="size-6" />
          <p>{{ response.dislike }}</p>
        </div>
        <div class="action-button" @click="handleAddResponse">
          <UIcon name="i-lucide-messages-square" class="size-6" />
          <p>Répondre</p>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.comment {
  display: flex;
  flex-direction: row;
  gap: 1em;
  margin-bottom: 1em;
}

.comment-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.comment-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.comment-header,
.comment-actions,
.action-button {
  display: flex;
  align-items: center;
}

.comment-header {
  gap: 0.5rem;
}

.comment-text {
  margin: 0;
  line-height: 1.5;
}

.comment-actions {
  gap: 1.5rem;
  margin-top: 0.25rem;
}

.action-button {
  gap: 0.4rem;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.bold {
  font-weight: bold;
}
</style>
