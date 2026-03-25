<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import type { IFilterObject, IRide } from '~/types/ride'
import PanelRides from './PanelRides.vue'
import FormFilters from './FormFilters.vue'
import { scrollToMap } from '../../utils/global'

type MapItem = {
  label: string
  id: string
  icon: string
  url: string
  attribution: string
}

interface RideResponse {
  rides: IRide[]
}

const map = ref<any>(null) // Instance de la carte Leaflet
const currentTileLayer = ref<any>(null) // Couche de tuiles courante affichée sur la carte (permet de gérer notamment le zoom sur les balades trouvées)
const ridesLayerGroup = ref<any>(null) // Layer group pour les balades affichées sur la carte
const L_instance = ref<any>(null) // Layer instances courant de leaflet

const dataRides = ref<IRide[]>([]) // Données des balades récupérées depuis l'API
const searchValue = ref<string>('') // Valeur de recherche pour filtrer les balades
const filterTime = ref<boolean>(false) // Filtre de durée activé ou non
const filterDistance = ref<boolean>(false) // Filtre de distance activé ou non
const selectedId = ref<string>('default') // Fond de carte sélectionné
const showFilters = ref<boolean>(false) // Affichage ou non des filtres
const distanceMax = ref<number>(1) // Distance max d'un tracé pour le slider
const durationMax = ref<number>(1) // Durée max d'un tracé pour le slider
const isLoading = ref<boolean>(true) // Valeur si la carte est entrain de charger
const listRideTypes = ref<string[]>([]) // Liste de tous les types de balade présent
const listStartTown = ref<string[]>([]) // Liste de toutes les villes de début des balades présent
const listEndTown = ref<string[]>([]) // Liste de toutes les villes de fin des balaades présent
const fullScreen = ref<boolean>(false)

const toggleFullScreen = () => {
  fullScreen.value = !fullScreen.value

  // Permet à Leaflet de recalculer la taille de la carte
  setTimeout(() => {
    map.value?.invalidateSize()

    if (!fullScreen.value) {
      scrollToMap('map')
    }
  }, 300) // On attend un peu que la transition CSS se termine sinon ça bug
}

const STORAGE_KEY_FILTER = 'rides-filters'
provide('STORAGE_KEY_FILTER', STORAGE_KEY_FILTER)

const defaultFilters: IFilterObject = {
  distance: [0, 9999], // Initialiser à de grande valeur pour être sûr que toutes les balades s'affiche au début
  duration: [0, 99],
  title: '',
  type: [],
  startTown: [],
  endTown: []
}

const activeFilters = ref<IFilterObject>(defaultFilters)

// Liste des fonds de carte disponibles
const mapItems = ref<MapItem[]>([
  {
    label: 'Par défaut',
    id: 'default',
    icon: 'i-lucide-map',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google'
  },
  {
    label: 'OSM',
    id: 'osm',
    icon: 'i-lucide-earth',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OSM'
  },
  {
    label: 'Satellite',
    id: 'satellite',
    icon: 'i-lucide-satellite',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google'
  },
  {
    label: 'Sombre',
    id: 'dark',
    icon: 'i-lucide-moon',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB'
  },
  {
    label: 'Clair',
    id: 'clair',
    icon: 'i-lucide-sun',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB'
  }
])

const getMapPinSvg = (color: string) => {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 10C20 14.993 14.461 20.193 12.601 21.799C12.4277 21.9293 12.2168 21.9998 12 21.9998C11.7832 21.9998 11.5723 21.9293 11.399 21.799C9.539 20.193 4 14.993 4 10C4 7.87827 4.84285 5.84344 6.34315 4.34315C7.84344 2.84285 9.87827 2 12 2C14.1217 2 16.1566 2.84285 17.6569 4.34315C19.1571 5.84344 20 7.87827 20 10Z" fill="${color}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 14.1226C14.2091 14.1226 16 12.3317 16 10.1226C16 7.91342 14.2091 6.12256 12 6.12256C9.79086 6.12256 8 7.91342 8 10.1226C8 12.3317 9.79086 14.1226 12 14.1226Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
}

