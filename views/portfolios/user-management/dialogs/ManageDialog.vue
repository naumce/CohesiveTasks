<script setup lang="ts">
import { ref, computed } from 'vue'
import ItemForm from './ItemForm.vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { Role, UserData } from '@/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  type: {
    type: String,
    required: true,
    default: 'add'
  },
  roles: {
    type: Array<Role>,
    required: true,
    default: () => []
  },
  user: {
    type: Object as () => UserData,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const { loading } = storeToRefs(useLoaderStore())

const form = ref()

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
  <v-dialog v-model="show" persistent width="400">
    <v-card>
      <v-card-title>
        <span class="text-h5">
          {{ $t(`portfolios.userManagement.${props.type}.title`) }}
        </span>
      </v-card-title>
      <v-card-text>
        <ItemForm ref="form" :roles="props.roles" :value="props.user" @submit="onSubmit" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="loading" class="primary-negative-btn" @click="close">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn :disabled="loading" class="primary-action-btn" @click="form.touch()">
          {{ props.type === 'add' ? $t('misc.invite') : $t('misc.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
