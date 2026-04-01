<script setup lang="ts">
import * as v from 'valibot'
import { useAuth } from '~/composable/useAuth';
import type { IBrand } from '~/types/brand';
import type { ICategory } from '~/types/category';

const props = defineProps({
  isNewPost: Boolean,
})

const categories = ref<ICategory[]>([])
const brands = ref<IBrand[]>([])

const toast = useToast()
const emit = defineEmits<{ close: [boolean] }>()

const { user, isAuthenticated } = useAuth()

const getCategories = async () => {
  const res = await $fetch<{ categories: ICategory[] }>(
    `${useRuntimeConfig().public.apiBase}categories`, {
    params: {
      project: 'name,_id'
    }
  })
  categories.value = res.categories
}

const getBrands = async () => {
  const res = await $fetch<{ brands: IBrand[] }>(
    `${useRuntimeConfig().public.apiBase}brand`, {
    params: {
      project: 'name,_id'
    }
  })
  brands.value = res.brands
}

const schema = v.object({
  title: v.pipe(v.string(), v.minLength(1, 'Le titre est requis')),
  category: v.pipe(v.string(), v.minLength(1, 'La catégorie est requise')),
  brand: v.pipe(v.string(), v.minLength(1, 'La marque est requise')),
  description: v.pipe(v.string(), v.minLength(1, 'La description est requise')),
  file: v.pipe(v.instance(File, 'Image requise'), v.mimeType(['image/jpeg', 'image/png'], 'Format invalide'))
})

const state = reactive({
  title: '',
  category: '',
  brand: '',
  description: '',
  file: undefined as File | undefined
})

const uploadImage = async (file: File, name: string): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', 'image')
  formData.append('directory', 'posts')
  formData.append('name', name)

  const res = await $fetch<{ url: string }>('/api/uploadFile', {
    method: 'POST',
    body: formData
  })
  return res.url
}

const onSubmit = async () => {
  try {
    let url = ''
    if (state.file) {
      url = await uploadImage(state.file, Date.now().toString())
    }

    // Constrcution et envoi de la requête
    const payload = {
      brand: state.brand,
      title: state.title,
      category: state.category,
      content: state.description,
      url: url,
      user: user.value?._id
    }

    const response = await $fetch.raw(`${useRuntimeConfig().public.apiBase}posts`, {
      method: 'POST',
      body: payload
    })

    if (response.status === 201) {
      toast.add({ title: 'Succès', description: 'Votre post a été ajouté.', color: 'success' })
      resetForm()
      emit('close', true)
    }
  } catch {
    toast.add({ title: 'Erreur', description: 'Votre post n\' pas pu être ajouté', color: 'error' })
  }
}

const resetForm = () => {
  state.brand = ''
  state.title = ''
  state.category = ''
  state.description = ''
  state.file = undefined as File | undefined
}

onMounted(async () => {
  await Promise.all([
    getCategories(), getBrands()
  ])
})
</script>

<template>
  <div>
    <UModal :close="{ onClick: () => emit('close', false) }">
      <UButton icon="i-lucide-plus" size="sm" color="primary" variant="solid" />
      <template #header>
        <div>
          <h3>Ajouter un post</h3>
        </div>
      </template>
      <template #body>
        <div>
          <UForm :schema :state="state" @submit="onSubmit">
            <UFormField label="Titre du post" required name="title">
              <UInput v-model="state.title" placeholder="Titre du post" />
            </UFormField>
            <UFormField label="Catégorie" required name="category">
              <USelectMenu v-model="state.category" placeholder="Sélectionnez la catégorie du post" :items="categories"
                value-key="name" label-key="name" :search-input="{
                  placeholder: 'Rechercher',
                  icon: 'i-lucide-search'
                }">
                <template #empty>
                  <span class="text-gray-500 text-sm p-2">
                    Aucune catégorie trouvée
                  </span>
                </template>
              </USelectMenu>
            </UFormField>
            <UFormField label="Marques" required name="brand">
              <USelectMenu v-model="state.brand" placeholder="Sélectionnez la marque du post" :items="brands"
                value-key="_id" label-key="name" :search-input="{
                  placeholder: 'Rechercher',
                  icon: 'i-lucide-search'
                }">
                <template #empty>
                  <span class="text-gray-500 text-sm p-2">
                    Aucune marque trouvée
                  </span>
                </template>
              </USelectMenu>
            </UFormField>
            <UFormField label="Description" required name="description">
              <UTextarea v-model="state.description" placeholder="Ecrivez votre description" />
            </UFormField>
            <UFormField required label="Image associé à mon post" name="file">
              <!-- TODO: a faire avec une vraie image -->
              <UFileUpload v-model="state.file" accept="image/*" label="Déposez votre image" description="PNG ou JPG" />
            </UFormField>
            <div class="flex gap-2 mt-8">
              <UButton type="submit" @click="emit('close', true)">
                Valider
              </UButton>

              <UButton variant="outline">
                Réinitialiser
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>
  </div>
</template>
<style scoped></style>