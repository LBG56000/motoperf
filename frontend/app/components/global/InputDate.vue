<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'

const props = defineProps<{
  modelValue: CalendarDate | null
}>()

const emit = defineEmits(['update:modelValue'])

const inputRef = useTemplateRef('inputRef')

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <UInputDate
    ref="inputRef"
    v-model="value as any"
    class="w-full"
    size="xl"
    locale="fr-FR"
  >
    <template #trailing>
      <UPopover :reference="inputRef?.inputsRef[3]?.$el">
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          icon="i-lucide-calendar"
          class="px-0"
        />
        <template #content>
          <UCalendar v-model="value" class="p-2" />
        </template>
      </UPopover>
    </template>
  </UInputDate>
</template>