const filteredRides = computed(() => {
  return dataRides.value.filter((ride: IRide) => {
    // Recherche des champs de texte (filtre et input au dessus de la map)
    const searchString = (
      searchValue.value ||
      activeFilters.value.title ||
      ''
    ).toLowerCase()

    const matchesSearch = ride.title.toLowerCase().includes(searchString)

    // Filtre Ville de départ
    const filterStart = activeFilters.value.startTown
    const matchesStartTown =
      !filterStart ||
      filterStart.length === 0 ||
      filterStart.includes(ride.start_town)

    // Filtre Ville d'arrivée
    const filterEnd = activeFilters.value.endTown
    const matchesEndTown =
      !filterEnd || filterEnd.length === 0 || filterEnd.includes(ride.end_town)

    // Filtre Type de balade
    const filterType = activeFilters.value.type
    const matchesType =
      !filterType ||
      filterType.length === 0 ||
      filterType.includes(ride.ride_type)

    // Filtre Distance
    const minDist = activeFilters.value.distance?.[0] ?? 0
    const maxDist = activeFilters.value.distance?.[1] ?? 1000
    const matchesSliderDistance =
      ride.distance >= minDist && ride.distance <= maxDist

    // Filtre Durée (Tes données sont déjà en heures, ex: 1.5)
    const minDur = activeFilters.value.duration?.[0] ?? 0
    const maxDur = activeFilters.value.duration?.[1] ?? 24
    const matchesSliderDuration =
      ride.duration >= minDur && ride.duration <= maxDur

    // Filtres rapides (Boutons du haut de la carte)
    const matchesQuickTime = !filterTime.value || ride.duration <= 1.5
    const matchesQuickDistance = !filterDistance.value || ride.distance <= 20

    // On retourne VRAI seulement si TOUTES les conditions sont vrai
    return (
      matchesSearch &&
      matchesSliderDistance &&
      matchesSliderDuration &&
      matchesQuickTime &&
      matchesQuickDistance &&
      matchesStartTown &&
      matchesEndTown &&
      matchesType
    )
  })
})

const getWeightByZoom = (zoom: number) => {
  if (zoom < 8) return 3
  if (zoom < 10) return 5
  if (zoom < 13) return 7
  return 9
}

// Fonction appelée quand le formulaire émet 'apply'
const onApplyFilters = (payload: IFilterObject) => {
  activeFilters.value = payload
}

// Changer le fond de plan de la carte
const updateMapBackground = (id: string, L: any) => {
  const style = mapItems.value.find((m) => m.id === id)
  if (!map.value || !style) return
  if (currentTileLayer.value) map.value.removeLayer(currentTileLayer.value)

  // Re créer la carte avec le fond de plan demandé
  currentTileLayer.value = L.tileLayer(style.url, {
    attribution: style.attribution,
    maxZoom: 20
  }).addTo(map.value)
}

// Créer la couhe des balades
const renderRides = () => {
  const L = L_instance.value
  if (!map.value || !L) return

  // On supprime la couche existante
  if (ridesLayerGroup.value) map.value.removeLayer(ridesLayerGroup.value)
  ridesLayerGroup.value = L.layerGroup()

  // Si aucune balade correspond à la recherche, on ne créer pas la couche
  if (filteredRides.value.length === 0) return

  // Bounds sert à ajuster le zoom en fonction de l'emplacement des balades trouvées
  const bounds = L.latLngBounds([])

  const currentZoom = map.value.getZoom()

  // Pour chaque balade correspondant à la recherche
  filteredRides.value.forEach((ride) => {
    // On créé une couche GeoJSON pour afficher les balades
    const geojsonLayer = L.geoJSON(ride.geom as any, {
      style: {
        color: ride.color || '#3B82F6',
        weight: getWeightByZoom(currentZoom),
        opacity: 1
      }
    })

    // On créer l'icon dynamiquement en fonction de la couleur de la balade
    const dynamicIcon = L.divIcon({
      html: getMapPinSvg(ride.color || '#3b82f6'),
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      className: 'custom-dynamic-pin'
    })

    // On créer le point de départ au premier point de la ligne de la balade
    const start = ride.geom.features[0].geometry.coordinates[0]
    const hour = Math.floor(ride.duration)
    const minutes = Math.round((ride.duration - hour) * 60)
    const marker = L.marker([start[1], start[0]], {
      icon: dynamicIcon
    }).bindPopup(
      `<b>${ride.title}</b><br>${ride.distance}km - ${hour}h ${minutes}min`
    )

    // Ajouter la couche et le point de départ à la couche
    geojsonLayer.addTo(ridesLayerGroup.value)
    marker.addTo(ridesLayerGroup.value)

    // On étend les bounds pour inclure le point de départ de la balade
    bounds.extend([start[1], start[0]])
  })

  // On ajoute la couche à la carte
  ridesLayerGroup.value.addTo(map.value)

  // Si des balades correspondent à la recherche, on ajuste le zoom pour les afficher dans la view box
  // if (filteredRides.value.length > 0) {
  //   map.value.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
  // }
}

const handleFilters = () => {
  showFilters.value = !showFilters.value
  searchValue.value = ''
}

const getUniqueValues = (rides: IRide[], key: keyof IRide): string[] => {
  const values = rides
    .map((r) => r[key]?.toString()) // On extrait et convertit
    .filter(Boolean) // On enlève les valeurs nulles ou undefined au cas où

  return [...new Set(values)].sort() // Set + Tri alphabétique (optionnel mais recommandé)
}

const getMax = (rides: IRide[], key: keyof IRide) => {
  const values = rides
    .map((r) => parseFloat(r[key]?.toString() || '0'))
    .filter((v) => !isNaN(v))
  return values.length > 0 ? Math.max(...values) : 0
}

