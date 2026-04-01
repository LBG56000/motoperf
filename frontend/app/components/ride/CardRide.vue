<script setup lang="ts">
import type { IRide } from '~/types/ride'

interface IProps {
  ride: IRide
}

const props = defineProps<IProps>()

const imageUrl = computed(() => {
  const link = props.ride.image_link
  return link
    ? `${link}`
    : 'https://images.unsplash.com/photo-1515777315835-281b94c9589f'
})

const participantsAvatars = [
  { src: 'https://i.pravatar.cc/100?u=1' },
  { src: 'https://i.pravatar.cc/100?u=2' },
  { src: 'https://i.pravatar.cc/100?u=3' }
]

const likeGestion = () => {
  // const runtimeConfig = useRuntimeConfig()
  // const res = await $fetch<{ url: string }>(
  //   `${runtimeConfig.public.apiBase}rides//like`,
  //   {
  //     method: 'POST',
  //     body: formData
  //   }
  // )
}
</script>

<template>
  <div class="card-image" :style="{ backgroundImage: `url(${imageUrl})` }">
    <div class="overlay"></div>

    <div class="card-content">
      <header class="card-header">
        <div class="title-wrapper">
          <span
            class="dot"
            :style="{ backgroundColor: props.ride.color || '#3b82f6' }"
            aria-hidden="true"
          ></span>
          <h2 class="title">{{ props.ride.title }}</h2>
        </div>
        <UButton
          icon="i-lucide-thumbs-up"
          :label="props.ride.like?.toString() || '0'"
          variant="subtle"
          color="neutral"
          size="md"
          style="cursor: pointer"
          class="like-button"
          aria-label="Liker cette balade"
          @click="likeGestion"
        />
      </header>

      <p class="description">{{ props.ride.description }}</p>

      <footer class="footer-section">
        <div class="info-grid">
          <UBadge
            variant="subtle"
            size="lg"
            icon="i-lucide-map-pinned"
            class="invisible-background"
          >
            {{ props.ride.distance }} km
          </UBadge>
          <UBadge
            variant="subtle"
            size="lg"
            icon="i-lucide-clock"
            class="invisible-background"
          >
            {{ props.ride.duration }} min
          </UBadge>
          <UBadge
            variant="subtle"
            size="lg"
            icon="i-lucide-map-pin"
            class="invisible-background"
          >
            {{ props.ride.start_town }} → {{ props.ride.end_town }}
          </UBadge>
          <UBadge
            variant="subtle"
            size="lg"
            icon="i-lucide-route"
            class="invisible-background"
          >
            Sinueux
          </UBadge>
        </div>

        <div class="card-footer-actions">
          <UAvatar
            alt="Avatar participant"
            :src="participantsAvatars[1]?.src"
          />
          <p>Créer par Wheeling92I</p>
          <!-- <UButton
            label="Participer"
            color="error"
            size="lg"
            class="btn-participate"
          />

          <div class="participants-pill">
            <UAvatarGroup size="xs" :max="3">
              <UAvatar
                v-for="(avatar, index) in participantsAvatars"
                :key="index"
                v-bind="avatar"
                alt="Avatar participant"
              />
            </UAvatarGroup>
            <span class="more-count">+{{ 15 }} motards</span>
          </div>
          -->
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.card-root {
  width: 100%;
  height: 260px;
  overflow: hidden;
  border: none !important;
}

:deep(.u-card-body) {
  padding: 0 !important;
}

.card-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.5) 40%,
    rgba(0, 0, 0, 0.1) 100%
  );
  border-radius: 12px;
}

.card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: white;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.like-button {
  color: white !important;
  font-weight: bold;
}

.description {
  font-size: 0.95rem;
  opacity: 0.9;
  margin: 0 0 16px 0;
  line-clamp: 1;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.invisible-background {
  background-color: transparent !important;
  color: white !important;
  border: none !important;
  box-shadow: none !important;
  padding-left: 0 !important;
  padding-right: 12px !important;
}

:deep(.invisible-background) {
  background-color: transparent !important;
  color: white !important;
}

.card-footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-participate {
  padding: 0 30px;
  font-weight: 700;
}

.participants-pill {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 4px 12px 4px 6px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111;
}

.more-count {
  font-size: 0.75rem;
  font-weight: 700;
}
</style>
