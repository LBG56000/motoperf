<script setup>
import ConnexionForm from '@/components/ConnexionForm.vue'
import { useAuth } from '@/composable/useAuth'
import { useConnexionModal } from '@/composable/useConnexionModal'

const { fetchUser } = useAuth()
onMounted(fetchUser)

const connexionModal = useConnexionModal()
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ConnexionForm v-model="connexionModal.isOpen" />
</template>

<style></style>
