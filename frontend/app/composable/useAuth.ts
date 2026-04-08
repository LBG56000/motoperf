import type { IUser } from '@/types/users'

const user = ref<IUser | null>(null)
const isAuthenticated = computed(() => !!user.value)

export function useAuth() {
  const apiBase = useRuntimeConfig().public.apiBase

  async function fetchUser(
    projects: string = 'email, pseudo, userType, image, firstname, lastname, ridingStartYear, moto, CreatedAt, UpdatedAt'
  ) {
    try {
      const data = await $fetch<{ users: IUser }>(`${apiBase}users/account`, {
        credentials: 'include',
        params: { project: projects }
      })
      user.value = data.users
    } catch {
      user.value = null
    }
  }

  async function register(
    email: string,
    password: string,
    firstname: string,
    lastname: string,
    pseudo: string,
    userType: string,
    ridingStartYear: string,
    image?: string
  ) {
    await $fetch(`${apiBase}users/account`, {
      method: 'POST',
      body: {
        email,
        password,
        firstname,
        lastname,
        pseudo,
        userType,
        ridingStartYear,
        image
      }
    })
    await login(email, password)
  }

  async function login(email: string, password: string) {
    await $fetch(`${apiBase}auth`, {
      method: 'POST',
      credentials: 'include',
      body: { email, password }
    })
    await fetchUser()
  }

  async function logout() {
    await $fetch(`${apiBase}auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    user.value = null
  }

  return {
    user: readonly(user),
    isAuthenticated,
    fetchUser,
    register,
    login,
    logout
  }
}
