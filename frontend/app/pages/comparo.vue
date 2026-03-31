<script setup lang="ts">
import type { IMotorcycle } from '~/types/motorcycles'
import ResultatFieldNumber from '~/components/card/ResultatFieldNumber.vue'
import ResultatFieldImg from '~/components/card/ResultatFieldImg.vue'
import ResultatFieldSound from '~/components/card/ResultatFieldSound.vue'
import MotocyclesForm from '~/components/form/MotocyclesForm.vue'
import CarrouselMotorcycles from '~/components/CarrouselMotorcycles.vue'
import Comment from '~/components/forum/Comment.vue'
import type { IMessage } from '~/types/messages'

interface ICommentInput {
  motorcycleId: string
  motorcycleName: string
  brand: string
  content: string
  user: string // TODO: update quand l'auth sera en place
}

const apiBase = useRuntimeConfig().public.apiBase
const showResultat = ref(false)
const motorcycle1 = ref<IMotorcycle>()
const motorcycle2 = ref<IMotorcycle>()
const motorcycle1Id = ref<string>('')
const motorcycle2Id = ref<string>('')
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
  Image: 'imageUrl'
}
const resultatTemplate = useTemplateRef('resultat')
const carousselBeginnerBikes = ref<IMotorcycle[]>([])
const carousselSportBikes = ref<IMotorcycle[]>([])
const carousselAdventureBikes = ref<IMotorcycle[]>([])
const isConnected = ref<boolean>(true) // Simule l'état de connexion de l'utilisateur
const messagePosted = ref<boolean>(false)
const optionMotorcycles = computed(() => {
  if (!motorcycle1.value || !motorcycle2.value) return []
  return [
    { label: motorcycle1.value.name, value: motorcycle1.value._id },
    { label: motorcycle2.value.name, value: motorcycle2.value._id }
  ]
})
const comment = ref<ICommentInput>({
  motorcycleId: '',
  motorcycleName: '',
  brand: '',
  content: '',
  user: '69cbe6342e0cabab3167824a' // TODO: update quand l'auth sera en place
})
// Tableau pour chaque Categories
const resultatNumber = reactive<
  {
    fieldName: string
    firstValue: number
    secondValue: number
  }[]
>([])
const resultatSound = reactive<
  {
    fieldName: string
    firstValue: string
    secondValue: string
  }[]
>([])
const resultatImg = reactive<
  {
    fieldName: string
    firstValue: string
    secondValue: string
  }[]
>([])
const commentsMotorcycle1 = ref<IMessage[]>([])
const commentsMotorcycle2 = ref<IMessage[]>([])

function createResultat() {
  resultatNumber.length = 0
  resultatSound.length = 0
  resultatImg.length = 0
  if (motorcycle1.value && motorcycle2.value) {
    const allKeys = new Set([
      ...Object.keys(motorcycle1.value),
      ...Object.keys(motorcycle2.value)
    ])
    for (const key of allKeys) {
      const fieldName = key as keyof IMotorcycle
      if (fieldCategories.numbers.includes(fieldName)) {
        resultatNumber.push({
          fieldName,
          firstValue: Number(motorcycle1.value[fieldName] ?? 0),
          secondValue: Number(motorcycle2.value[fieldName] ?? 0)
        })
      } else if (fieldCategories.sound === fieldName) {
        resultatSound.push({
          fieldName,
          firstValue: String(motorcycle1.value[fieldName] ?? ''),
          secondValue: String(motorcycle2.value[fieldName] ?? '')
        })
      } else if (fieldCategories.Image === fieldName) {
        resultatImg.push({
          fieldName,
          firstValue: String(motorcycle1.value[fieldName] ?? ''),
          secondValue: String(motorcycle2.value[fieldName] ?? '')
        })
      }
    }
  }
  fetchMessages()
}

