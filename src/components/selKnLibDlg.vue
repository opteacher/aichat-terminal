<template>
  <ion-modal ref="selKnLibMdl" trigger="open-knowledge" @didDismiss="$emit('didDismiss')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Select Knowledge Library</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="onSelKnLibClose(() => $router.push('/knLib'))">Manage</ion-button>
          <ion-button @click="onSelKnLibClose">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p class="m-0">
        <ion-text color="secondary" class="align-middle">
          <ion-icon aria-hidden="true" :icon="informationCircleOutline" size="small" />
        </ion-text>
        向左滑动查看详细
      </p>
      <ion-list>
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
      </ion-list>
    </ion-content>
    <ion-button :strong="true" @click="onSelKnLibSubmit">Confirm</ion-button>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonItemOption,
  IonIcon,
  IonItemOptions,
  IonItemSliding,
  IonCheckbox,
  IonLabel,
  IonNote,
  IonText,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle
} from '@ionic/vue'
import { folderOpen, informationCircleOutline, trash } from 'ionicons/icons'
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
const selKnLibMdl = ref()
const formState = reactive({
  selKnLibIds: props.knowledge.selKnLibIds
})

function onSelKnLibClose(after?: () => void) {
  selKnLibMdl.value.$el.dismiss(null, 'cancel')
  if (after) {
    after()
  }
}
function onSelKnLibSubmit() {
  selKnLibMdl.value.$el.dismiss(null, 'confirm')
}
</script>
