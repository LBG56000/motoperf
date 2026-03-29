<script setup lang="ts">
import ConnexionForm from './ConnexionForm.vue'
import ToggleSwitch from './ToggleSwitch.vue'
import LogoApp from './LogoApp.vue'
import type { IUser } from '@/types/users'

const isOpen = ref(false)
const mode = ref(false)
const colorMode = useColorMode()

const isModalOpen = ref(false)

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

const apiBase = useRuntimeConfig().public.apiBase
async function testUser() {
  const data = await $fetch<{ users: IUser }>(`${apiBase}users`, {
    credentials: 'include',
    params: { project: 'email,password' }
  })
  return data.users
}

onMounted(async () => {
  console.log(await testUser())
})

// To update the color mode when the toggle switch is changed
colorMode.preference = computed(() => (mode.value ? 'dark' : 'light'))
</script>

<template>
  <div id="navbar-pc">
    <ConnexionForm v-model="isModalOpen" />
    <div class="navbar">
      <div class="list-left">
        <LogoApp />
        <ToggleSwitch v-model="mode" />
      </div>
      <div class="list-right">
        <UButton size="md" color="neutral" variant="ghost" to="/comparo"
          >Comparateur</UButton
        >
        <UButton size="md" color="neutral" variant="ghost" to="/forum"
          >Forum</UButton
        >
        <UButton size="md" color="neutral" variant="ghost" to="/ride"
          >Balades</UButton
        >
        <UButton size="md" color="neutral" variant="ghost" to="/knowUs"
          >Nous connaitre</UButton
        >
        <UButton
          trailing-icon="i-lucide-arrow-right"
          size="xl"
          color="neutral"
          class="rounded-full button"
          @click="() => (isModalOpen = true)"
          >Connexion
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
      <UIcon
        :name="isOpen ? 'i-lucide-chevron-down' : 'i-lucide-menu'"
        class="size-10"
        @click="toggle_open"
      />
    </div>
    <div v-if="isOpen" class="list-mobile">
      <UButton
        size="md"
        color="neutral"
        variant="ghost"
        style="justify-content: center"
        to="/"
        >Comparateur</UButton
      >
      <UButton
        size="md"
        color="neutral"
        variant="ghost"
        style="justify-content: center"
        to="/forum"
        >Forum</UButton
      >
      <UButton
        size="md"
        color="neutral"
        variant="ghost"
        style="justify-content: center"
        to="/ride"
        >Balades</UButton
      >
      <UButton
        size="md"
        color="neutral"
        variant="ghost"
        style="justify-content: center"
        to="/"
        >Nous connaitre</UButton
      >
      <UButton
        size="md"
        color="neutral"
        variant="ghost"
        style="justify-content: center"
        >Connexion</UButton
      >
      <UButton
        size="md"
        color="neutral"
        variant="ghost"
        style="justify-content: center"
        >Mon profil</UButton
      >
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
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 9999;
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
