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
  disableEditing?: boolean
}

// Correction de la définition des props
const props = withDefaults(defineProps<IProps>(), {
  displayFilters: false,
  displayEnlargeButton: false,
  displayRideList: false,
  displayMapLoader: true,
  displayRide: false,
  displayEditorContainer: false,
  disableEditing: false
})

const map = ref<any>(null) // Instance principale de la carte Leaflet
const currentTileLayer = ref<any>(null) // Couche de tuiles active (OSM, Google, etc.) affichée sur la carte
const ridesLayerGroup = ref<any>(null) // Groupe de couches contenant les tracés et marqueurs des balades depuis le backend
const L_instance = ref<any>(null) // Instance locale de la bibliothèque Leaflet importée dynamiquement
const LDraw_instance = ref<any>(null) // Instance globale Leaflet enrichie des fonctionnalités de dessin (Leaflet-Draw)
const drawnItems = ref<any>(null) // Groupe de couches Leaflet contenant les éléments tracés manuellement par l'utilisateur
let drawControl: any = null // Configuration des interactions de dessin de lignes

const dataRides = ref<IRide[]>([]) // Liste brute de toutes les balades récupérées via l'API
const searchValue = ref<string>('') // Texte saisi par l'utilisateur dans la barre de recherche rapide
const filterTime = ref<boolean>(false) // État du filtre rapide pour les balades de moins d'une heure trente
const filterDistance = ref<boolean>(false) // État du filtre rapide pour les balades de moins de 50 kilomètres
const filterLike = ref<boolean>(false) // État du filtre pour afficher uniquement les balades les plus populaires
const filterRecent = ref<boolean>(false) // État du filtre pour afficher les balades créées durant les 7 derniers jours

const selectedId = ref<string>('default') // Identifiant du fond de carte sélectionné (ex: 'osm', 'satellite')
const showFilters = ref<boolean>(false) // Contrôle l'affichage du panneau latéral des filtres avancés
const distanceMax = ref<number>(1) // Valeur maximale de distance trouvée en base pour borner le slider
const durationMax = ref<number>(1) // Valeur maximale de durée trouvée en base pour borner le slider
const listRideTypes = ref<string[]>([]) // Liste unique des catégories de balades disponibles pour le filtre
const listStartTown = ref<string[]>([]) // Liste unique des villes de départ présentes en base pour le filtre
const listEndTown = ref<string[]>([]) // Liste unique des villes d'arrivée présentes en base pour le filtre
const { isFullScreen, toggleFullScreen } = useFullScreenMap(map) // Utilitaire gérant l'état et le basculement du mode plein écran
const drawInstruction = ref<string | null>(null) // Message d'aide contextuel affiché à l'utilisateur pendant le dessin/édition
const visibleRides = ref<IRide[]>([]) // Sous-ensemble des balades actuellement visibles dans la zone affichée de la carte

const route = useRoute() // Instance de la route actuelle pour accéder aux paramètres d'URL
const router = useRouter() // Instance du routeur pour effectuer des redirections ou modifier l'URL

const geom = defineModel('geom', {
  type: Object as () => IGeoJSON | null,
  default: null
}) // La géométrie GeoJSON du tracé (celui lors de l'ajout d'une balade)

const isMapLoading = defineModel('is-map-loading', {
  type: Boolean,
  default: false
})

const STORAGE_KEY_FILTER = 'rides-filters' // Clé utilisée pour sauvegarder les préférences de filtres dans le localStorage
provide('STORAGE_KEY_FILTER', STORAGE_KEY_FILTER) // Injection de la clé pour qu'elle soit accessible par les composants enfants

const defaultFilters: IFilterObject = {
  distance: [0, 9999],
  duration: [0, 99],
  title: '',
  type: [],
  startTown: [],
  endTown: []
}

const activeFilters = ref<IFilterObject>(defaultFilters) // État réactif contenant les valeurs de filtres actuellement appliquées

