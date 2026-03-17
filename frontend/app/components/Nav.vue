<script setup></script>

<template>
  <div class="navbar">
    <UButton size="md" color="primary" class="logo">Motocenter</UButton>

    <div class="list">
      <UButton size="md" color="neutral" variant="ghost">Comparateur</UButton>
      <UButton size="md" color="neutral" variant="ghost">Forum</UButton>
      <UButton size="md" color="neutral" variant="ghost">Balades</UButton>
      <UButton size="md" color="neutral" variant="ghost"
        >Nous connaitre</UButton
      >
      <UButton
        trailing-icon="i-lucide-arrow-right"
        size="md"
        color="neutral"
        class="connexion"
        >Connexion</UButton
      >
    </div>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: white;

  padding: 10px;
}

.list {
  display: flex;
  flex-direction: row;
  gap: 40px;
}

p {
  align-self: center;
  font-family: 'Popins', sans-serif;
}

.logo {
  font-size: 1.2rem;
  font-weight: bold;

  padding: 20px 50px;
}

.connexion {
  font-size: 1rem;
  font-weight: 600;

  border-radius: 40px;

  padding: 20px 50px;
  margin: 0;
}
</style>
