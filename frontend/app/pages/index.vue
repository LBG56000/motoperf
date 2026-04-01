<script setup lang="ts">
import Sponsor from '@/components/Sponsor.vue'
import type { IMotorcycle } from '@/types/motorcycles'
import StatsHome from '~/components/card/StatsHome.vue'

interface IItemTab {
  content: string
  urlImg: string
}

const itemsCaroussel = ref<IMotorcycle[]>([])
const apiBase = useRuntimeConfig().public.apiBase
const dynamicStats = ref<IItemTab[]>([])
const itemsTab = reactive<IItemTab[]>([
  {
    content: 'Base de données complètes',
    urlImg: '/images/accueil/icon_checked_classic.png'
  },
  {
    content: 'Communautée active',
    urlImg: '/images/accueil/icon_clock.png'
  },
  {
    content: 'Equipe passionée',
    urlImg: '/images/accueil/icon_idea.png'
  }
])

async function fetchStats() {
  // Get total brands
  const totalBrands = await $fetch<{ totalBrands: number }>(
    `${apiBase}brands/count`
  )

  // Get total horsPower
  const totalHorsePower = await $fetch<{ totalHorsePower: number }>(
    `${apiBase}motorcycles/stats`
  )

  // Get total motorcycles
  const totalMotorcycles = await $fetch<{ totalMotorcycles: number }>(
    `${apiBase}motorcycles/count`
  )

  dynamicStats.value.push({
    content: `${totalBrands} Marques`,
    urlImg: '/images/accueil/icon_Binocle.png'
  })
  if (totalHorsePower)
    dynamicStats.value.push({
      content: `${totalHorsePower} Chevaux`,
      urlImg: '/images/accueil/icon_Settings.png'
    })
  if (totalMotorcycles)
    dynamicStats.value.push({
      content: `${totalMotorcycles} Motos`,
      urlImg: '/images/accueil/icon_moto.png'
    })
}
async function fetchMotocycles() {
  const data = await $fetch<{ motorcycles: IMotorcycle[] }>(
    `${apiBase}motorcycles`,
    {
      params: {
        project: 'name,horsePower,torque,price'
      }
    }
  )
  itemsCaroussel.value = data.motorcycles
}

onMounted(async () => {
  await fetchMotocycles()
  await fetchStats()
})
</script>
<template>
  <main>
    <section class="hero-header">
      <h1 class="title">
        Trouver <span style="color: var(--ui-primary)">la moto</span>
        <br />
        qui vous convient
      </h1>

      <div class="list">
        <UButton
          size="xl"
          color="primary"
          class="rounded-full button"
          style="color: white"
          >Essayer</UButton
        >
        <UButton
          size="xl"
          color="neutral"
          class="rounded-full button"
          trailing-icon="i-lucide-arrow-right"
          variant="outline"
          >Se connecter</UButton
        >
      </div>

      <div class="hero-images">
        <img src="/images/accueil/R1_fond.png" alt="Moto" class="img-cover" />
        <img src="/images/accueil/BMW_fond.png" alt="Moto" class="img-cover" />
        <img
          src="/images/accueil/R1_fond.png"
          alt="Moto"
          class="img-cover moto-left"
        />
        <img
          src="/images/accueil/BMW_fond.png"
          alt="Moto"
          class="img-cover moto-right"
        />
      </div>
    </section>
    <section>
      <div class="list">
        <article>
          <h2>Un peu d'histoire</h2>
          <p>
            Depuis que l'homme a inventé le moteur thermique, il a toujours
            cherché à repousser ses limites : plus de
            <span class="bold">puissance</span>, plus de
            <span class="bold">couple</span>, plus de
            <span class="bold">vitesse</span>. Depuis
            <span class="bold">1868</span>, des milliers de modèles de motos ont
            vu le jour. Et si toi aussi tu veux savoir laquelle correspond le
            mieux à ce que tu recherches...
          </p>
        </article>
        <img src="/images/accueil/Hornet.png" alt="Moto" class="img-cover" />
      </div>
    </section>
    <section class="basic-section">
      <h2 style="text-align: center">
        <span style="color: var(--ui-primary)">Motocenter</span>
        en quelques chiffres
      </h2>
      <article class="column">
        <div class="row justify-content-center">
          <StatsHome
            v-for="item in dynamicStats"
            :key="item.content"
            :content="item.content"
            :url-img="item.urlImg"
          />
        </div>
        <div class="row justify-content-center">
          <StatsHome
            v-for="item in itemsTab"
            :key="item.content"
            :content="item.content"
            :url-img="item.urlImg"
          />
        </div>
      </article>
    </section>
    <section class="basic-section">
      <h2 style="text-align: center">Les best-sellers</h2>
      <CarrouselMotorcycles :items="itemsCaroussel" />
    </section>
    <section class="invitation justify-content-center basic-section">
      <h3 style="text-align: center">Tester le comparateur dès maintenant !</h3>
      <div>
        <UButton
          size="xl"
          color="primary"
          class="rounded-full button"
          style="color: white"
          to="/comparo"
          >Essayer</UButton
        >
      </div>
    </section>
    <section class="basic-section">
      <h2 style="text-align: center">Ils nous font confiance</h2>
      <Sponsor />
    </section>
    <section class="justify-content-center">
      <UButton
        size="xl"
        color="neutral"
        class="rounded-full button"
        icon="i-lucide-badge-check"
        style="margin-bottom: 20vh"
        >Approuvé par 100 utilisateurs</UButton
      >
    </section>
  </main>
</template>
<style scoped>
main {
  display: flex;
  flex-direction: column;
  gap: 5rem;
}

section {
  margin: 0 10%;
}

.basic-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero-header {
  display: flex;
  flex-direction: column;

  justify-content: center;
  align-items: center;

  height: 100vh;
}

.title {
  text-align: center;
}

.list {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.hero-images {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.img-cover {
  flex: 1; /* = flex-grow: 1; flex-shrink: 1; flex-basis: 0%; */

  width: 100%;
  min-width: 38%;
  height: 100%;

  object-fit: cover;

  object-position: center;
}

.moto-left {
  animation: slide-left-to-right 2s ease-in-out;
}

.moto-right {
  animation: slide-right-to-left 2s ease-in-out;
}

.row {
  display: flex;
  flex-direction: row;
  gap: 3.5rem;

  margin: 0 5%;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

.justify-content-center {
  display: flex;
  justify-content: center;
}

.bold {
  font-weight: bold;
}

.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  gap: 1rem;

  border: solid 3px var(--background-secondary);
  border-radius: 10px;

  width: 100%;
  aspect-ratio: 1 / 1;
}

.box img {
  width: 75px;
  height: auto;
}

.invitation {
  display: flex;
  flex-direction: column;
  align-items: center;

  border-radius: 40px;
  background-color: var(--background-secondary);

  margin: 0 20%;
  padding: 4rem;

  gap: 3rem;
}

.button {
  font-size: small;
  padding: 10px 40px;
}

@keyframes slide-left-to-right {
  from {
    transform: translateX(-100vw);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-right-to-left {
  from {
    transform: translateX(100vw);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
