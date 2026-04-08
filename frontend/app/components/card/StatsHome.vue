<script setup lang="ts">
const props = defineProps<{
  content: string
  urlImg: string
}>()
</script>

<template>
  <div class="box">
    <img :src="props.urlImg" />
    <p>{{ props.content }}</p>
  </div>
</template>

<style scoped>
.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  gap: 1rem;

  border: solid 2px var(--border-gray);
  border-radius: 10px;

  width: 100%;
  aspect-ratio: 1 / 1;
}


.box img {
  width: 75px;
  height: auto;
}
</style>