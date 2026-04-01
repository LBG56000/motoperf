<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import type {
  IFilterObject,
  IGeoJSON,
  IRide,
  MapItem,
  RideResponse
} from '~/types/ride'
import PanelRides from './PanelRides.vue'
import FormFilters from './FormFilters.vue'
import { getWeightByZoom, getMapPinSvg } from '~/utils/ride'

interface IProps {
  displayFilters?: boolean
  displayEnlargeButton?: boolean
  displayRideList?: boolean
  displayMapLoader?: boolean
  displayRide?: boolean
  displayEditorContainer?: boolean
}

// Correction de la définition des props
const props = withDefaults(defineProps<IProps>(), {
  displayFilters: false,
  displayEnlargeButton: false,
  displayRideList: false,
  displayMapLoader: true,
  displayRide: false,
  displayEditorContainer: false
})

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
const { isFullScreen, toggleFullScreen } = useFullScreenMap(map)
const drawInstruction = ref<string | null>(null) // Permet de mettre les instructions pour expliquer comment le dessin d'une ligne fonctionne

const geom = defineModel('geom', {
  type: Object as () => IGeoJSON | null,
  default: null
})

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

const filteredRides = computed<IRide[]>(() => {
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

// Fonction appelée quand le formulaire émet 'apply'
const onApplyFilters = (payload: IFilterObject) => {
  activeFilters.value = payload
}

// Changer le fond de plan de la carte
const updateMapBackground = (id: string, L: any) => {
  const style = mapItems.value.find((m: MapItem) => m.id === id)
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
  filteredRides.value.forEach((ride: IRide) => {
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

const startDrawingLine = () => {
  const L = L_instance.value
  if (!map.value || !L) return

  // On lance l'outil de dessin de ligne manuellement
  const polylineDrawer = new L.Draw.Polyline(map.value, {
    shapeOptions: { color: '#3B82F6', weight: 4 }
  })

  polylineDrawer.enable()
}

onMounted(async () => {
  isLoading.value = true

  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')
  await import('leaflet-draw/dist/leaflet.draw.css')
  await import('leaflet-draw')
  L_instance.value = L

  map.value = L.map('map', {
    zoomControl: false,
    preferCanvas: false,
    zoomAnimation: true,
    markerZoomAnimation: true
  }).setView([48.26, -3], 9)
  L.control.zoom({ position: 'bottomleft' }).addTo(map.value)
  L.control.scale({ imperial: false }).addTo(map.value)

  const LDraw = (window as any).L
  convertToFrench(LDraw)

  // On crée une couche pour stocker les éléments dessinés
  const drawnItems = new LDraw.FeatureGroup()
  map.value.addLayer(drawnItems)

  if (props.displayEditorContainer && LDraw.Control?.Draw) {
    const drawControl = new LDraw.Control.Draw({
      edit: { featureGroup: drawnItems, poly: { allowIntersection: false } },
      draw: {
        polyline: { shapeOptions: { color: '#3B82F6', weight: 4 } },
        polygon: false,
        circle: false,
        marker: false,
        circlemarker: false,
        rectangle: false
      }
    })

    map.value.addControl(drawControl)

    // Supprime les tooltips natifs des boutons de la toolbar
    const drawContainer = document.querySelector('.leaflet-draw')
    if (drawContainer) {
      drawContainer
        .querySelectorAll('a')
        .forEach((el) => el.removeAttribute('title'))

      const observer = new MutationObserver(() => {
        drawContainer
          .querySelectorAll('a[title]')
          .forEach((el) => el.removeAttribute('title'))
      })
      observer.observe(drawContainer, {
        attributes: true,
        subtree: true,
        attributeFilter: ['title']
      })
    }

    // Ferme le mode édition si on commence à dessiner
    map.value.on(LDraw.Draw.Event.DRAWSTART, () => {
      if (drawControl._toolbars.edit._activeMode) {
        drawControl._toolbars.edit._activeMode.handler.disable()
      }
    })

    // Ferme le mode dessin si on commence à éditer
    map.value.on(LDraw.Draw.Event.EDITSTART, () => {
      if (drawControl._toolbars.draw._activeMode) {
        drawControl._toolbars.draw._activeMode.handler.disable()
      }
    })

    // Permet l'affichage des instructions en haut
    map.value.on(LDraw.Draw.Event.DRAWSTART, () => {
      drawInstruction.value = 'Cliquez sur la carte pour commencer votre tracé'
      document
        .querySelectorAll('.leaflet-draw-toolbar a')
        .forEach((el) => el.removeAttribute('title'))
    })
    map.value.on(LDraw.Draw.Event.DRAWSTOP, () => {
      drawInstruction.value = null
    })
    map.value.on(LDraw.Draw.Event.EDITSTART, () => {
      drawInstruction.value = 'Déplacez les points pour modifier le tracé'
      document
        .querySelectorAll('.leaflet-draw-toolbar a')
        .forEach((el) => el.removeAttribute('title'))
    })
    map.value.on(LDraw.Draw.Event.EDITSTOP, () => {
      drawInstruction.value = null
    })
    map.value.on(LDraw.Draw.Event.DELETESTART, () => {
      drawInstruction.value = 'Cliquez sur un tracé pour le supprimer'
      document
        .querySelectorAll('.leaflet-draw-toolbar a')
        .forEach((el) => el.removeAttribute('title'))
    })
    map.value.on(LDraw.Draw.Event.DELETESTOP, () => {
      drawInstruction.value = null
    })

    // Quand une ligne est créée
    map.value.on(LDraw.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer
      drawnItems.addLayer(layer)
      updateGeomModel(drawnItems)

      // Désactive complètement le bouton de dessin
      const polylineBtn =
        drawControl._toolbars.draw._toolbarContainer.querySelector(
          '.leaflet-draw-draw-polyline'
        )
      if (polylineBtn) {
        polylineBtn.classList.add('leaflet-disabled')
        polylineBtn.style.pointerEvents = 'none'
        polylineBtn.style.opacity = '0.4'
        polylineBtn.style.cursor = 'not-allowed'
      }
    })
    // Quand une ligne est modifiée ou supprimée
    map.value.on(LDraw.Draw.Event.EDITED, () => updateGeomModel(drawnItems))
    map.value.on(LDraw.Draw.Event.DELETED, () => {
      updateGeomModel(drawnItems)

      if (drawnItems.getLayers().length === 0) {
        const polylineBtn =
          drawControl._toolbars.draw._toolbarContainer.querySelector(
            '.leaflet-draw-draw-polyline'
          )
        if (polylineBtn) {
          polylineBtn.classList.remove('leaflet-disabled')
          polylineBtn.style.pointerEvents = ''
          polylineBtn.style.opacity = ''
          polylineBtn.style.cursor = ''
        }
      }
    })
  }

  // Fonction pour transformer la couche en GeoJSON pour le modelValue
  const updateGeomModel = (group: any) => {
    const data = group.toGeoJSON()
    // data sera une FeatureCollection, on met à jour le model
    geom.value = data
  }

  updateMapBackground(selectedId.value, L)

  if (props.displayRide) {
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
    isLoading.value = false
  }

  if (props.displayFilters) {
    const saved = localStorage.getItem(STORAGE_KEY_FILTER)
    if (saved) {
      activeFilters.value = JSON.parse(saved)
    }

    // Dès que les filtres changent, on les enregistres dans le localStorage
    watch(
      activeFilters,
      (newVal: IFilterObject) => {
        localStorage.setItem(STORAGE_KEY_FILTER, JSON.stringify(newVal))
      },
      { deep: true }
    )
  }

  isLoading.value = false
})

watch(selectedId, (newId: string) =>
  updateMapBackground(newId, L_instance.value)
)
watch(filteredRides, () => renderRides())
</script>

<template>
  <div
    class="map-container"
    :class="{ 'is-fullscreen': isFullScreen }"
    tabindex="0"
    @keydown.esc="toggleFullScreen"
  >
    <Transition name="slide-fade">
      <div v-if="drawInstruction" class="draw-instruction-banner">
        <UIcon name="i-lucide-info" class="w-5 h-5 mr-2" />
        {{ drawInstruction }}
      </div>
    </Transition>

    <div id="map"></div>
    <div v-if="isLoading && props.displayMapLoader" class="loader-overlay">
      <div class="loader-content">
        <UIcon name="i-lucide-loader-2" class="loader-icon" />
        <span class="loader-text">Chargement de la carte...</span>
      </div>
    </div>
    <div v-if="props.displayFilters" class="filters">
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
      v-if="props.displayEnlargeButton"
      :icon="isFullScreen ? 'i-lucide-minimize' : 'i-lucide-maximize'"
      class="button-enlarge"
      color="neutral"
      variant="subtle"
      style="cursor: pointer"
      @click="toggleFullScreen"
    />

    <FormFilters
      v-if="showFilters && distanceMax > 1 && props.displayFilters"
      :max-distance-slider="distanceMax"
      :max-duration-slider="durationMax"
      :list-ride-types="listRideTypes"
      :list-start-town="listStartTown"
      :list-end-town="listEndTown"
      @apply="onApplyFilters"
    />

    <PanelRides v-if="props.displayRideList" :filtered-rides="filteredRides" />
  </div>
</template>

<style scoped>
/* --- BOUTONS ET ÉLÉMENTS FIXES --- */
.button-add-line {
  position: absolute;
  top: 25px;
  right: 15px;
  z-index: 1010;
  pointer-events: auto;
}

.button-enlarge {
  position: absolute;
  bottom: 25px;
  right: 15px;
  z-index: 1010;
  pointer-events: auto;
}

/* --- LOADER --- */
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

/* --- CONTENEUR CARTE --- */
.map-container {
  position: relative !important;
  width: 100%;
  height: 80dvh;
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  background-color: #f8f9fa;
}

.map-container.is-fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100dvh !important;
  z-index: 99999 !important;
  margin: 0 !important;
  border-radius: 0 !important;
}

#map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* --- FILTRES --- */
.filters {
  position: absolute;
  top: 15px;
  left: 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  z-index: 1001;
  pointer-events: none;
}

.filters > * {
  pointer-events: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* --- LEAFLET UI CUSTOM --- */
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

:deep(.leaflet-draw-toolbar),
:deep(.leaflet-draw-actions),
:deep(.leaflet-draw-tooltip),
:deep(.leaflet-popup-content) {
  font-family: 'Poppins', sans-serif !important;
}

:deep(.leaflet-control) {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 15px !important;
  margin-bottom: 15px !important;
  border: none !important;
  overflow: visible !important;
}

/* Bandeau en haut pour les instructions */
.draw-instruction-banner {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  background-color: var(--background);
  color: var(--text-color);
  padding: 10px 20px;
  border-radius: 99px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid var(--ui-primary);
  backdrop-filter: blur(8px);
}

/* Animation d'apparition du bandeau */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translate(-50%, 20px);
  opacity: 0;
}

/* --- TOOLBAR DRAW --- */
/* --- TOOLBAR DRAW --- */
:deep(.leaflet-draw-section) {
  margin: 0 !important;
}

:deep(.leaflet-draw-toolbar) {
  margin-top: 0 !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-radius: 8px !important;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.25) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 0.25px solid rgba(0, 0, 0, 0.25) !important;
}

:deep(.leaflet-draw-toolbar a) {
  background-image: none !important;
  background-color: var(--background) !important;
  width: 32px !important;
  height: 32px !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  color: var(--text-color) !important;
  border-bottom: 0.25px solid rgba(0, 0, 0, 0.1) !important;
  transition: all 0.2s ease;
}

:deep(.leaflet-draw-toolbar a:hover) {
  background-color: var(--ui-primary) !important;
  color: white !important;
}

/* Icons */
:deep(.leaflet-draw-draw-polyline)::before {
  content: '';
  width: 16px;
  height: 16px;
  background-color: currentColor;
  display: block;
  mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBlbi1pY29uIGx1Y2lkZS1wZW4iPjxwYXRoIGQ9Ik0yMS4xNzQgNi44MTJhMSAxIDAgMCAwLTMuOTg2LTMuOTg3TDMuODQyIDE2LjE3NGEyIDIgMCAwIDAtLjUuODNsLTEuMzIxIDQuMzUyYS41LjUgMCAwIDAgLjYyMy42MjJsNC4zNTMtMS4zMmEyIDIgMCAwIDAgLjgzLS40OTd6Ii8+PC9zdmc+')
    no-repeat center / contain;
}

:deep(.leaflet-draw-edit-edit)::before {
  content: '';
  width: 16px;
  height: 16px;
  background-color: currentColor;
  display: block;
  mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXNwbGluZS1wb2ludGVyLWljb24gbHVjaWRlLXNwbGluZS1wb2ludGVyIj48cGF0aCBkPSJNMTIuMDM0IDEyLjY4MWEuNDk4LjQ5OCAwIDAgMSAuNjQ3LS42NDdsOSAzLjVhLjUuNSAwIDAgMS0uMDMzLjk0M2wtMy40NDQgMS4wNjhhMSAxIDAgMCAwLS42Ni42NmwtMS4wNjcgMy40NDNhLjUuNSAwIDAgMS0uOTQzLjAzM3oiLz48cGF0aCBkPSJNNSAxN0ExMiAxMiAwIDAgMSAxNyA1Ii8+PGNpcmNsZSBjeD0iMTkiIGN5PSI1IiByPSIyIi8+PGNpcmNsZSBjeD0iNSIgY3k9IjE5IiByPSIyIi8+PC9zdmc+')
    no-repeat center / contain;
}

:deep(.leaflet-draw-edit-remove)::before {
  content: '';
  width: 16px;
  height: 16px;
  background-color: currentColor;
  display: block;
  mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRyYXNoLWljb24gbHVjaWRlLXRyYXNoIj48cGF0aCBkPSJNMTkgNnYxNGEyIDIgMCAwIDEtMiAySDdhMiAyIDAgMCAxLTItMlY2Ii8+PHBhdGggZD0iTTMgNmgxOCIvPjxwYXRoIGQ9Ik04IDZWNGEyIDIgMCAwIDEgMi0yaDRhMiAyIDAgMCAxIDIgMnYyIi8+PC9zdmc+')
    no-repeat center / contain;
}

/* Actions (Cancel, Save, etc) */
:deep(.leaflet-draw-actions) {
  left: 36px !important;
  top: 0 !important;
  height: 32px !important;
  margin: 0 !important;
  padding: 0 !important;
  list-style: none !important;
}

:deep(.leaflet-draw-actions li) {
  height: 32px !important;
}

:deep(.leaflet-draw-actions a) {
  background: var(--background) !important;
  color: var(--text-color) !important;
  padding: 0 12px !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  height: 32px !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  border-left: 1px solid var(--border-gray) !important;
}

:deep(.leaflet-draw-actions a:hover) {
  background: var(--ui-primary) !important;
  color: white !important;
}

/* --- TOOLTIPS (BULLES D'AIDE) --- */

/* Bulle qui suit la souris pendant le dessin */
:deep(.leaflet-draw-tooltip) {
  background: var(--background) !important;
  border: 1px solid var(--border-gray) !important;
  color: var(--text-color) !important;
  border-radius: 6px !important;
  padding: 5px 10px !important;
  font-size: 11px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
  margin-left: 20px !important;
  margin-top: 20px !important;
  white-space: nowrap !important;
}

/* On masque le triangle */
:deep(.leaflet-draw-tooltip::before) {
  display: none !important;
}

/* On masque le sous-texte superflu */
:deep(.leaflet-draw-tooltip-subtext) {
  color: var(--text-color) !important;
  opacity: 0.7;
  font-size: 10px !important;
  display: block !important;
}

/* --- ÉLÉMENTS DE DESSIN --- */
:deep(.leaflet-editing-icon) {
  background: var(--circle-draw-line) !important;
  border: 2px solid var(--circle-draw-line-outline) !important;
  border-radius: 50% !important;
  width: 12px !important;
  height: 12px !important;
  margin-left: -6px !important;
  margin-top: -6px !important;
}

:deep(.leaflet-draw-guide-dash) {
  background-color: transparent !important;
  background-image: radial-gradient(
    circle,
    var(--line-creation) 1.5px,
    transparent 2px
  ) !important;
  background-size: 8px 8px !important;
}

:deep(.leaflet-mouse-marker) {
  cursor: crosshair;
}

/* --- AUTRES CONTRÔLES --- */
:deep(.leaflet-control-attribution) {
  display: block !important;
  margin: 0 !important;
  padding: 0 5px;
  background: rgba(255, 255, 255, 0.7) !important;
}

:deep(.leaflet-control-zoom) {
  display: block !important;
  margin: 0 !important;
  padding: 0 5px;
  margin-bottom: 10px !important;
  margin-left: 10px !important;
}
</style>
