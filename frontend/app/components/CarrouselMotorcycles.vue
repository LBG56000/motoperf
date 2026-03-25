<script setup lang="ts">
import type { IMotorcycle } from '@/types/motorcycles'

defineProps<{
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
      item: 'basis-1/5 ps-0 self-stretch',
      prev: 'sm:start-15',
      next: 'sm:end-15'
    }"
  >
    <article>
      <h5>{{ item.name }}</h5>
      <img
        src="/images/motorcycles/YZF-R1.png"
        width="100"
        height="100"
        class="rounded-lg"
        loading="lazy"
      />
      <div id="description">
        <p>{{ item.horsePower }} ch</p>
        <p>-</p>
        <p>{{ item.torque }} Nm</p>
        <p>-</p>
        <p>{{ item.price }}€</p>
      </div>
      <div>
        <UButton
          size="sm"
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
  width: 230px;
  justify-content: space-between;

  border: 2px solid var(--background-secondary);
  border-radius: 16px;

  padding: 12px 0;
  margin: 0 2px;

  gap: 0.5rem;
}

article p,
article span {
  font-family: 'Krona One', sans-serif;
}

article p {
  font-size: 13px;
  font-weight: 200;
}

hr {
  width: 5px;
}

#description {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: -5px;
}
</style>
