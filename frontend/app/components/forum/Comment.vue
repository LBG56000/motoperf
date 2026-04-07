<script setup lang="ts">
import { useAuth } from '~/composable/useAuth';
import { useConnexionModal } from '~/composable/useConnexionModal';
import type { IMessage } from '~/types/messages'

const props = defineProps<{
  response: IMessage
}>()

const { user } = useAuth()
const { open } = useConnexionModal()

const apiBase = useRuntimeConfig().public.apiBase
const message = ref<IMessage>({ ...props.response })
const isSolidThumbUp = computed(() => user.value && message.value.usersLikeId.includes(user.value._id))
const isSolidThumbDown = computed(() => user.value && message.value.usersDislikeId.includes(user.value._id))

const handleAddLikeOrDislike = async (isLike: boolean, messageId: string) => {
  if (!user.value) {
    open()
  } else {
    const updateMessage = await $fetch<{ populatedMessage: IMessage }>(`${apiBase}messages`, {
      method: 'PATCH',
      body: {
        userId: user.value?._id,
        messageId: messageId,
        like: isLike
      }
    })
    message.value = updateMessage.populatedMessage
  }
}

const handleAddResponse = () => {
  console.log('Add response')
}

watch(() => props.response, (newVal) => {
  message.value = { ...newVal }
}, { deep: true })
</script>

<template>
  <div class="comment">
    <UAvatar :src="`/images/users/${message.user.image}`" :alt="message.user.firstname" size="3xl"
      :title="message.user.firstname" class="margin-right-0_5" />

    <div class="comment-content">
      <div class="comment-header">
        <p class="bold">{{ message.user.firstname }},&nbsp;</p>
        <p>{{ formatTimeAgo(message.createdAt) }}</p>
      </div>
      <p class="comment-text">{{ message.content }}</p>
      <div class="comment-actions">
        <div class="action-button" @click="handleAddLikeOrDislike(true, message._id)">
          <UIcon :name="isSolidThumbUp ? 'i-heroicons-hand-thumb-up-solid' : 'i-heroicons-hand-thumb-up'"
            class="size-6" />
          <p>{{ message.like }}</p>
        </div>
        <div class="action-button" @click="handleAddLikeOrDislike(false, message._id)">
          <UIcon :name="isSolidThumbDown ? 'i-heroicons-hand-thumb-down-solid' : 'i-heroicons-hand-thumb-down'"
            class="size-6" />
          <p>{{ message.dislike }}</p>
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
