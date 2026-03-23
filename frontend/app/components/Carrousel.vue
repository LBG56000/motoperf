<script></script>

<template>
  <UCarousel
    v-slot="{ item }"
    loop
    dots
    arrows
    :items="items"
    :ui="{
      item: 'basis-1/4 ps-0',
      prev: 'sm:start-8',
      next: 'sm:end-8'
    }"
  >
    <article>
      <h4>Model</h4>
      <img
        :src="item"
        width="320"
        height="320"
        class="rounded-lg"
        loading="lazy"
      />
      <div id="description">
        <p>ch</p>
        <hr />
        <p>Nm</p>
        <hr />
        <p>prix</p>
      </div>
      <div>
        <UButton
          size="xl"
          color="primary"
          class="rounded-full"
          style="color: white"
          icon="i-lucide-search"
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
