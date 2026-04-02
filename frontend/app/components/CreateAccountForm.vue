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

const handleSubmit = async () => {
  error.value = ''
  success.value = ''

  try {
    // Validation manuelle avant l'API call
    const errors = validate(state)
    if (errors.length > 0) {
      error.value = 'Veuillez corriger les erreurs du formulaire'
      return
    }

    // Ici vous ferez l'appel API pour mettre à jour le profil
    console.log('Profil mis à jour:', state)
    success.value = 'Profil mis à jour avec succès !'

    // Fermer la modal après succès
    setTimeout(() => {
      close()
    }, 2000)
  } catch (err) {
    error.value = 'Une erreur est survenue lors de la mise à jour du profil'
    console.error(err)
  }
}

const handleDelete = () => {
  if (
    confirm(
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'
    )
  ) {
    try {
      // Ici vous ferez l'appel API pour supprimer le compte
      console.log('Compte supprimé')
      close()
    } catch (err) {
      error.value = 'Une erreur est survenue lors de la suppression du compte'
      console.error(err)
    }
  }
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="modal-wrapper">
        <div class="content">
          <h1 class="title">S'inscrire</h1>

          <!-- Avatar Section -->
          <div class="avatar-section">
            <div class="avatar-placeholder">
              <UIcon name="i-lucide-user" />
            </div>
            <button class="insert-btn">Inséré +</button>
          </div>

          <UForm
            ref="form"
            :state="state"
            :validate="validate"
            class="form-container"
            @submit.prevent="handleSubmit"
          >
            <!-- Prénom -->
            <UFormField label="Prénom" name="prenom" required>
              <UInput
                v-model="state.prenom"
                placeholder="John"
                variant="none"
              />
            </UFormField>

            <!-- Nom -->
            <UFormField label="Nom" name="nom" required>
              <UInput v-model="state.nom" placeholder="Doe" variant="none" />
            </UFormField>

            <!-- Moto -->
            <UFormField label="Moto" name="moto" required>
              <UInput v-model="state.moto" placeholder="GSX-R" variant="none" />
            </UFormField>

            <!-- Niveau d'expérience -->
            <div class="experience-section">
              <label class="label">Je suis :</label>
              <div class="experience-buttons">
                <button
                  v-for="level in experienceLevels"
                  :key="level"
                  type="button"
                  :class="[
                    'experience-btn',
                    { active: state.experience === level }
                  ]"
                  @click="state.experience = level"
                >
                  {{ level }}
                </button>
              </div>
            </div>

            <!-- Motard depuis -->
            <UFormField
              label="Motard depuis (nombre d'années)"
              name="yearsExperience"
              required
            >
              <UInput
                v-model="state.yearsExperience"
                type="number"
                placeholder="12"
                variant="none"
              />
            </UFormField>

            <!-- E-Mail -->
            <UFormField label="E-Mail" name="email" required>
              <UInput
                v-model="state.email"
                type="email"
                placeholder="john.doe@gmail.com"
                variant="none"
              />
            </UFormField>

            <!-- Nouveau mot de passe -->
            <UFormField label="Nouveau mot de passe" name="password">
              <UInput
                v-model="state.password"
                type="password"
                placeholder="MonMotDePassword1234..."
                variant="none"
              />
            </UFormField>

            <!-- Confirmer mot de passe -->
            <UFormField
              label="Confirmer le nouveau mot de passe"
              name="confirmPassword"
            >
              <UInput
                v-model="state.confirmPassword"
                type="password"
                placeholder="MonMotDePassword1234..."
                variant="none"
              />
            </UFormField>

            <!-- Messages d'erreur/succès -->
            <p v-if="error" class="error-message">{{ error }}</p>
            <p v-if="success" class="success-message">{{ success }}</p>

            <!-- Boutons d'action -->
            <div class="button-group">
              <UButton
                label="Supprimer mon compte"
                color="gray"
                variant="solid"
                class="delete-btn"
                type="button"
                @click="handleDelete"
              />
              <UButton
                type="submit"
                label="Confirmer"
                color="red"
                variant="solid"
                class="confirm-btn"
              />
            </div>
          </UForm>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.modal-wrapper {
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  width: 100%;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border: 3px solid #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 3rem;
  color: #ef4444;
}

.insert-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
  padding: 0;

  &:hover {
    color: #374151;
  }
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.experience-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.experience-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.experience-btn {
  padding: 0.5rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 2rem;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    border-color: #9ca3af;
  }

  &.active {
    border-color: #ef4444;
    color: #ef4444;
    background: white;
  }
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  :deep(.delete-btn) {
    flex: 1;
    background-color: #000 !important;
    border-radius: 2rem;
  }

  :deep(.confirm-btn) {
    flex: 1;
    background-color: #ef4444 !important;
    border-radius: 2rem;
  }
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.success-message {
  color: #16a34a;
  font-size: 0.875rem;
  margin-top: 1rem;
}

:deep(.u-form-group) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

:deep(.u-form-label) {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

:deep(.u-input) {
  border: none;
  border-bottom: 1px solid #575757;
  padding: 0.75rem 0;
  border-radius: 0;

  &:focus {
    border-bottom-color: #ef4444;
    outline: none;
  }

  &::placeholder {
    color: #d1d5db;
  }
}
</style>
