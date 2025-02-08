<template>
  <ion-modal
    ref="modal"
    trigger="open-knowledge"
    @willPresent="onKnowledgeOpen"
    @didDismiss="$emit('didDismiss')"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Knowledge</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="() => modal.$el.dismiss(null, 'cancel')">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-select
          justify="space-between"
          label-placement="stacked"
          label="Selected Knowledges"
          interface="popover"
          placeholder="Select Knowledge"
        >
          <ion-select-option value="apples">Apples</ion-select-option>
          <ion-select-option value="oranges">Oranges</ion-select-option>
          <ion-select-option value="bananas">Bananas</ion-select-option>
        </ion-select>
      </ion-item>
    </ion-content>
    <ion-button :strong="true" @click="onKnowledgeSubmit">Confirm</ion-button>
  </ion-modal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface KnowledgeProps {
  anyApiKey: string
  anyBaseURL: string
  selKnLibIds: string[]
}
const emit = defineEmits(['didDismiss', 'submit'])
const props = defineProps({
  knowledge: { type: Object as () => KnowledgeProps, required: true }
})
const modal = ref()
const formState = reactive({
  selKnLibIds: props.knowledge.selKnLibIds
})

function onKnowledgeOpen() {}
function onKnowledgeSubmit() {
  modal.value.$el.dismiss(null, 'confirm')
}
</script>