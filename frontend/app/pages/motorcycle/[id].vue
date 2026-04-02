<script setup lang="ts">
import { onMounted, ref, computed, watch, nextTick } from 'vue'
import type { IMotorcycle } from '~/types/motorcycles'
import CountUp from 'vue-countup-v3'
import type { IMessage } from '~/types/messages'
import Comment from '~/components/forum/Comment.vue'

interface ICommentInput {
  motorcycleId: string
  motorcycleName: string
  brand: string
  content: string
  user: string // TODO: update quand l'auth sera en place
}

const route = useRoute()
const id = route.params.id as string
const apiBase = useRuntimeConfig().public.apiBase
const m = ref<IMotorcycle | null>(null)
const commentsMotorcycle = ref<IMessage[]>([])
const comment = ref<ICommentInput>({
  motorcycleId: '',
  motorcycleName: '',
  brand: '',
  content: '',
  user: '69cbe6342e0cabab3167824a' // TODO: update quand l'auth sera en place
})
const messagePosted = ref<boolean>(false)
const isConnected = ref<boolean>(true) // Simule l'état de connexion de l'utilisateur

const statsRef = ref<HTMLElement | null>(null)
const countStarted = ref(false)

const fieldCategories = {
  numbers: [
    'year',
    'engine_size',
    'horsePower',
    'torque',
    'weight',
    'consumption',
    'acceleration',
    'speedMax',
    'price'
  ],
  sound: 'soundLink',
  image: 'imageUrl'
}

const fieldLabels: Record<string, string> = {
  year: 'Année',
  engine_size: 'Cylindrée (cc)',
  horsePower: 'Puissance (ch)',
  torque: 'Couple (Nm)',
  weight: 'Poids (kg)',
  consumption: 'Consommation (L/100km)',
  acceleration: 'Accélération (0-100)',
  speedMax: 'Vitesse max (km/h)',
  price: 'Prix (€)'
}

const statsNumbers = computed(() => {
  if (!m.value) return []
  return fieldCategories.numbers
    .filter((key) => m.value![key as keyof IMotorcycle] !== undefined)
    .map((key) => ({
      label: fieldLabels[key] ?? key,
      value: m.value![key as keyof IMotorcycle]
    }))
})

async function fetchData() {
  const data = await $fetch<{ motorcycles: IMotorcycle[] }>(
    `${apiBase}motorcycles`,
    {
      params: {
        filter: JSON.stringify({ _id: id }),
        project: 'all'
      }
    }
  )
  m.value = data.motorcycles?.[0] ?? null
  console.log('Motorcycle data:', m.value)
}

async function fetchMessages() {
  const post1 = m.value?.post
  if (post1) {
    const data = await $fetch<{ messages: IMessage[] }>(
      `${apiBase}posts/${post1}/responses`,
      {
        params: {
          project: 'content, user, createdAt',
          deep: true,
          limit: 5
        }
      }
    )
    commentsMotorcycle.value = data.messages
  }
}

async function postComment() {
  if (!comment.value.content || !comment.value.motorcycleId) return

  let postId = m.value?.post
  if (!postId) {
    try {
      const newPost = await $fetch<{ _id: string }>(`${apiBase}posts`, {
        method: 'POST',
        body: {
          title: m.value?.name,
          brand: m.value?.brand._id,
          category: 'Modèle',
          user: comment.value.user,
          content: `Discussion autour de la ${m.value?.brand.name} ${m.value?.name}`
        }
      })

      postId = newPost._id
      await $fetch(`${apiBase}motorcycles/${m.value?._id}`, {
        method: 'PUT',
        body: {
          post: postId
        }
      })

      m.value.post = postId
    } catch (error) {
      console.error('Error creating post:', error)
      return
    }
  }

  try {
    await $fetch(`${apiBase}messages`, {
      method: 'POST',
      body: {
        content: comment.value.content,
        user: comment.value.user,
        reference: postId,
        referenceModel: 'Post'
      }
    })
    messagePosted.value = true
  } catch (error) {
    console.error('Error posting comment:', error)
  }
  await fetchMessages()
}

onMounted(async () => {
  await fetchData()
  await fetchMessages()
})

watch(
  m,
  async () => {
    await nextTick()

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          countStarted.value = true
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (statsRef.value) observer.observe(statsRef.value)
  },
  { once: true }
)
</script>

<template>
  <div v-if="m" class="main-content">
    <h1 class="title">{{ m.name }}</h1>
    <img
      :src="m.imageUrl"
      :alt="`Image de la moto ${m.name}`"
      class="motorcycle-image"
    />

    <div class="detail">
      <p><span>Modèle:</span> {{ m.brand.name }} {{ m.name }}</p>
      <p><span>Année:</span> {{ m.year }}</p>
      <p><span>Moteur:</span> {{ m.engine_size }} m3</p>
    </div>

    <div ref="statsRef" class="stats-section">
      <h3>Caractéristiques</h3>
      <div class="stats-grid">
        <div v-for="stat in statsNumbers" :key="stat.label" class="stat-card">
          <span class="stat-label">{{ stat.label }}</span>
          <CountUp
            :key="countStarted ? stat.label : ''"
            class="stat-value"
            :end-val="Number(stat.value)"
            :duration="2"
            :options="{ useEasing: true, separator: ' ' }"
            :autoplay="true"
          />
        </div>
      </div>
    </div>

    <div class="sound-section">
      <AudioPlayer v-if="m.soundLink" :src="m.soundLink" />
      <p v-else>Pas d'audio</p>
    </div>

    <div
      v-if="!messagePosted"
      class="input-comment-container"
      :class="{ blurred: !isConnected }"
    >
      <h4>
        Déjà roulé sur cette moto ?<br />
        Faite le savoir à la communauté !
      </h4>
      <div class="comment-input">
        <UTextarea
          v-model="comment.content"
          size="xl"
          placeholder="Un retour d'expérience, un conseil d'entretient ou encore une question"
        />
      </div>
      <UButton
        class="rounded-4xl self-end text-xs m-1"
        size="xl"
        @click="postComment"
        >Poster</UButton
      >
    </div>
    <div v-if="commentsMotorcycle.length > 0" class="display-comment">
      <Comment :responses="commentsMotorcycle" />
    </div>
  </div>
</template>

<style scoped>
.title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2em;
}
.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2em;
  padding-bottom: 4em;
}
.detail {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  border: black solid 1px;
  border-radius: 5px;
  padding: 1em;
  width: 50%;
}
span {
  font-weight: bold;
}
.stats-section {
  width: 60%;
}
.stats-section h3 {
  text-align: center;
  margin-bottom: 1em;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1em;
}
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1em;
  border: 1px solid #c0c0c0;
  border-radius: 8px;
  gap: 0.5em;
}
.stat-label {
  font-size: 0.85em;
  color: #666;
  text-align: center;
}
.stat-value {
  font-size: 1.4em;
  font-weight: bold;
}
.sound-section {
  margin-top: 2em;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
}

.motorcycle-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.display-comment {
  flex: 1;
  border: 1px solid #c0c0c0;
  border-radius: 1.25rem;
  padding: 2rem;
  max-width: 50%;
  height: fit-content;
}
</style>
