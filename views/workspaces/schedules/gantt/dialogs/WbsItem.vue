<script setup lang="ts">
import { watch } from 'vue'
import { ref } from 'vue'
const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['change'])
const itemCopy = ref<any>(JSON.parse(JSON.stringify(props.item)))
watch(
  () => props.item,
  (newVal) => {
    itemCopy.value = newVal
  },
  { deep: true }
)
</script>
<template>
  <v-list-group v-if="itemCopy.children.length">
    <template v-slot:activator="{ props }">
      <v-list-item v-bind="props" density="compact">
        <template v-slot:prepend>
          <v-checkbox-btn
            v-model="itemCopy.selected"
            color="primary"
            hide-details
            @click.stop
            @update:model-value="emit('change', itemCopy)"
          />
        </template>
        <span>{{ itemCopy.text }}</span>
      </v-list-item>
    </template>
    <WbsItem
      v-for="child in itemCopy.children"
      :key="child.id"
      :item="child"
      @change="(event) => emit('change', event)"
    />
  </v-list-group>
  <v-list-item v-else density="compact">
    <template v-slot:prepend>
      <v-checkbox-btn
        v-model="itemCopy.selected"
        color="primary"
        hide-details
        @click.stop
        @update:model-value="emit('change', itemCopy)"
      />
    </template>
    <span>{{ itemCopy.text }}</span>
  </v-list-item>
</template>
