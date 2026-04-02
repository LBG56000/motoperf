<script setup lang="ts">
import { useAuth } from '~/composable/useAuth';
import type { IPost } from '~/types/post';

const props = defineProps<{
  isNewPost: boolean
  post: IPost
}>()

const { user, isAuthenticated } = useAuth()

const isOwner = computed(() => {
  if (!isAuthenticated.value || !user.value || !props.post?.user) {
    return false
  }
  return props.post.user._id === user.value._id
})
</script>

<template>
  <div>
    <LazyForumModalAddPost :is-new-post :post :is-same-user="isOwner" />
  </div>
</template>
<style scoped></style>