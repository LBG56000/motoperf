<script setup lang="ts">
import type { FormError } from '@nuxt/ui'

import { useConnexionModal } from '~/composable/useConnexionModal'
import { useAuth } from '~/composable/useAuth'

const { login, isAuthenticated } = useAuth()
const { isOpen, close, openCreateAccountModal } = useConnexionModal()

const form = useTemplateRef('form')

const state = ref({
  email: '',
  password: ''
})
const error = ref('')

type Schema = typeof state.value

function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  if (!state.email)
    errors.push({ name: 'email', message: 'Le champ est requis' })
  if (!state.password)
    errors.push({ name: 'password', message: 'Le champ est requis' })
  return errors
}

const connexion = async () => {
  try {
    await login(state.value.email, state.value.password)
    if (isAuthenticated.value) {
      close()
      state.value.email = ''
      state.value.password = ''
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Erreur de connexion'
  }
}

const resetForm = () => {
  form.value?.clear()
  state.value.email = ''
  state.value.password = ''
  error.value = ''
}

watch(
  () => isOpen.value,
  (newVal) => {
    if (!newVal) {
      resetForm()
    }
  }
)
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="content">
        <h3>Se connecter</h3>

        <p>
          Déjà inscrit ?
          <span
            style="text-decoration: underline; cursor: pointer"
            @click="openCreateAccountModal"
            >Se connecter</span
          >
        </p>
        <UForm
          ref="form"
          :state="state"
          :validate="validate"
          class="space-y-4"
          @submit.prevent="connexion"
        >
          <UFormField label="E-mail" name="email" type="email" required>
            <UInput v-model="state.email" />
          </UFormField>

          <UFormField label="Mot de passe" name="password" required>
            <UInput v-model="state.password" type="password" />
          </UFormField>
          <UButton
            type="submit"
            label="Se connecter"
            class="rounded-full"
            style="width: 100%; justify-content: center; color: white"
          />
        </UForm>
        <p class="error-message">{{ error }}</p>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  margin: 5rem;
}

.error-message {
  color: red;
  font-size: 0.8em;
  margin: 1rem;
}
</style>
