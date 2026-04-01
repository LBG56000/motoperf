<script setup>
const { fetchUser } = useAuth()
onMounted(fetchUser)
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style></style>
