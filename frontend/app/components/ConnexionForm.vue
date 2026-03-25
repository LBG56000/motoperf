<script setup lang="ts">
import type { IUser } from '~/types/users'

const isOpen = defineModel({ isModalOpen: Boolean })

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

const connexion = async (event: SubmitEvent) => {
  if ((await userFinded()) && (await passwordTest())) {
    alert('Connexion réussie !')
  }

  state.value.email = ''
  state.value.password = ''
}
</script>

<template>
  <div>
    <UModal v-model:open="isOpen">
      <template #content>
        <div class="p-6">
          <h3>Se connecter</h3>
          <p>Nouveau sur ce site ?</p>
          <UForm
            :schema="schema"
            :state="state"
            class="space-y-4"
            @submit="connexion"
          >
            <UFormField label="Email" name="email">
              <UInput v-model="state.email" />
            </UFormField>

            <UFormField label="Mots de passe" name="password">
              <UInput v-model="state.password" type="password" />
            </UFormField>
            <UButton
              type="submit"
              label="Se connecter"
              class="rounded-full"
              @click="isOpen = false"
            />
          </UForm>
        </div>
      </template>
    </UModal>
  </div>
</template>
