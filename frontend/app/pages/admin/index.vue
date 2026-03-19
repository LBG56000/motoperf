<script setup lang="ts">
import type { IUser } from '~/types/users'
import CardStats from '~/components/admin/CardStats.vue'
import Header from '~/components/admin/Header.vue'

interface Stat {
  title: string
  value: number
}

const userName: string = 'Admin'
const apiBack = useRuntimeConfig().public.apiback
const stats = ref<Stat[]>([])

async function fetchStats() {
  try {
    const totalUsers = await $fetch<number>(`${apiBack}users/count`)
    const totalBikes = await $fetch<number>(`${apiBack}motorcycles/count`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const res = await $fetch<{ users: IUser[] }>(
      `${apiBack}users?filter=${JSON.stringify({ createdAt: { $gte: today } })}`
    )
    const newUsers = res.users
    stats.value.push({
      title: 'Utilisateurs',
      value: totalUsers ?? 0
    })
    stats.value.push({
      title: 'Motos',
      value: totalBikes ?? 0
    })
    stats.value.push({
      title: "Nouveaux utilisateurs aujourd'hui",
      value: newUsers.length ?? 0
    })
    console.log('Fetched stats:', stats.value)
  } catch (error) {
    console.log('Failed to fetch stats:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <NuxtLayout name="admin">
    <Header />
    <hr />
    <main>
      <h3>Bienvenue {{ userName }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CardStats
          v-for="stat in stats"
          :key="stat.title"
          :title="stat.title"
          :value="stat.value"
        />
      </div>
    </main>
  </NuxtLayout>
</template>

<style scoped>
h3 {
  text-align: center;
  margin: 20px;
}

main {
  margin: 100px 20px;
}
</style>
