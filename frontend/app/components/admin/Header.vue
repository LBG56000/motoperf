<script setup lang="ts">
const appName: string = useRuntimeConfig().public.appName
</script>
<template>
  <header class="flex justify-between m-2">
    <div></div>
    <h1>{{ appName }} BACK OFFICE</h1>
    <UIcon name="i-lucide-circle-user-round" class="size-11" />
  </header>
</template>

<style scoped>
h1 {
  font-family: 'krona-one';
  color: var(--text-color);
  font-size: 50px;
}
</style>
