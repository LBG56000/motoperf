import { useProfileModal } from '~/composables/useProfileModal'

export const useProfileEditModal = () => {
  const isOpen = useState('profileEditModal.isOpen', () => false)

  const open = () => {
    useProfileModal().close()
    isOpen.value = true
  }
  const close = () => {
    isOpen.value = false
  }

  return { isOpen, open, close }
}
