<script setup lang="ts">
import { useAuth } from '~/composable/useAuth';
import { useConnexionModal } from '~/composable/useConnexionModal';
import type { IMessage } from '~/types/messages'

const props = defineProps<{
  response: IMessage,
  isAmotoComment?: boolean
}>()

const { user } = useAuth()
const { open } = useConnexionModal()
const toast = useToast()
const apiBase = useRuntimeConfig().public.apiBase

const responsesOfComment = ref<IMessage[]>([])
const isResponseOfAcomment = ref(false)
const isResponseOfAcommentValue = ref('')

const message = ref<IMessage>({ ...props.response })
const isSolidThumbUp = computed(() => user.value && message.value.usersLikeId.includes(user.value._id))
const isSolidThumbDown = computed(() => user.value && message.value.usersDislikeId.includes(user.value._id))
const isOpen = ref(false)

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

const handleSeeInputToAddResponseOfComment = async () => {
  if (props.isAmotoComment) {
    return navigateTo('/forum')
  } else {
    isResponseOfAcomment.value = !isResponseOfAcomment.value
  }
}

const handleAddResponseOfComment = async (commentId: string) => {
  if (!user.value) {
    open()
  } else {
    const newMessage = await $fetch.raw(`${apiBase}messages`, {
      method: 'POST',
      body: {
        content: isResponseOfAcommentValue.value,
        user: user.value._id,
        reference: commentId,
        referenceModel: 'Message'
      }
    })

    if (newMessage.ok) {
      toast.add({
        title: 'Succès',
        description: 'Votre commentaire a été ajouté.',
        color: 'success'
      })
      isResponseOfAcommentValue.value = ''
      getResponseOfComment(commentId)
      isResponseOfAcomment.value = false
    } else {
      toast.add({
        title: 'Erreur',
        description: 'Votre commentaire n\'a pas être ajouté.',
        color: 'error'
      })
    }
  }
}

const getResponseOfComment = async (commentId: string) => {
  const response = await $fetch<{ messages: IMessage[] }>(`${apiBase}messages/${commentId}/responses`, {
    method: 'GET',
  })

  responsesOfComment.value = response.messages
}

watch(() => props.response, (newVal) => {
  message.value = { ...newVal }
}, { deep: true })

onMounted(async () => {
  await getResponseOfComment(message.value._id)
})
</script>

<template>
  <div class="comment">
    <div class="avatar">
      <UIcon v-if="responsesOfComment.length !== 0" :name="isOpen ? 'i-lucide-circle-minus' : 'i-lucide-circle-plus'"
        class="cursor-pointer" @click="isOpen = !isOpen" />
      <UAvatar :src="`/images/users/${message.user.image}`" :alt="message.user.firstname" size="3xl"
        :title="message.user.firstname" class="margin-right-0_5" />
    </div>
    <div class="comment-content">
      <div class="comment-header">
        <p class="bold">{{ message.user.firstname }},&nbsp;</p>
        <p>{{ formatTimeAgo(message.createdAt) }}</p>
      </div>
      <p class="comment-text">{{ message.content }}</p>
      <div class="comment-actions">
        <div class="action-button cursor-pointer" @click="handleAddLikeOrDislike(true, message._id)">
          <UIcon :name="isSolidThumbUp ? 'i-heroicons-hand-thumb-up-solid' : 'i-heroicons-hand-thumb-up'"
            class="size-6" />
          <p>{{ message.like }}</p>
        </div>
        <div class="action-button cursor-pointer" @click="handleAddLikeOrDislike(false, message._id)">
          <UIcon :name="isSolidThumbDown ? 'i-heroicons-hand-thumb-down-solid' : 'i-heroicons-hand-thumb-down'"
            class="size-6" />
          <p>{{ message.dislike }}</p>
        </div>
        <div class="action-button cursor-pointer" @click="handleSeeInputToAddResponseOfComment">
          <UIcon name="i-lucide-messages-square" class="size-6" />
          <p>Répondre</p>
        </div>
      </div>
      <div v-if="isResponseOfAcomment" class="add-reponse-comment w-1/2">
        <UTextarea v-model="isResponseOfAcommentValue" placeholder="Ecrivez votre réponse">
        </UTextarea>
        <UButton label="Envoyer ma réponse" class="w-1/3 cursor-pointer" size="sm"
          :disabled="isResponseOfAcommentValue.length === 0" @click="handleAddResponseOfComment(message._id)" />
      </div>
      <template v-if="responsesOfComment.length !== 0 && isOpen">
        <div v-for="responseOfComment in responsesOfComment" :key="responseOfComment._id">
          <div class="responses-container">
            <Comment :response="responseOfComment" />
          </div>
        </div>
      </template>

    </div>
  </div>
</template>
<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.responses-container {
  margin-left: 0.75rem;
  border-left: 2px solid var(--border-gray);
  padding-left: 2em;
  margin-top: 1rem;
  transition: border-color 0.2s ease;
}

.add-reponse-comment {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.avatar {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5em;
  height: fit-content;
}

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
