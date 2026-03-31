<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

const { login, isAuthenticated } = useAuth()

const isOpen = defineModel({ type: Boolean, default: false })
const form = useTemplateRef('form')

const state = ref({
  email: '',
  password: ''
})

const error = ref<string>('')

const connexion = async () => {
  await login(state.value.email, state.value.password)
  if (isAuthenticated) {
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
