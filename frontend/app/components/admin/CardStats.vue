<script setup lang="ts">
const props = defineProps<{
  value: number
  title: string
}>()
</script>

<template>
  <UCard :ui="{ header: 'border-0 pb-0', body: 'pt-0' }">
    <template #header>
      <h4>{{ props.value }}</h4>
    </template>
    <template #default>
      <h6>{{ props.title }}</h6>
    </template>
  </UCard>
</template>

<style scoped>
h4 {
  font-size: 40px;
  text-align: center;
}
h6 {
  font-size: 16px;
  text-align: center;
}
</style>
