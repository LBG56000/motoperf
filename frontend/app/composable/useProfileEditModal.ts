export const useProfileEditModal = () => {
  const isOpen = useState('profileEditModal.isOpen', () => true)

  const open = () => {
    isOpen.value = true
  }
  const close = () => {
    isOpen.value = false
  }

  return { isOpen, open, close }
}
