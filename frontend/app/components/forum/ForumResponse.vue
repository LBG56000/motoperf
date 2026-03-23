<script setup lang="ts">
import type { IMessage } from '~/types/message';

const props = defineProps<{
  responses: IMessage[]
}>()
</script>
<template>
  <div>
    <div v-for="response in props.responses" :key="response.id">
      {{ response }}
    </div>
  </div>
</template>
<style scoped></style>