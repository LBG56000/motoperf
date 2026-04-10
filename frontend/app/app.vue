<script setup>
import ConnexionForm from '@/components/ConnexionForm.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { useAuth } from '@/composables/useAuth'
import { useConnexionModal } from '@/composables/useConnexionModal'

const { fetchUser, isLoading } = useAuth()
onMounted(fetchUser)

const connexionModal = useConnexionModal()
</script>

<template>
  <div>
    <LoadingOverlay :is-loading="isLoading" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style></style>
