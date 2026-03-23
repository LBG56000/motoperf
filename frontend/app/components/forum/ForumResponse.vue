<script setup lang="ts">
import type { IMessage } from '~/types/message';

const props = defineProps<{
  responses: IMessage[]
}>()
</script>
<template>
  <div class="margin-1_5">
    <div v-for="response in props.responses" :key="response.id">
      <br>
      <div class="icon-and-text">
        <UAvatar :src="`/_nuxt/assets/images/users/${response.user.image}`" :alt="response.user.firstname" size="3xl"
          :title="response.user.firstname" />
        <p>{{ response.user.firstname }}</p>
      </div>
      <p>{{ response.content }}</p>
      <div class="icon-and-text">
        <div class="icon-and-text">
          <UIcon name="i-lucide-thumbs-up" class="size-6" />
          <p>{{ response.like }}</p>
        </div>
        <div class="icon-and-text">
          <UIcon name="i-lucide-thumbs-down" class="size-6" />
          <p>{{ response.dislike }}</p>
        </div>
        <div class="icon-and-text">
          <UIcon name="i-lucide-messages-square" class="size-6" />
          <p>Répondre</p>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.icon-and-text {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.margin-1_5 {
  margin-top: 1.5em;
}
</style>