import { useCreateAccountModal } from './useCreateAccountModal'

export const useConnexionModal = () => {
  const isOpen = useState('connexionModal.isOpen', () => false)

  const open = () => {
    isOpen.value = true
  }
  const close = () => {
    isOpen.value = false
  }

  const openCreateAccountModal = () => {
    close()
    useCreateAccountModal().open()
  }

  return { isOpen, open, close, openCreateAccountModal }
}
