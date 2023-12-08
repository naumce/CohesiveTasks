<script setup lang="ts">
const props = defineProps({
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean
  }
})
const emit = defineEmits(['input'])

let debounce: number
function onInput(event: InputEvent) {
  window.clearTimeout(debounce)
  debounce = window.setTimeout(() => {
    emit('input', event)
  }, 500)
}
function onClear(event: InputEvent) {
  emit('input', event)
}
</script>
<template>
  <v-text-field
    variant="outlined"
    :placeholder="props.placeholder"
    density="compact"
    append-inner-icon="mdi-magnify"
    hide-details
    clearable
    :disabled="props.disabled"
    data-testid="search"
    @input="onInput"
    @click:clear="onClear"
  />
</template>