async function fetchMotocycles() {
  const data = await $fetch<{ motorcycles: IMotorcycle[] }>(
    `${apiBase}motorcycles`,
    {
      params: {
        filter: JSON.stringify({
          _id: { $in: [motorcycle1Id.value, motorcycle2Id.value] }
        }),
        project: 'all'
      }
    }
  )
  motorcycle1.value = data.motorcycles.find(
    (m) => m._id === motorcycle1Id.value
  )
  motorcycle2.value = data.motorcycles.find(
    (m) => m._id === motorcycle2Id.value
  )

  createResultat()
  showResultat.value = true
  await nextTick()
  resultatTemplate.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function fetchCarrouselMotorcycles() {
  const project = 'name,horsePower,torque,price'
  const limit = 10
  // SportsBikes for Carrousel
  const sportBikesData = await $fetch<{ motorcycles: IMotorcycle[] }>(
    `${apiBase}motorcycles`,
    {
      params: {
        filter: JSON.stringify({
          category: 'sportsbike'
        }),
        project,
        limit
      }
    }
  )
  // Beginners Bikes for Carrousel
  const beginnerBikesData = await $fetch<{ motorcycles: IMotorcycle[] }>(
    `${apiBase}motorcycles`,
    {
      params: {
        filter: JSON.stringify({
          isAvailableA2: true
        }),
        project,
        limit
      }
    }
  )
  // Adventure Bikes for Carrousel
  const adventureBikesData = await $fetch<{ motorcycles: IMotorcycle[] }>(
    `${apiBase}motorcycles`,
    {
      params: {
        filter: JSON.stringify({
          category: 'adventure'
        }),
        project,
        limit
      }
    }
  )
  carousselSportBikes.value = sportBikesData.motorcycles
  carousselBeginnerBikes.value = beginnerBikesData.motorcycles
  carousselAdventureBikes.value = adventureBikesData.motorcycles
}

async function fetchMessages() {
  const post1 = motorcycle1.value?.post
  const post2 = motorcycle2.value?.post

  if (post1) {
    const data = await $fetch<{ messages: IMessage[] }>(
      `${apiBase}posts/${post1}/responses`,
      {
        params: {
          project: 'content, user, createdAt',
          deep: true,
          limit: 5,
        }
      }
    )
    commentsMotorcycle1.value = data.messages
  }

  if (post2) {
    const data = await $fetch<{ messages: IMessage[] }>(
      `${apiBase}posts/${post2}/responses`,
      {
        params: {
          project: 'content, user, createdAt',
          deep: true,
          limit: 5
        }
      }
    )
    commentsMotorcycle2.value = data.messages
  }
}

async function postComment() {
  if (!comment.value.content || !comment.value.motorcycleId) return

  const selectedMotorcycle =
    motorcycle1.value?._id === comment.value.motorcycleId
      ? motorcycle1.value
      : motorcycle2.value
  if (!selectedMotorcycle) return

  let postId = selectedMotorcycle.post

  if (!postId) {
    try {
      const newPost = await $fetch<{ _id: string }>(`${apiBase}posts`, {
        method: 'POST',
        body: {
          title: selectedMotorcycle.name,
          brand: selectedMotorcycle.brand._id,
          category: 'Modèle',
          user: comment.value.user,
          content: `Discussion autour de la ${selectedMotorcycle.brand.name} ${selectedMotorcycle.name}`
        }
      })

      postId = newPost._id
      await $fetch(`${apiBase}motorcycles/${selectedMotorcycle._id}`, {
        method: 'PUT',
        body: {
          post: postId
        }
      })

      selectedMotorcycle.post = postId
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

  fetchMessages()
}

onMounted(() => {
  fetchCarrouselMotorcycles()
})
</script>

<template>
  <div>
    <HeaderInfo :scroll-to-element-id="'form'">
      <template #title>
        <h1>
          Comparez. Choisissez. <br />
          <span class="text-red">Pilotez</span>
        </h1>
      </template>
      <template #subtitle>
        <p>
          Comparez facilement les performances, prix et caractéristiques de vos
          motos préférées.
        </p>
      </template>
    </HeaderInfo>
    <div class="container-form">
      <div id="form" class="form-button">
        <div class="form">
          <MotocyclesForm v-model="motorcycle1Id" form-title="Moto 1" />
          <MotocyclesForm v-model="motorcycle2Id" form-title="Moto 2" />
        </div>
        <UButton
          icon="i-lucide-arrow-left-right"
          class="w-fit rounded-4xl"
          :disabled="!motorcycle1Id || !motorcycle2Id"
          @click="fetchMotocycles"
          >Comparo</UButton
        >
      </div>
      <Transition>
        <div v-if="showResultat" ref="resultat" class="resultat-section">
          <div v-if="resultatNumber.length > 0" class="info-container">
            <h3>Résultats</h3>
            <div v-for="field in resultatNumber" :key="field.fieldName">
              <ResultatFieldNumber
                :field-name="field.fieldName"
                :first-value="field.firstValue"
                :second-value="field.secondValue"
              />
              <br />
            </div>
          </div>
          <div v-if="resultatImg.length > 0">
            <h3>Images</h3>
            <div v-for="field in resultatImg" :key="field.fieldName">
              <ResultatFieldImg
                :field-name="field.fieldName"
                :first-value="field.firstValue"
                :second-value="field.secondValue"
              />
            </div>
          </div>
          <div v-if="resultatSound.length > 0">
            <h3>Sons</h3>
            <div v-for="field in resultatSound" :key="field.fieldName">
              <ResultatFieldSound
                :field-name="field.fieldName"
                :first-value="field.firstValue"
                :second-value="field.secondValue"
              />
            </div>
          </div>
          <div class="display-comment-container">
            <div class="left-display-comment">
              <h4>Commentaires sur la {{ motorcycle1?.name }}</h4>
              <Comment
                v-if="commentsMotorcycle1.length > 0"
                :responses="commentsMotorcycle1"
              />
              <p v-else>Postez le premier commentaire !</p>
            </div>
            <div class="right-display-comment">
              <h4>Commentaires sur la {{ motorcycle2?.name }}</h4>
              <Comment
                v-if="commentsMotorcycle2.length > 0"
                :responses="commentsMotorcycle2"
              />
              <p v-else>Postez le premier commentaire !</p>
            </div>
          </div>
          <div class="input-comment-box">
            <div v-if="!isConnected" class="need-connection">
              <h3>
                Rejoignez la communauté pour débattre et partager vos avis sur
                ces motos !
              </h3>
              <UButton
                color="neutral"
                class="rounded-4xl self-end text-xs p-2"
                size="xl"
                >Se connecter</UButton
              >
            </div>
            <div
              v-if="!messagePosted"
              class="input-comment-container"
              :class="{ blurred: !isConnected }"
            >
              <h4>
                Déjà roulé une de ces motos ?<br />
                Faite le savoir à la communauté !
              </h4>
              <div class="comment-input">
                <USelect
                  v-model="comment.motorcycleId"
                  size="lg"
                  class="w-50"
                  :items="optionMotorcycles"
                  :placeholder="motorcycle1?.name"
                />
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
            <div v-else class="input-posted-container">
              <h4>Merci pour votre contribution !</h4>
              <p>
                Votre commentaire a été posté avec succès. Il apparaîtra dans la
                section des commentaires correspondante.
              </p>
            </div>
          </div>
        </div>
      </Transition>
      <div class="caroussel-container">
        <div>
          <h3>Pour la performance</h3>
          <CarrouselMotorcycles :items="carousselSportBikes" />
        </div>
        <div>
          <h3>Pour le A2</h3>
          <CarrouselMotorcycles :items="carousselBeginnerBikes" />
        </div>
        <div>
          <h3>Pour l'aventure</h3>
          <CarrouselMotorcycles :items="carousselAdventureBikes" />
        </div>
      </div>
      <br />
    </div>
  </div>
</template>

<style scoped>
/* Layout principal */
.container-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 6rem;
  justify-content: center;
}

.container-form h3 {
  text-align: center;
  margin: 1.25rem;
}

/* Formulaire */
.form-button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 3rem;
}

.form {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

/* Résultats */
.resultat-section {
  scroll-margin-top: 6rem;
}

/* Carrousel */
.caroussel-container {
  display: flex;
  flex-direction: column;
  gap: 5rem;
  margin: 0 10%;
}

.caroussel-container h3 {
  text-align: left;
}

/* Commentaires Display */
.display-comment-container {
  display: flex;
  gap: 2rem;
  margin: 3rem 10%;
  justify-content: center;
}

.left-display-comment,
.right-display-comment {
  flex: 1;
  border: 1px solid #c0c0c0;
  border-radius: 1.25rem;
  padding: 2rem;
  max-width: 50%;
  height: fit-content;
}

.left-display-comment h4,
.right-display-comment h4 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.left-display-comment p,
.right-display-comment p {
  text-align: center;
}

/* Commentaires Input */
.input-comment-box {
  position: relative;
  margin: 3rem 25%;
  width: 50%;
  min-height: 25rem;
  border: 1px solid #757575;
  border-radius: 1.25rem;
}

.input-comment-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  min-height: 25rem;
  padding: 2rem;
}

.input-comment-container h4 {
  text-align: center;
}

.input-posted-container{
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: fit-content;
  min-height: 25rem;
  padding: 2rem;
  gap: 30px;
}

.input-posted-container h4 {
  text-align: center;
}

.input-posted-container p {
  text-align: center;
}

.comment-input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.need-connection {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  text-align: center;
}

.need-connection h3 {
  width: 400px;
}

.blurred {
  filter: blur(3px);
  pointer-events: none;
  user-select: none;
}

/* Utilitaires */
.text-red {
  color: red;
}

/* Transitions */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
