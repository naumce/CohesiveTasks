<script setup lang="ts">
import { ref, computed } from 'vue'
import ItemForm from './ItemForm.vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { EventCharacterizationPostRole } from '@/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  role: {
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  },
  roles: {
    type: Array
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const form = ref()
const { loading } = storeToRefs(useLoaderStore())

function onSubmit(data: EventCharacterizationPostRole) {
  emit('submit', data)
}

function close() {
  form.value.reset()
  emit('update:modelValue', false)
}
defineExpose({
  close
})
</script>
<template>
  <v-dialog v-model="show" persistent width="1124">
    <v-card>
      <v-card-title class="pa-5 ml-7 mb-n8">
        <span class="text-h5">{{ $t(`workspaces.settings.rolesManagement.editRole`) }}</span>
      </v-card-title>
      <v-card-text>
        <ItemForm ref="form" :roles="props.roles" :value="props.role" @submit="onSubmit" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="loading" class="primary-negative-btn" @click="close" data-testid="cancel">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn
          :disabled="loading"
          class="primary-action-btn"
          @click="form.touch()"
          data-testid="submit"
        >
          {{ $t('misc.submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
