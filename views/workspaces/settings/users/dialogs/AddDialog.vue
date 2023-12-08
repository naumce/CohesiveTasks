<script setup lang="ts">
import { ref, computed } from 'vue'
import ItemForm from './ItemForm.vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { UserData } from '@/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
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

function onSubmit(data: UserData) {
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
  <v-dialog v-model="show" persistent width="568">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ $t(`workspaces.settings.userManagement.addNewUser`) }}</span>
      </v-card-title>
      <v-card-text>
        <ItemForm ref="form" :roles="props.roles" @submit="onSubmit" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="loading" class="primary-negative-btn" @click="close">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn
          :disabled="loading"
          data-testid="button-invite"
          class="primary-action-btn"
          @click="form.touch()"
        >
          {{ $t('misc.invite') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
