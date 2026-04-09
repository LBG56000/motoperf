export const useConnexionModal = () => {
  const isOpen = useState('connexionModal.isOpen', () => false)

  const open = () => {
    isOpen.value = true
  }
  const close = () => {
    isOpen.value = false
  }

  return { isOpen, open, close }
}
