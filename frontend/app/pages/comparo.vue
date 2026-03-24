<script setup lang="ts">
import type { IMotorcycle } from '~/types/motorcycles'
import ResultatFieldNumber from '~/components/card/ResultatFieldNumber.vue'
import ResultatFieldImg from '~/components/card/ResultatFieldImg.vue'
import ResultatFieldSound from '~/components/card/ResultatFieldSound.vue'
import MotocyclesForm from '~/components/form/MotocyclesForm.vue'

definePageMeta({
  layout: 'frontend'
})

const apiBack = useRuntimeConfig().public.apiBase
const showResultat = ref(false)
const motorcycle1 = ref<IMotorcycle>()
const motorcycle2 = ref<IMotorcycle>()
const motorcycle1Id = ref<string>('')
const motorcycle2Id = ref<string>('')
const fieldCategories = {
  numbers: [
    'engine_size',
    'horsePower',
    'torque',
    'weight',
    'consumption',
    'acceleration',
    'speedMax',
    'year',
    'price'
  ],
  sound: 'soundLink',
  Image: 'imageUrl'
}
const resultatTemplate = useTemplateRef('resultat')

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
  console.log('Résultats créés :', {
    resultatNumber,
    resultatSound,
    resultatImg
  })
}

async function fetchMotocycles() {
  const data = await $fetch<{ motorcycles: IMotorcycle[] }>(
    `${apiBack}motorcycles`,
    {
      params: {
        filter: JSON.stringify({
          id: { $in: [motorcycle1Id.value, motorcycle2Id.value] }
        }),
        project: 'all'
      }
    }
  )
  motorcycle1.value = data.motorcycles.find((m) => m.id === motorcycle1Id.value)
  motorcycle2.value = data.motorcycles.find((m) => m.id === motorcycle2Id.value)

  createResultat()
  showResultat.value = true
  await nextTick()
  resultatTemplate.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="container-form">
    <div class="form-button">
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
      </div>
    </Transition>
  </div>
</template>

<style scoped>
h3 {
  text-align: center;
  margin: 20px;
}

.form-button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 3rem;
}

.container-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 100px;
  justify-content: center;
}

.form {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.resultat-section {
  scroll-margin-top: 100px;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from {
  opacity: 0;
}

.v-leave-to {
  opacity: 0;
}
</style>
