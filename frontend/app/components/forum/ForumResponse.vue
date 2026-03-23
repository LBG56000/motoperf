<script setup lang="ts">
import type { IMessage } from '~/types/message';

const props = defineProps<{
  responses: IMessage[]
}>()
</script>
<template>
  <div class="margin-1_5">
    <div v-for="response in props.responses" :key="response.id">
      <div class="icon-and-text">
        <UAvatar :src="`/_nuxt/assets/images/users/${response.user.image}`" :alt="response.user.firstname" size="3xl"
          :title="response.user.firstname" class="margin-right-0_5" />
        <div class="icon-and-text">
          <p class="bold">{{ response.user.firstname }},&nbsp;</p>
          <p>{{ formatTimeAgo(response.createdAt) }}</p>
        </div>
      </div>
      <p class="margin-top-0_5 margin-left-1">{{ response.content }}</p>
      <div class="icon-and-text margin-1_5 margin-left-1">
        <div class="icon-and-text margin-right-0_5">
          <UIcon name="i-lucide-thumbs-up" class="size-6 margin-right-0_2" />
          <p>{{ response.like }}</p>
        </div>
        <div class="icon-and-text margin-right-0_5">
          <UIcon name="i-lucide-thumbs-down" class="size-6 margin-right-0_2" />
          <p>{{ response.dislike }}</p>
        </div>
        <div class="icon-and-text margin-right-0_5">
          <UIcon name="i-lucide-messages-square" class="size-6 margin-right-0_2" />
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

.margin-top-0_5 {
  margin-top: 0.5em;
}

.margin-right-0_5 {
  margin-right: 0.5em;
}

.margin-right-0_2 {
  margin-right: 0.2em;
}

.margin-left-1 {
  margin-left: 1em;
}

.bold {
  font-weight: bold;
}
</style>