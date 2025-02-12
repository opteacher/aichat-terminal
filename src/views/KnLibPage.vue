<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="#" @click="$router.back()"></ion-back-button>
        </ion-buttons>
        <ion-title>Knowledge Library</ion-title>
        <ion-buttons slot="end">
          <ion-button id="open-add-knlib">
            <ion-icon slot="icon-only" :icon="add" />
          </ion-button>
          <ion-modal ref="knlibMdl" trigger="open-add-knlib">
            <ion-header>
              <ion-toolbar>
                <ion-title>Add Knowledge Library</ion-title>
                <ion-buttons slot="end">
                  <ion-button @click="() => knlibMdl.$el.dismiss(null, 'cancel')">
                    Cancel
                  </ion-button>
                </ion-buttons>
              </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
              <ion-item>
                <ion-input
                  label="Knowledge Library Name"
                  label-placement="stacked"
                  type="text"
                  placeholder="Enter Library name"
                  v-model="addLibState.knlibName"
                />
              </ion-item>
            </ion-content>
            <ion-button class="mx-2" @click="onAddLibSubmit">Submit</ion-button>
          </ion-modal>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-accordion-group class="mt-5">
        <ion-accordion v-for="folder in folders" :value="folder.name">
          <ion-item slot="header" color="light">
            <ion-label>
              <strong>{{ folder.name }}</strong>
            </ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <ion-list>
              <ion-item v-for="doc in folder.items" button>
                <ion-label>
                  <ion-text color="tertiary">
                    <h2>{{ doc.title }}</h2>
                  </ion-text>
                  <ion-note>{{ doc.published.format('YYYY年MM月DD日 HH:mm:ss') }}</ion-note>
                </ion-label>
              </ion-item>
            </ion-list>
          </div>
        </ion-accordion>
      </ion-accordion-group>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { add } from 'ionicons/icons'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonLabel,
  IonText,
  IonModal,
  IonInput,
  IonBackButton,
  IonNote,
  toastController
} from '@ionic/vue'
import { reactive, ref } from 'vue'
import axios from 'axios'
import { anyApiKey, anyBaseURL } from '@/utils'
import { onMounted } from 'vue'
import Document from '@/types/document'

const knlibMdl = ref()
const addLibState = reactive({
  knlibName: ''
})
const folders = ref<{ name: string; items: Document[] }[]>([])

onMounted(refresh)

async function refresh() {
  const resp = await axios.get('/api/system/local-files', {
    baseURL: anyBaseURL,
    headers: { Authorization: `Bearer ${anyApiKey}` }
  })
  if (resp.status !== 200) {
    await toastController
      .create({
        message: 'Request Library Failed!',
        position: 'bottom',
        color: 'danger',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel'
          }
        ]
      })
      .then(toast => toast.present())
  }
  const { localFiles } = resp.data
  folders.value.splice(
    0,
    folders.value.length,
    ...localFiles.items.map((item: any) => ({
      name: item.name,
      items: item.items.map((itm: any) => new Document(itm))
    }))
  )
  console.log(folders.value)
}
async function onAddLibSubmit() {
  const resp = await axios.post(
    '/v1/document/create-folder',
    { name: addLibState.knlibName },
    { baseURL: anyBaseURL, headers: { Authorization: `Bearer ${anyApiKey}` } }
  )
  knlibMdl.value.$el.dismiss(addLibState, 'submit')
  toastController
    .create({
      message: `Add Library ${resp.status === 200 ? 'Succeed' : 'Failed'}!`,
      duration: 1500,
      position: 'bottom',
      color: resp.status === 200 ? 'success' : 'danger'
    })
    .then(toast => toast.present())
}
function onRmvLibConfirm() {
  console.log('/api/system/remove-folder')
}
</script>
