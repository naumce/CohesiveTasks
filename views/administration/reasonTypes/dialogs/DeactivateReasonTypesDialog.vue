<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  title: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function onSubmit() {
  emit('submit')
}
function close() {
  emit('update:modelValue', false)
}
defineExpose({
  close
})
</script>
<template>
  <v-dialog v-model="show" persistent width="420">
    <v-card>
      <v-card-title class="bg-default mt-4 mb-n5 flex">
        <v-icon color="orange" class="pl-6 mb-2">mdi-information-outline</v-icon>
        <span class="ml-6 text-h5">{{ props.title || $t('misc.pleaseConfirm') }}?</span>
      </v-card-title>
      <v-card-text class="questiontext">
        <span>{{ $t(`administration.reasonTypes.deactivate.confirmation`) }}</span>
      </v-card-text>
      <v-card-actions class="d-flex pt-9 cardactions">
        <v-spacer></v-spacer>
        <v-btn class="primary-negative-btn" @click="close" data-testid="cancel">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn class="primary-action-btn" @click="onSubmit" data-testid="confirm">
          {{ $t('misc.confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<style scoped lang="scss">
.cardactions {
  width: auto;
  display: flex;
  justify-content: end;
}

.questiontext {
  width: 70%;
  text-align: left;
  margin-left: 30px;
  margin-top: 20px;
}
</style>