export const useCreateAccountModal = () => {
  const isOpen = useState('CreateAccountModal.isOpen', () => false)

  const open = () => {
    isOpen.value = true
  }
  const close = () => {
    isOpen.value = false
  }

  return { isOpen, open, close }
}
