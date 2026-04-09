<script setup>
import ConnexionForm from '@/components/ConnexionForm.vue'
import { useAuth } from '@/composables/useAuth'
import { useConnexionModal } from '@/composables/useConnexionModal'

const { fetchUser } = useAuth()
onMounted(fetchUser)

const connexionModal = useConnexionModal()
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style></style>
