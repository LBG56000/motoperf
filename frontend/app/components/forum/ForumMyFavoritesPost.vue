<script setup lang="ts">

</script>

<template>
  <div>
    <UCard variant="outline" class="my-favourites-posts">
      <template #header>
        <h3>Mes favoris</h3>
      </template>
      <template #default>
        <p>Aucun post en favori</p>
      </template>
    </UCard>
  </div>
</template>

<style scoped>
.my-favourites-posts {
  width: 100%;
}
</style>