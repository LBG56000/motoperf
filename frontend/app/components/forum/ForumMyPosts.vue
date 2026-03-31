<script setup lang="ts">

</script>

<template>
  <div>
    <UCard variant="outline" class="my-posts">
      <template #header>
        <h3>Mes posts</h3>
      </template>
      <template #default>
        <p>Aucun post ajouté, vous pouvez ajouter le premier</p>
      </template>
    </UCard>
  </div>
</template>

<style scoped>
.my-posts {
  width: 100%;
}
</style>