onMounted(async () => {
  isLoading.value = true

  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')
  L_instance.value = L

  map.value = L.map('map', { zoomControl: false }).setView([48.26, -3], 9)
  L.control.zoom({ position: 'bottomleft' }).addTo(map.value)
  L.control.scale({ imperial: false }).addTo(map.value)

  updateMapBackground(selectedId.value, L)

  const runtimeConfig = useRuntimeConfig()
  try {
    const res = await fetch(
      `${runtimeConfig.public.apiBase}rides?project=title,description,color,geom,duration,distance,start_town,end_town,ride_type,like,picture`
    )
    const data: RideResponse = await res.json()
    if (data.rides && data.rides.length > 0) {
      dataRides.value = data.rides

      distanceMax.value = getMax(data.rides, 'distance')
      durationMax.value = getMax(data.rides, 'duration')
      listRideTypes.value = getUniqueValues(data.rides, 'ride_type')
      listStartTown.value = getUniqueValues(data.rides, 'start_town')
      listEndTown.value = getUniqueValues(data.rides, 'end_town')

      renderRides()
    }
  } catch (e) {
    console.error('Erreur fetch:', e)
  } finally {
    isLoading.value = false
  }

  // Permet d'épaissir le trait des balades en fonction du zoom
  map.value.on('zoomend', () => {
    const newZoom = map.value.getZoom()
    const newWeight = getWeightByZoom(newZoom)

    if (ridesLayerGroup.value) {
      ridesLayerGroup.value.eachLayer((layer: any) => {
        if (layer.setStyle) {
          layer.setStyle({ weight: newWeight })
        }
      })
    }
  })

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fullScreen.value) {
      toggleFullScreen()
    }
  })

  const saved = localStorage.getItem(STORAGE_KEY_FILTER)
  if (saved) {
    activeFilters.value = JSON.parse(saved)
  }

  // Dès que les filtres changent, on les enregistres dans le localStorage
  watch(
    activeFilters,
    (newVal) => {
      localStorage.setItem(STORAGE_KEY_FILTER, JSON.stringify(newVal))
    },
    { deep: true }
  )
})

watch(selectedId, (newId) => updateMapBackground(newId, L_instance.value))
watch(filteredRides, () => renderRides())
</script>

<template>
  <div class="map-container" :class="{ 'is-fullscreen': fullScreen }">
    <div v-if="isLoading" class="loader-overlay">
      <div class="loader-content">
        <UIcon name="i-lucide-loader-2" class="loader-icon" />
        <span class="loader-text">Chargement de la carte...</span>
      </div>
    </div>
    <div class="filters">
      <USelect
        v-model="selectedId"
        :items="mapItems"
        value-key="id"
        class="w-44"
        icon="i-lucide-layers"
        color="neutral"
        variant="subtle"
      />

      <UButton
        icon="i-lucide-filter"
        color="primary"
        variant="solid"
        style="cursor: pointer"
        @click="handleFilters"
      >
        Filtres
      </UButton>

      <UInput
        v-model="searchValue"
        color="neutral"
        placeholder="Rechercher une balade..."
        icon="i-lucide-search"
      />

      <UButton
        icon="i-lucide-clock"
        :color="filterTime ? 'primary' : 'neutral'"
        :variant="filterTime ? 'solid' : 'subtle'"
        style="cursor: pointer"
        @click="filterTime = !filterTime"
      >
        -1h30
      </UButton>

      <UButton
        icon="i-lucide-route"
        :color="filterDistance ? 'primary' : 'neutral'"
        :variant="filterDistance ? 'solid' : 'subtle'"
        style="cursor: pointer"
        @click="filterDistance = !filterDistance"
      >
        -20km
      </UButton>
    </div>
    <UButton
      :icon="fullScreen ? 'i-lucide-minimize' : 'i-lucide-maximize'"
      class="button-enlarge"
      style="cursor: pointer"
      @click="toggleFullScreen"
    />

    <FormFilters
      v-if="showFilters && distanceMax > 1"
      :max-distance-slider="distanceMax"
      :max-duration-slider="durationMax"
      :list-ride-types="listRideTypes"
      :list-start-town="listStartTown"
      :list-end-town="listEndTown"
      @apply="onApplyFilters"
    />

    <PanelRides :filtered-rides="filteredRides" />

    <div id="map"></div>
  </div>
</template>

<style scoped>
.button-enlarge {
  position: absolute;
  bottom: 25px;
  right: 10px;
  z-index: 1001;
}

/* Loader de la carte */
.loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--overlay-loading-background);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loader-icon {
  width: 40px;
  height: 40px;
  color: var(--ui-primary);
  animation: spin 1s linear infinite;
}

.loader-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Carte et ce qu'il y a au dessus */
.map-container {
  position: relative;
  width: 100%;
  height: 80dvh;
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
}

.map-container.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh;
  z-index: 9999;
  margin: 0;
}

.is-fullscreen .button-enlarge {
  bottom: 20px;
  right: 20px;
}

#map {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.filters {
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  z-index: 999;
  pointer-events: none;
}

.filters > * {
  pointer-events: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.custom-dynamic-pin) {
  background: transparent !important;
  border: none !important;
  display: block !important;
}

:deep(.u-select-menu-trigger),
:deep(.u-button-subtle),
:deep(.u-input) {
  background-color: var(--background) !important;
  backdrop-filter: blur(4px);
}
</style>
