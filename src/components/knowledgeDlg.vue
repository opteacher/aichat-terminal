<template>
  <ion-modal
    ref="knLibMdl"
    trigger="open-knowledge"
    @willPresent="onKnowledgeOpen"
    @didDismiss="$emit('didDismiss')"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Knowledge</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="() => knLibMdl.$el.dismiss(null, 'cancel')">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item-sliding>
        <ion-item>
          <ion-checkbox>
            <ion-label>Allow Notifications</ion-label>
            <ion-note color="medium">Unsubscribe at any time</ion-note>
          </ion-checkbox>
        </ion-item>
        <ion-item-options slot="end">
          <ion-item-option color="tertiary">
            <ion-icon slot="icon-only" :icon="folderOpen"></ion-icon>
          </ion-item-option>
          <ion-item-option color="danger">
            <ion-icon slot="icon-only" :icon="trash"></ion-icon>
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
    </ion-content>
    <ion-button :strong="true" @click="onKnowledgeSubmit">Confirm</ion-button>
  </ion-modal>
</template>

<script setup lang="ts">
import { folderOpen, trash } from 'ionicons/icons'
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
const knLibMdl = ref()
const formState = reactive({
  selKnLibIds: props.knowledge.selKnLibIds
})

function onKnowledgeOpen() {}
function onKnowledgeSubmit() {
  knLibMdl.value.$el.dismiss(null, 'confirm')
}
</script>