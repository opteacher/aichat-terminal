<template>
  <ion-modal
    ref="settingsMdl"
    trigger="open-settings"
    @willPresent="onSettingOpen"
    @didDismiss="$emit('didDismiss')"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>配置</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="() => settingsMdl.$el.dismiss(null, 'cancel')">取消</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-input
          label="Ollama URL"
          label-placement="stacked"
          type="text"
          clearInput
          v-model="formState.baseURL"
        />
      </ion-item>
      <ion-item>
        <ion-input
          label="API Key"
          label-placement="stacked"
          type="text"
          clearInput
          v-model="formState.apiKey"
        />
      </ion-item>
      <ion-item>
        <ion-input
          label="Sensevoice URL"
          label-placement="stacked"
          type="text"
          clearInput
          v-model="formState.ssvURL"
        />
      </ion-item>
    </ion-content>
    <ion-button :strong="true" @click="onSettingSubmit">保存</ion-button>
  </ion-modal>
</template>

<script setup lang="ts">
import { toastController } from '@ionic/vue'
import { reactive } from 'vue'
import { ref } from 'vue'
import {
  IonButton,
  IonContent,
  IonModal,
  IonItem,
  IonInput,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle
} from '@ionic/vue'

interface SettingsProps {
  baseURL: string
  apiKey: string
  ssvURL: string
}
const emit = defineEmits(['didDismiss', 'submit'])
const props = defineProps({
  settings: { type: Object as () => SettingsProps, required: true }
})
const settingsMdl = ref()
const formState = reactive({
  baseURL: props.settings.baseURL,
  apiKey: props.settings.apiKey,
  ssvURL: props.settings.ssvURL
})

async function onSettingSubmit() {
  emit('submit', formState)
  settingsMdl.value.$el.dismiss(null, 'confirm')
  await toastController
    .create({
      message: 'Settings Saved!',
      duration: 1500,
      position: 'bottom',
      color: 'success'
    })
    .then(toast => toast.present())
}
function onSettingOpen() {
  formState.baseURL = props.settings.baseURL
  formState.apiKey = props.settings.apiKey
  formState.ssvURL = props.settings.ssvURL
  // settingsPpv.value.$el.dismiss(null, 'cancel')
}
</script>
