<script setup lang="ts">
const props = defineProps<{
  fieldName: string
  firstValue: string
  secondValue: string
}>()
</script>

<template>
  <div class="resultat">
    <div class="container-row">
      <div class="left">
        <img :src="`${props.firstValue}`" alt="Pas d'image" />
      </div>
      <div class="right">
        <img :src="`${props.secondValue}`" alt="Pas d'image" />
      </div>
    </div>
  </div>
</template>

<style scoped>
h3 {
  text-align: center;
}

.resultat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.container-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 80%;
  gap: 20px;
}

.left,
.right {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
