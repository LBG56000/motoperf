<script setup lang="ts">
import { IMotorcycle } from '~/types/motorcycle'

const props = defineProps<{
  items: IMotorcycle[]
}>()
</script>

<template>
  <UCarousel
    v-slot="{ item }"
    loop
    dots
    arrows
    :items="items"
    :ui="{
      container: 'flex items-stretch h-full',
      item: 'basis-1/4 ps-0 self-stretch',
      prev: 'sm:start-8',
      next: 'sm:end-8'
    }"
  >
    <article>
      <h4>{{ item.model }}</h4>
      <img
        src="/_nuxt/assets/images/sponsors/2.png"
        width="320"
        height="320"
        class="rounded-lg"
        loading="lazy"
      />
      <div id="description">
        <p>{{ item.horsePower }} ch</p>
        <hr />
        <p>Nm</p>
        <hr />
        <p>{{ item.price }}€</p>
      </div>
      <div>
        <UButton
          size="xl"
          color="primary"
          class="rounded-full"
          style="color: white"
          icon="i-lucide-arrow-left-right"
          >Comparer</UButton
        >
      </div>
    </article>
  </UCarousel>
</template>

<style scoped>
article {
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;

  height: 100%;
  justify-content: space-between;

  border: 4px solid var(--background-secondary);
  border-radius: 20px;

  padding: 20px;
  margin: 0 30px;

  gap: 0.5rem;
}

article p,
article h4,
article span {
  font-family: 'Krona One', sans-serif;
}

article p {
  font-size: 0.7rem;
  font-weight: bold;
}

hr {
  width: 5px;
}

#description {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
