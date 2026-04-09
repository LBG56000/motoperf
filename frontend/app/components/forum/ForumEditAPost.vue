<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import type { IPost } from '~/types/post'

const props = defineProps<{
  isNewPost: boolean
  post: IPost
}>()

const emit = defineEmits(['edited-post'])

const { user, isAuthenticated } = useAuth()

const isOwner = computed(() => {
  if (!isAuthenticated.value || !user.value || !props.post?.user) {
    return false
  }
  return props.post.user._id === user.value._id
})

const handleEditPost = () => {
  emit('edited-post')
}
</script>

<template>
  <div>
    <LazyForumModalAddPost
      :is-new-post
      :post
      :is-same-user="isOwner"
      @added-post="handleEditPost"
    />
  </div>
</template>
<style scoped></style>
