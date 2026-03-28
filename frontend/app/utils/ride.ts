import type { IRide } from '~/types/ride.js'
import { scrollToMap } from '~/utils/global'

export const getUniqueValues = (rides: IRide[], key: keyof IRide): string[] => {
  const values = rides.map((r) => r[key]?.toString()).filter(Boolean) // On enlève les valeurs nulles ou undefined au cas où

  return [...new Set(values)].sort() // Pas de doubon + ordre alphabétique
}

export const getMax = (rides: IRide[], key: keyof IRide) => {
  const values = rides
    .map((r) => parseFloat(r[key]?.toString() || '0'))
    .filter((v) => !isNaN(v))
  return values.length > 0 ? Math.max(...values) : 0
}

export const getMapPinSvg = (color: string) => {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 10C20 14.993 14.461 20.193 12.601 21.799C12.4277 21.9293 12.2168 21.9998 12 21.9998C11.7832 21.9998 11.5723 21.9293 11.399 21.799C9.539 20.193 4 14.993 4 10C4 7.87827 4.84285 5.84344 6.34315 4.34315C7.84344 2.84285 9.87827 2 12 2C14.1217 2 16.1566 2.84285 17.6569 4.34315C19.1571 5.84344 20 7.87827 20 10Z" fill="${color}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 14.1226C14.2091 14.1226 16 12.3317 16 10.1226C16 7.91342 14.2091 6.12256 12 6.12256C9.79086 6.12256 8 7.91342 8 10.1226C8 12.3317 9.79086 14.1226 12 14.1226Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
}

export const getWeightByZoom = (zoom: number) => {
  if (zoom < 8) return 3
  if (zoom < 10) return 5
  if (zoom < 13) return 7
  return 9
}

export function useFullScreenMap(mapInstance: Ref<any>) {
  const isFullScreen = ref(false)

  const toggleFullScreen = () => {
    isFullScreen.value = !isFullScreen.value

    // On attend la fin de la transition CSS (0.3s dans votre style)
    setTimeout(() => {
      if (mapInstance.value) {
        // Indispensable pour que Leaflet recalcule sa taille
        mapInstance.value.invalidateSize()
      }

      if (!isFullScreen.value) scrollToMap('map')
    }, 350)
  }

  // Gestion de la touche Echap
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isFullScreen.value) {
      toggleFullScreen()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  watch(isFullScreen, (newValue) => {
    if (newValue) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  })

  return {
    isFullScreen,
    toggleFullScreen
  }
}
