<script setup lang="ts">

</script>

<template>
  <div>
    <UCard variant="outline" class="my-posts custom-border">
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

.custom-border {
  border: 0.5px solid var(--border-gray);
}
</style>