// Liste des fonds de carte disponibles
const mapItems = ref<MapItem[]>([
  {
    label: 'Par défaut',
    id: 'default',
    icon: 'i-lucide-map',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=fr',
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
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&hl=fr',
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
  // 1. On commence par filtrer selon les critères classiques
  let rides = dataRides.value.filter((ride: IRide) => {
    const searchString = (
      searchValue.value ||
      activeFilters.value.title ||
      ''
    ).toLowerCase()
    const matchesSearch = ride.title.toLowerCase().includes(searchString)

    // Filtres géographiques et types
    const matchesStartTown =
      !activeFilters.value.startTown?.length ||
      activeFilters.value.startTown.includes(ride.start_town)
    const matchesEndTown =
      !activeFilters.value.endTown?.length ||
      activeFilters.value.endTown.includes(ride.end_town)
    const matchesType =
      !activeFilters.value.type?.length ||
      activeFilters.value.type.includes(ride.ride_type)

    // Filtres Sliders
    const matchesSliderDistance =
      ride.distance >= (activeFilters.value.distance?.[0] ?? 0) &&
      ride.distance <= (activeFilters.value.distance?.[1] ?? 9999)
    const matchesSliderDuration =
      ride.duration >= (activeFilters.value.duration?.[0] ?? 0) &&
      ride.duration <= (activeFilters.value.duration?.[1] ?? 99)

    // Filtres rapides (Boutons)
    const matchesQuickTime = !filterTime.value || ride.duration <= 1.5
    const matchesQuickDistance = !filterDistance.value || ride.distance <= 50

    // Filtre "Plus récentes" (Sorties il y a moins de 7 jours)
    let matchesRecent = true
    if (filterRecent.value) {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const rideDate = new Date(ride.createdAt)
      matchesRecent = rideDate >= sevenDaysAgo
    }

    return (
      matchesSearch &&
      matchesSliderDistance &&
      matchesSliderDuration &&
      matchesQuickTime &&
      matchesQuickDistance &&
      matchesStartTown &&
      matchesEndTown &&
      matchesType &&
      matchesRecent
    )
  })

  if (filterLike.value) {
    rides = [...rides].sort((a, b) => (b.like || 0) - (a.like || 0)).slice(0, 5)
  }

  return rides
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

// Modifie la variable réactive pour mettre que les balades visibles sur la carte de l'utilisateur
const updateVisibleRides = () => {
  if (!map.value || !filteredRides.value.length) {
    visibleRides.value = []
    return
  }

  const bounds = map.value.getBounds()

  // On filtre les balades déjà filtrées pour ne garder que celles dans la view box
  visibleRides.value = filteredRides.value.filter((ride) => {
    const startPoint = ride.geom.features[0].geometry.coordinates[0]
    const latLng = L_instance.value.latLng(startPoint[1], startPoint[0])
    return bounds.contains(latLng)
  })
}

// Créer la couhe des balades
const renderRides = () => {
  const L = L_instance.value
  const LDraw = LDraw_instance.value
  if (!map.value || !L || !LDraw) return

  // On supprime la couche existante
  if (ridesLayerGroup.value) map.value.removeLayer(ridesLayerGroup.value)
  ridesLayerGroup.value = L.layerGroup()

  // Si aucune balade correspond à la recherche, on ne créer pas la couche
  if (filteredRides.value.length === 0) return

  // Bounds sert à ajuster le zoom en fonction de l'emplacement des balades trouvées
  const bounds = L.latLngBounds([])
  const currentZoom = map.value.getZoom()

  // Pour chaque balade correspondant à la recherche
  const markersCluster = LDraw.markerClusterGroup()
  filteredRides.value.forEach((ride: IRide) => {
    // On créer l'icon dynamiquement en fonction de la couleur de la balade
    const dynamicIcon = L.divIcon({
      html: getMapPinSvg(ride.color || '#3b82f6'),
      iconSize: [26, 26],
      iconAnchor: [13, 10],
      className: 'custom-dynamic-pin'
    })

    // On créer le point de départ au premier point de la ligne de la balade
    const start = ride.geom.features[0].geometry.coordinates[0]
    const hour = Math.floor(ride.duration)
    const minutes = Math.round((ride.duration - hour) * 60)

    let geojsonLayer: any = null
    const marker = markersCluster.addLayer(
      L.marker([start[1], start[0]], {
        icon: dynamicIcon
      })
        .bindPopup(
          `<div class="ride-detail-container">
          <b>${ride.title}</b><br>${ride.distance}km - ${hour}h ${minutes}min
        </div>`
        )
        .on('popupopen', () => {
          // On créé une couche GeoJSON pour afficher les balades
          geojsonLayer = L.geoJSON(ride.geom as any, {
            style: {
              color: ride.color || '#3B82F6',
              weight: getWeightByZoom(currentZoom),
              opacity: 1
            }
          })
          geojsonLayer.addTo(ridesLayerGroup.value)
        })
        .on('popupclose', () => {
          // On supprimer la couche
          if (geojsonLayer) {
            geojsonLayer.remove(ridesLayerGroup.value)
          }
        })
    )

    // Ajouter la couche et le point de départ à la couche
    // geojsonLayer.addTo(ridesLayerGroup.value)
    markersCluster.addLayer(marker)
    marker.addTo(ridesLayerGroup.value)

    // On étend les bounds pour inclure le point de départ de la balade
    bounds.extend([start[1], start[0]])
  })

  // On ajoute la couche à la carte
  ridesLayerGroup.value.addLayer(markersCluster)
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

onMounted(async () => {
  // Si le paramètre est présent dans l'URL on scroll
  if (route.query.scroll === 'true') {
    setTimeout(() => {
      scrollToMap('map')
      // Nettoyage de l'URL pour éviter de rescroller au prochain refresh
      router.replace({ query: {} })
    }, 400)
  }

  isMapLoading.value = true

  const L = await import('leaflet')
  await import('leaflet.markercluster')
  await import('leaflet-draw')

  await import('leaflet/dist/leaflet.css')
  await import('leaflet-draw/dist/leaflet.draw.css')
  await import('leaflet.markercluster/dist/MarkerCluster.css')
  await import('leaflet.markercluster/dist/MarkerCluster.Default.css')
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
  LDraw_instance.value = LDraw
  convertToFrench(LDraw)

  // On crée une couche pour stocker les éléments dessinés
  drawnItems.value = new LDraw.FeatureGroup()
  map.value.addLayer(drawnItems.value)

  if (props.displayEditorContainer && LDraw.Control?.Draw) {
    drawControl = new LDraw.Control.Draw({
      edit: {
        featureGroup: drawnItems.value,
        poly: { allowIntersection: false }
      },
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

    // Supprime les tooltips natifs des boutons de la toolbar (de leaflet-draw)
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

    // Permet l'affichage des instructions personnalisé en bas
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
      drawnItems.value.addLayer(layer)
      updateGeomModel(drawnItems.value)

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
    map.value.on(LDraw.Draw.Event.EDITED, () =>
      updateGeomModel(drawnItems.value)
    )
    map.value.on(LDraw.Draw.Event.DELETED, () => {
      updateGeomModel(drawnItems.value)

      if (drawnItems.value.getLayers().length === 0) {
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
    // S'assurer que si c'est vide, on envoie null pour reset la durée
    if (!data.features || data.features.length === 0) {
      geom.value = null
    } else {
      geom.value = data
    }
  }

  updateMapBackground(selectedId.value, L)

  if (props.displayRide) {
    const runtimeConfig = useRuntimeConfig()
    try {
      const res = await fetch(
        `${runtimeConfig.public.apiBase}rides?project=all`
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
      isMapLoading.value = false
    }

    // Permet d'épaissir le trait des balades en fonction du zoom et de mettre à jour les balades visibles
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

      updateVisibleRides()
    })
    map.value.on('moveend', updateVisibleRides)

    isMapLoading.value = false
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

  isMapLoading.value = false
})

watch(selectedId, (newId: string) =>
  updateMapBackground(newId, L_instance.value)
)
watch(filteredRides, () => {
  renderRides()
  updateVisibleRides()
})

// Surveille les changements externes du v-model (ex: calcul OSRM)
watch(
  () => geom.value,
  (newGeom) => {
    if (!map.value || !L_instance.value || !newGeom) return

    isMapLoading.value = true

    // On nettoie l'existant sur la couche d'édition
    drawnItems.value.clearLayers()

    // On ajoute le nouveau tracé à la couche d'édition
    const geojsonLayer = L_instance.value.geoJSON(newGeom)
    geojsonLayer.eachLayer((layer: any) => {
      // On s'assure que c'est une Polyline (tracé)
      if (layer instanceof L_instance.value.Polyline) {
        drawnItems.value.addLayer(layer)
      }
    })

    // Ajuster la vue pour voir le tracé calculé
    const bounds = geojsonLayer.getBounds()
    if (bounds.isValid()) {
      map.value.fitBounds(bounds, { padding: [30, 30] })
    }

    isMapLoading.value = false
  },
  { immediate: true }
)
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
    <div v-if="isMapLoading && props.displayMapLoader" class="loader-overlay">
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
        class="cursor-pointer"
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
        class="cursor-pointer"
        @click="filterTime = !filterTime"
      >
        -1h30
      </UButton>

      <UButton
        icon="i-lucide-route"
        :color="filterDistance ? 'primary' : 'neutral'"
        :variant="filterDistance ? 'solid' : 'subtle'"
        class="cursor-pointer"
        @click="filterDistance = !filterDistance"
      >
        -50km
      </UButton>

      <UButton
        icon="i-lucide-heart"
        :color="filterLike ? 'primary' : 'neutral'"
        :variant="filterLike ? 'solid' : 'subtle'"
        class="cursor-pointer"
        @click="filterLike = !filterLike"
      >
        Coups de coeur
      </UButton>

      <UButton
        icon="i-lucide-calendar-days"
        :color="filterRecent ? 'primary' : 'neutral'"
        :variant="filterRecent ? 'solid' : 'subtle'"
        class="cursor-pointer"
        @click="filterRecent = !filterRecent"
      >
        Les plus récentes
      </UButton>
    </div>
    <UButton
      v-if="props.displayEnlargeButton"
      :icon="isFullScreen ? 'i-lucide-minimize' : 'i-lucide-maximize'"
      class="button-enlarge cursor-pointer"
      color="neutral"
      variant="subtle"
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

    <PanelRides v-if="props.displayRideList" :filtered-rides="visibleRides" />
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

.ride-detail-container {
  margin-bottom: 20em;
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
