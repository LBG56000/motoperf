<script setup lang="ts">
import type { IRide } from '~/types/ride'
import { computed } from 'vue'
import { useAuth } from '~/composable/useAuth'
import type { IUser } from '~/types/users.js'
import { useConnexionModal } from '~/composable/useConnexionModal.js'

interface IProps {
  ride: IRide
}

const isLikedCurrent = ref(false)
const { user } = useAuth()
const { open } = useConnexionModal()
const creator = ref<any>(null)

const props = defineProps<IProps>()
const emit = defineEmits(['update:like'])

const participantsAvatars = ref([
  { src: 'https://avatars.githubusercontent.com/u/739984?v=4', alt: 'User 1' },
  { src: 'https://avatars.githubusercontent.com/u/739985?v=4', alt: 'User 2' },
  { label: 'JD', alt: 'John Doe' }, // On peut aussi utiliser des initiales
  { src: 'https://avatars.githubusercontent.com/u/739986?v=4', alt: 'User 3' }
])

const srcAvatarCreator = computed<string>(() => {
  return creator.value?.image
    ? `/images/users/${creator.value.image}`
    : `/images/users/default.svg`
})

const hour = computed<number>(() => {
  return Math.floor(props.ride.duration)
})

const minutes = computed<number>(() => {
  return Math.round((props.ride.duration - hour.value) * 60)
})

const imageUrl = computed(() => {
  const link = props.ride.image_link
  return link
    ? `${link}`
    : 'https://images.unsplash.com/photo-1515777315835-281b94c9589f'
})

const likeGestion = async () => {
  const runtimeConfig = useRuntimeConfig()

  try {
    const userId = user.value?._id

    // Si pas d'ID, on arrête
    if (!userId) {
      open()
      return
    }

    // Si on est connecté, on met le like
    const res = await $fetch<{ like: number; isLiked: boolean }>(
      `${runtimeConfig.public.apiBase}rides/${props.ride._id}/like`,
      {
        method: 'PATCH',
        body: { userId: userId }
      }
    )

    emit('update:like', res.like)
    isLikedCurrent.value = res.isLiked
  } catch (error) {
    console.error('Utilisateur non connecté ou erreur serveur', error)
  }
}

// Fonction pour charger les infos de l'auteur
const fetchCreatorInfos = async () => {
  const runtimeConfig = useRuntimeConfig()
  if (!props.ride.user_id) return

  try {
    const data: any = await $fetch<{ user: IUser }>(
      `${runtimeConfig.public.apiBase}users`,
      {
        params: {
          filter: JSON.stringify({ _id: props.ride.user_id }),
          project: 'all'
        }
      }
    )

    creator.value = data.users[0] || data
  } catch (e) {
    console.error("Erreur lors de la récupération de l'auteur", e)
  }
}

onMounted(async () => {
  await fetchCreatorInfos()

  const runtimeConfig = useRuntimeConfig()
  try {
    const currentUser: any = await $fetch(
      `${runtimeConfig.public.apiBase}users/account`,
      { credentials: 'include' }
    )
    if (currentUser && props.ride.liked_id) {
      isLikedCurrent.value = props.ride.liked_id.includes(currentUser.users._id)
    }
  } catch (e: any) {
    console.error('Non connecté', e)
  }
})
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

          <UBadge
            v-if="props.ride.is_event"
            variant="subtle"
            size="md"
            icon="i-lucide-calendar-days"
            class="event-badge-header"
          >
            {{ props.ride.date_event }} • {{ props.ride.hour_event }}
          </UBadge>
        </div>

        <UButton
          :icon="
            isLikedCurrent
              ? 'i-heroicons-hand-thumb-up-solid'
              : 'i-heroicons-hand-thumb-up'
          "
          :label="props.ride.like?.toString() || '0'"
          variant="subtle"
          color="neutral"
          size="md"
          class="like-button cursor-pointer"
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
            {{ hour }} h {{ minutes }} min
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

        <div class="card-footer-container">
          <div class="card-footer-item">
            <template v-if="creator">
              <UAvatar
                :alt="`Avatar de ${creator.pseudo}`"
                :src="srcAvatarCreator"
              />
              <p>
                Créée par <strong>{{ creator.pseudo }}</strong>
              </p>
            </template>

            <template v-else>
              <UIcon name="i-lucide-loader-2" class="animate-spin" />
              <p>Chargement...</p>
            </template>
          </div>

          <div v-if="ride.is_event" class="card-footer-item">
            <UButton
              label="Participer"
              color="error"
              size="lg"
              class="btn-participate cursor-pointer"
            />

            <div class="participants-pill">
              <UAvatarGroup size="xs" :max="3">
                <UAvatar
                  v-for="(avatar, index) in participantsAvatars"
                  :key="index"
                  v-bind="avatar"
                />
              </UAvatarGroup>
              <span class="more-count">+15</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* --- CONTENEUR GLOBAL & OVERLAY --- */
.card-image {
  position: relative;
  width: 100%;
  min-height: 220px;
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.4) 60%,
    rgba(0, 0, 0, 0.2) 100%
  );
  z-index: 1;
}

.card-content {
  position: relative;
  z-index: 2;
  padding: 16px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* --- HEADER : TITRE & LIKE --- */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.title-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
}

.event-badge-header {
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.7rem;
  padding: 2px 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

/* --- BOUTON LIKE --- */
.like-button {
  color: white !important;
  font-weight: bold;
  transition: transform 0.2s ease;
}

.like-button:active {
  transform: scale(1.2);
}

/* --- CORPS : DESCRIPTION & GRILLE D'INFOS --- */
.description {
  font-size: 0.9rem;
  opacity: 0.85;
  margin: 4px 0 12px 0;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-bottom: 12px;
}

/* Style partagé pour tous les badges d'info */
.invisible-background,
:deep(.invisible-background) {
  background-color: transparent !important;
  color: white !important;
  border: none !important;
  box-shadow: none !important;
  padding-left: 0 !important;
  padding-right: 12px !important;
}

:deep(.invisible-background .pointer-events-none) {
  color: white !important;
}

/* --- FOOTER : CREATEUR & PARTICIPATION --- */
.card-footer-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.85rem;
}

.card-footer-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-participate {
  padding: 0 20px;
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

/* --- RESPONSIVE --- */
@media (min-width: 768px) {
  .title {
    font-size: 1.5rem;
  }
  .card-content {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .card-image {
    min-height: 240px;
  }
  .btn-participate {
    padding: 0 10px;
  }
}
</style>
