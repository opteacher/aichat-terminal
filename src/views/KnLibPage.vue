<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="#" @click="router.back()"></ion-back-button>
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
            <ion-button @click="onAddLibSubmit">Submit</ion-button>
          </ion-modal>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <template v-for="folder in folders">
          <ion-item-sliding>
            <ion-item
              button
              @click="() => (openFolder = openFolder === folder.name ? '' : folder.name)"
            >
              <ion-icon
                slot="start"
                :icon="openFolder === folder.name ? chevronDown : chevronForward"
              />
              <ion-label>{{ folder.name }}</ion-label>
            </ion-item>
            <ion-item-options slot="end">
              <ion-item-option color="tertiary" @click.stop="() => uploadDoc.click()">
                <ion-icon slot="icon-only" :icon="share"></ion-icon>
              </ion-item-option>
              <ion-item-option color="danger" @click.stop="() => (rmvDoc = folder.name)">
                <ion-icon slot="icon-only" :icon="trash"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
          <ion-list v-show="openFolder === folder.name" class="ion-padding">
            <ion-item-sliding v-for="doc in folder.items">
              <ion-item button>
                <ion-label>
                  {{ doc.title }}
                  <br />
                  <ion-note>
                    {{ doc.published.format('YYYY年MM月DD日 HH:mm:ss') }}
                  </ion-note>
                </ion-label>
              </ion-item>
              <ion-item-options slot="end">
                <ion-item-option color="danger" @click.stop="() => (rmvDoc = doc)">
                  <ion-icon slot="icon-only" :icon="trash"></ion-icon>
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          </ion-list>
        </template>
      </ion-list>
      <ion-modal :is-open="addDocVsb">
        <ion-header>
          <ion-toolbar>
            <ion-title>Add Document</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="() => (addDocVsb = false)">Cancel</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding"></ion-content>
      </ion-modal>
    </ion-content>
    <ion-action-sheet
      :is-open="rmvDoc !== null"
      header="Make sure remove?"
      :sub-header="
        typeof rmvDoc === 'string' ? `【folder】：${rmvDoc}` : `【document】：${rmvDoc?.title}`
      "
      :buttons="actShtBtns"
      @didDismiss="onRmvConfirm"
    />
    <input ref="uploadDoc" class="hidden" type="file" @change="onUploadChange" />
  </ion-page>
</template>

<script setup lang="ts">
import { add, share, trash, chevronForward, chevronDown } from 'ionicons/icons'
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
  IonItem,
  IonLabel,
  IonModal,
  IonInput,
  IonBackButton,
  IonNote,
  IonActionSheet,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  toastController
} from '@ionic/vue'
import { reactive, ref } from 'vue'
import axios from 'axios'
import { anyApiKey, anyBaseURL } from '@/utils'
import { onMounted } from 'vue'
import Document from '@/types/document'
import { useRouter } from 'vue-router'

const router = useRouter()
const knlibMdl = ref()
const addDocVsb = ref(false)
const addLibState = reactive({
  knlibName: ''
})
const folders = ref<{ name: string; items: Document[] }[]>([])
const openFolder = ref('')
const rmvDoc = ref<string | Document | null>(null)
const actShtBtns = [
  {
    text: 'OK',
    cssClass: 'text-red-500',
    role: 'destructive',
    data: {
      action: 'remove'
    }
  },
  {
    text: 'Cancel',
    role: 'cancel',
    data: {
      action: 'cancel'
    }
  }
]
const uploadDoc = ref()

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
      items: item.items.map((itm: any) => new Document({ ...itm, folders: [item.name] }))
    }))
  )
}
async function onAddLibSubmit() {
  const resp = await axios.post(
    '/api/v1/document/create-folder',
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
  await refresh()
}
async function onRmvConfirm(e: CustomEvent) {
  const { data } = e.detail
  if (data && data.action === 'remove') {
    if (typeof rmvDoc.value === 'string') {
      await axios.delete('/api/system/remove-folder', {
        data: { name: rmvDoc.value },
        baseURL: anyBaseURL,
        headers: { Authorization: `Bearer ${anyApiKey}` }
      })
    } else {
      const doc = rmvDoc.value as Document
      await axios.delete('/api/v1/system/remove-documents', {
        data: { names: [doc.folders.map(fo => fo + '/').join('') + doc.name] },
        baseURL: anyBaseURL,
        headers: { Authorization: `Bearer ${anyApiKey}` }
      })
    }
  }
  rmvDoc.value = null
  toastController
    .create({
      message: 'Remove Document Succeed!',
      duration: 1500,
      position: 'bottom',
      color: 'success'
    })
    .then(toast => toast.present())
  await refresh()
}
async function onUploadChange(e: Event) {
  const ele = e.target as any
  if (!ele.files.length) {
    return
  }
  const formData = new FormData()
  const file = ele.files[0] as File
  const reader = new FileReader()
  const blob = await new Promise<Blob>(resolve => {
    reader.onload = e => resolve(new Blob([e.target?.result as ArrayBuffer]))
    reader.readAsArrayBuffer(file)
  })
  formData.append('file', blob, file.name)
  const resp = await axios.post('/api/v1/document/upload', formData, {
    baseURL: anyBaseURL,
    headers: {
      Authorization: `Bearer ${anyApiKey}`
    }
  })
  if (resp.status !== 200) {
    toastController
      .create({
        message: 'Upload Document Failed!',
        duration: 1500,
        position: 'bottom',
        color: 'danger'
      })
      .then(toast => toast.present())
    return
  }
  console.log(resp.data)
  await refresh()
}
</script>
