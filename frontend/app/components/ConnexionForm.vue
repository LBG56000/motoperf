<script setup lang="ts">
import type { FormError, FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import type { IUser } from '~/types/users'

const isOpen = defineModel({ isModalOpen: Boolean })
const form = useTemplateRef('form')

const schema = {
  email: 'Invalid email',
  password: () => 'Must be at least 8 characters'
}

type Schema = typeof state

function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  if (!state.email)
    errors.push({ name: 'email', message: 'Le champ est requis' })
  if (!state.password)
    errors.push({ name: 'password', message: 'Le champ est requis' })
  return errors
}

const state = ref({
  email: '',
  password: ''
})

const apiBack = useRuntimeConfig().public.apiback

async function userFinded<Boolean>() {
  const data = await $fetch<{ user: IUser }>(`${apiBack}users`, {
    params: {
      filter: JSON.stringify({
        email: state.value.email
      }),
      project: 'email'
    }
  })
  return data.users[0] !== undefined
}

async function passwordTest<Boolean>() {
  const data = await $fetch<{ user: IUser }>(`${apiBack}users`, {
    params: {
      filter: JSON.stringify({
        email: state.value.email
      }),
      project: 'password'
    }
  })
  return data.users[0].password === state.value.password
}

const connexion = async (event: FormSubmitEvent) => {
  if (!(await userFinded())) {
    form.value?.setErrors([{ name: 'email', message: 'Email introuvable' }])
    return
  }
  if (!(await passwordTest())) {
    form.value?.setErrors([
      { name: 'password', message: 'Mot de passe incorrect' }
    ])
    return
  }

  alert('Connexion réussie !')
  isOpen.value = false
  state.value.email = ''
  state.value.password = ''
}
</script>

<template>
  <UModal
    :ui="{ overlay: { background: '--background-secondary' } }"
    v-model:open="isOpen"
  >
    <template #content>
      <div class="content">
        <h3>Se connecter</h3>
        <UForm
          ref="form"
          :validate="validate"
          :state="state"
          class="space-y-4"
          @submit="connexion"
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
</style>
