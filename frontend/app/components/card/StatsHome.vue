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

  width: 20%;
  aspect-ratio: 1 / 1;
}

@media (max-width: 1024px) {
  .box {
    min-width: 105px;
    border: 1px solid var(--background-secondary);
  }

  img {
    width: 40px;
    height: auto;
  }

  p {
    font-size: 10px;
  }
}
</style>
