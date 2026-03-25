<script setup lang="ts">
import HeaderInfo from '../components/global/HeaderInfo.vue'
import DisplayMapRide from '../components/ride/DisplayMapRide.vue'
</script>
<template>
  <div>
    <HeaderInfo :scroll-to-element-id="'map'">
      <template #title>
        <h1>
          Trouver de nouveaux chemins à <br />
          <span style="color: red">Explorer</span>
        </h1>
      </template>
      <template #subtitle>
        <p>
          Trouver facilement des nouveaux lieux, des nouvelles balades et des
          nouvelles personnes pour les réaliser avec vous.
        </p>
      </template>
    </HeaderInfo>

    <DisplayMapRide />

    <div class="add-container">
      <p>Vous ne trouvez pas votre balade, vous pouvez l’ajouter :</p>
      <UButton color="primary" to="/add-ride" icon="i-lucide-map-pinned"
        >Ajouter une balade</UButton
      >
    </div>
  </div>
</template>
<style scoped>
.add-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 50px;
  margin-left: 20px;
}
</style>
