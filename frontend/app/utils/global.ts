export const scrollToMap = (id: string, offset = 100) => {
  const el = document.getElementById(id)
  if (el) {
    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}
