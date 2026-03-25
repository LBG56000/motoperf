<script setup>
import ToggleSwitch from './ToggleSwitch.vue'
import LogoApp from './LogoApp.vue'
const isOpen = ref(false)
const mode = ref(false)
const colorMode = useColorMode()

function toggle_open() {
  isOpen.value = !isOpen.value
}

// In the loading of the page
watch(
  () => colorMode.value,
  (newVal) => {
    mode.value = newVal === 'dark'
  },
  { immediate: true }
)

// To update the color mode when the toggle switch is changed
colorMode.preference = computed(() => (mode.value ? 'dark' : 'light'))
</script>

<template>
  <div id="navbar-pc">
    <div class="navbar">
      <div class="list-left">
        <LogoApp />
        <ToggleSwitch v-model="mode" />
      </div>
      <div class="list-right">
        <UButton size="md" color="neutral" variant="ghost" to="/">Comparateur</UButton>
        <UButton size="md" color="neutral" variant="ghost" to="/forum">Forum</UButton>
        <UButton size="md" color="neutral" variant="ghost" to="/">Balades</UButton>
        <UButton size="md" color="neutral" variant="ghost" to="/knowUs">Nous connaitre</UButton>
        <UButton trailing-icon="i-lucide-arrow-right" size="xl" color="neutral" class="rounded-full button">Connexion
        </UButton>
      </div>
    </div>
  </div>
  <div id="navbar-mobile">
    <div class="navbar">
      <div class="list-left">
        <LogoApp />
        <ToggleSwitch v-model="mode" />
      </div>
      <UIcon :name="isOpen ? 'i-lucide-chevron-down' : 'i-lucide-menu'" class="size-10" @click="toggle_open" />
    </div>
    <div v-if="isOpen" class="list-mobile">
      <UButton size="md" color="neutral" variant="ghost" style="justify-content: center" to="/">Comparateur</UButton>
      <UButton size="md" color="neutral" variant="ghost" style="justify-content: center" to="/">Forum</UButton>
      <UButton size="md" color="neutral" variant="ghost" style="justify-content: center" to="/">Balades</UButton>
      <UButton size="md" color="neutral" variant="ghost" style="justify-content: center" to="/">Nous connaitre</UButton>
      <UButton size="md" color="neutral" variant="ghost" style="justify-content: center">Connexion</UButton>
      <UButton size="md" color="neutral" variant="ghost" style="justify-content: center">Mon profil</UButton>
    </div>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: var(--background);

  padding: 10px;
}

#navbar-mobile,
#navbar-pc {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.logo {
  font-size: 1rem;
  font-weight: bold;
  font-family: 'Krona-one';

  padding: 10px 25px;

  color: white;
}

.list-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.list-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 40px;
}

/** Style version PC */
@media (max-width: 1024px) {
  #navbar-pc {
    display: none;
  }
}

/** Style version mobile */

@media (min-width: 1024px) {
  #navbar-mobile {
    display: none;
  }
}

.list-mobile {
  display: flex;
  flex-direction: column;
  gap: 10px;

  text-align: center;

  background-color: var(--background);
}

.button {
  font-size: small;
  padding: 10px 40px;
}
</style>
