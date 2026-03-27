<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

const isOpen = defineModel({ isModalOpen: Boolean })
const form = useTemplateRef('form')

const state = ref({
  email: '',
  password: ''
})

type Schema = typeof state

function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  return errors
}

const apiBase = useRuntimeConfig().public.apiBase
const error = ref<string>('')

async function userFinded() {
  try {
    await $fetch(`${apiBase}auth`, {
      method: 'POST',
      body: {
        email: state.value.email,
        password: state.value.password
      }
    })
    return true
  } catch (err: any) {
    error.value =
      err.data?.message || 'Une erreur est survenue lors de la connexion.'
    return false
  }
}

const connexion = async () => {
  if (await userFinded()) {
    alert('Connexion réussie !')
    isOpen.value = false
    state.value.email = ''
    state.value.password = ''
  }
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="content">
        <h3>Se connecter</h3>
        <UForm
          ref="form"
          :validate="validate"
          :state="state"
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
