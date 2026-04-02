<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import { ref, reactive } from 'vue'
import { useConnexionModal } from '~/composable/useConnexionModal'
import { useAuth } from '~/composable/useAuth'

const { login, isAuthenticated } = useAuth()
const { isOpen, close } = useConnexionModal()
const form = useTemplateRef('form')
const error = ref('')
const success = ref('')
const currentStep = ref(1)

const state = reactive({
  prenom: '',
  nom: '',
  moto: '',
  experience: 'Confirmé',
  yearsExperience: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const experienceLevels = ['Débutant', 'Confirmé', 'Expert', 'Autre']

type Schema = typeof state

const isValidEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const validate = (state: Partial<Schema>): FormError[] => {
  const errors = []
  if (!state.prenom)
    errors.push({ path: 'prenom', message: 'Le prénom est requis' })
  if (!state.nom) errors.push({ path: 'nom', message: 'Le nom est requis' })
  if (!state.moto)
    errors.push({ path: 'moto', message: 'Le modèle de moto est requis' })
  if (!state.email)
    errors.push({ path: 'email', message: "L'email est requis" })
  if (state.email && !isValidEmail(state.email))
    errors.push({ path: 'email', message: "L'email n'est pas valide" })
  if (
    state.password &&
    state.confirmPassword &&
    state.password !== state.confirmPassword
  )
    errors.push({
      path: 'confirmPassword',
      message: 'Les mots de passe ne correspondent pas'
    })
  return errors
}

const nextStep = () => {
  error.value = ''
  currentStep.value++
}

const prevStep = () => {
  error.value = ''
  currentStep.value--
}

const handleSubmit = async () => {
  error.value = ''
  success.value = ''
  try {
    const errors = validate(state)
    if (errors.length > 0) {
      error.value = 'Veuillez corriger les erreurs du formulaire'
      return
    }
    console.log('Profil mis à jour:', state)
    success.value = 'Profil mis à jour avec succès !'
    setTimeout(() => {
      close()
      currentStep.value = 1
    }, 2000)
  } catch (err) {
    error.value = 'Une erreur est survenue lors de la mise à jour du profil'
    console.error(err)
  }
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="content">
        <h3>S'inscrire</h3>

        <!-- Indicateur de progression -->
        <div class="progress-indicator">
          <div class="progress-dot" :class="{ active: currentStep >= 1 }" />
          <div class="progress-dot" :class="{ active: currentStep >= 2 }" />
          <div class="progress-dot" :class="{ active: currentStep >= 3 }" />
        </div>

        <UForm
          ref="form"
          :state="state"
          :validate="validate"
          class="form-container"
          @submit.prevent="handleSubmit"
        >
          <!-- ÉTAPE 1 -->
          <div v-show="currentStep === 1" class="form-step">
            <div class="step-content">
              <button type="button" class="avatar-button">
                <div class="avatar-circle">
                  <UIcon name="i-lucide-user" />
                </div>
                Insérer +
              </button>
              <UFormField label="Prénom" name="prenom" required>
                <UInput
                  v-model="state.prenom"
                  placeholder="Jean"
                  variant="soft"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Nom" name="nom" required>
                <UInput
                  v-model="state.nom"
                  placeholder="Bihan"
                  variant="soft"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <!-- ÉTAPE 2 -->
          <div v-show="currentStep === 2" class="form-step">
            <div class="step-content">
              <div class="experience-section">
                <label class="experience-label">Je suis :</label>
                <div class="experience-buttons">
                  <button
                    v-for="level in experienceLevels"
                    :key="level"
                    type="button"
                    class="experience-button"
                    :class="{ active: state.experience === level }"
                    @click="state.experience = level"
                  >
                    {{ level }}
                  </button>
                </div>
              </div>
              <UFormField label="Moto" name="moto" required>
                <UInput
                  v-model="state.moto"
                  placeholder="GSX-R"
                  variant="soft"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Motard depuis (années)"
                name="yearsExperience"
                required
              >
                <UInput
                  v-model="state.yearsExperience"
                  type="number"
                  placeholder="12"
                  variant="soft"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <!-- ÉTAPE 3 -->
          <div v-show="currentStep === 3" class="form-step">
            <div class="step-content">
              <UFormField label="E-Mail" name="email" required>
                <UInput
                  v-model="state.email"
                  type="email"
                  placeholder="john.doe@gmail.com"
                  variant="soft"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Mot de passe" name="password">
                <UInput
                  v-model="state.password"
                  type="password"
                  placeholder="Mot de passe ..."
                  variant="soft"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Confirmer le mot de passe"
                name="confirmPassword"
              >
                <UInput
                  v-model="state.confirmPassword"
                  type="password"
                  placeholder="Confirmation mot de passe ..."
                  variant="soft"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <!-- Messages -->
          <p v-if="error" class="error-message">{{ error }}</p>
          <p v-if="success" class="success-message">{{ success }}</p>

          <!-- Boutons de navigation -->
          <div class="button-group">
            <UButton
              v-if="currentStep > 1"
              type="button"
              label="Retour"
              variant="soft"
              color="neutral"
              class="w-1/2"
              @click="prevStep"
            />
            <UButton
              v-if="currentStep < 3"
              type="button"
              label="Suivant"
              color="neutral"
              class="w-1/2 ml-auto"
              @click="nextStep"
            />
            <UButton
              v-if="currentStep === 3"
              type="submit"
              label="Confirmer"
              color="neutral"
              class="font-bold w-1/2 ml-auto"
            />
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.content {
  height: 60vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.progress-indicator {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 32px;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #d1d5db;
  transition: background-color 0.2s ease;
}

.progress-dot.active {
  background-color: #ef4444;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

.form-step {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.avatar-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #4b5563;
  font-size: 0.875rem;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.avatar-button:hover {
  color: #1f2937;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
  color: #ef4444;
}

.experience-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.experience-label {
  font-size: 0.875rem;
  font-weight: 500;
  display: block;
}

.experience-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.experience-button {
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 0.875rem;
  border: 2px solid #d1d5db;
  background-color: transparent;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.experience-button:hover {
  border-color: #9ca3af;
}

.experience-button.active {
  border-color: #ef4444;
  color: #ef4444;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
}

.success-message {
  color: #16a34a;
  font-size: 0.875rem;
}

.button-group {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  margin-top: auto;
}
</style>
