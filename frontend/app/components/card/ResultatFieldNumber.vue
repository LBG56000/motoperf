<script setup lang="ts">
const props = defineProps<{
  fieldName: string
  firstValue: number
  secondValue: number
}>()

const BASE_YEAR = 1950

function normalizeValue(value: number) {
  return props.fieldName === 'year' ? value - BASE_YEAR : value
}

const max = computed(() => Math.max(normalizeValue(props.firstValue), normalizeValue(props.secondValue)))
const firstPercent = computed(() => max.value ? (normalizeValue(props.firstValue) / max.value) * 100 : 0)
const secondPercent = computed(() => max.value ? (normalizeValue(props.secondValue) / max.value) * 100 : 0)

function formatNumber(number: number) {
  if (props.fieldName === 'price') {
    return new Intl.NumberFormat("fr-FR", { style: 'currency', currency: 'EUR' }).format(number);
  }else if (props.fieldName === 'consumption') {
    return new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 3 }).format(number) + ' L/100km';
  }else if (props.fieldName === 'acceleration') {
    return new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 3 }).format(number) + ' s';
  }else if (props.fieldName === 'speedMax') {
    return new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 3 }).format(number) + ' km/h';
  }else if (props.fieldName === 'torque') {
    return new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 3 }).format(number) + ' Nm';
  }else if (props.fieldName === 'weight') {
    return new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 3 }).format(number) + ' kg';
  }else if (props.fieldName === 'engine_size') {
    return new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 3 }).format(number) + ' cc';
  }else if (props.fieldName === 'horsePower') {
    return new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 3 }).format(number) + ' ch';
  }else if (props.fieldName === 'year') {
    
    return number.toString();
  }
}

function tradFieldName(fieldName:string) {
  switch (fieldName) {
    case 'price':
      return 'Prix';
    case 'consumption':
      return 'Consommation';
    case 'acceleration':
      return '0-100 km/h';
    case 'speedMax':
      return 'Vitesse max';
    case 'torque':
      return 'Couple';
    case 'weight':
      return 'Poids';
    case 'engine_size':
      return 'Cylindrée';
    case 'horsePower':
      return 'Puissance';
    case 'year':
      return 'Année';
    default:
      return fieldName;
  }
  
}
</script>

<template>
  <div class="resultat">
    <p>{{ tradFieldName(props.fieldName) }}</p>
    <div class="container-row">
      <div class="left">
        <p>{{ formatNumber(props.firstValue) }}</p>
        <div class="bar-container">
          <span class="bar-value" :style="{ width: firstPercent + '%' }"></span>
          <span class="bar-background"></span>
        </div>
      </div>
      <div class="right">
        <div class="bar-container">
          <span class="bar-value" :style="{ width: secondPercent + '%' }"></span>
          <span class="bar-background"></span>
        </div>
        <p>{{ formatNumber(props.secondValue) }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
h3 {
  text-align: center;
}

.resultat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.container-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 80%;
  gap: 20px;
}

.left,
.right {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.bar-container {
  position: relative;
  width: 80%;
  height: 15px;
}

.bar-background {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: #d7d7d7;
  border-radius: 5px;
}

.bar-value {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #FF0000, #990000);
  border-radius: 5px;
  z-index: 1;
  animation: slide-in 2s ease-in-out;
}

.left .bar-value {
  right: 0;
}

.right .bar-value {
  left: 0;
  transform: rotateY(180deg);
}

@keyframes slide-in {
  from {
    width: 0;
  }
}
</style>
