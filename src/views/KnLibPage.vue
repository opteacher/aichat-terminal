<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="#" @click="router.back()"></ion-back-button>
        </ion-buttons>
        <ion-title>知识库</ion-title>
        <ion-buttons slot="end">
          <ion-button id="new-knlib">
            <ion-icon slot="icon-only" :icon="add" />
          </ion-button>
          <ion-popover ref="settingsPpv" trigger="new-knlib" trigger-action="click">
            <ion-content>
              <ion-list>
                <ion-item button detail lines="none" id="open-add-knlib">
                  <ion-icon aria-hidden="true" slot="start" :icon="library"></ion-icon>
                  <ion-label>新增</ion-label>
                </ion-item>
                <ion-modal ref="addKnlibMdl" trigger="open-add-knlib">
                  <ion-header>
                    <ion-toolbar>
                      <ion-title>新增知识库</ion-title>
                      <ion-buttons slot="end">
                        <ion-button @click="() => addKnlibMdl.$el.dismiss(null, 'cancel')">
                          取消
                        </ion-button>
                      </ion-buttons>
                    </ion-toolbar>
                  </ion-header>
                  <ion-content class="ion-padding">
                    <ion-item>
                      <ion-input
                        label="名称"
                        label-placement="stacked"
                        type="text"
                        placeholder="输入知识库名"
                        v-model="addLibState.knlibName"
                      />
                    </ion-item>
                    <ion-item>
                      <ion-toggle>
                        <ion-label>公开知识库</ion-label>
                        <ion-note color="medium">选择公开则他人可以导入</ion-note>
                      </ion-toggle>
                    </ion-item>
                  </ion-content>
                  <ion-button @click="onAddLibSubmit">确定</ion-button>
                </ion-modal>
                <ion-item button detail lines="none" id="open-input-knlib">
                  <ion-icon aria-hidden="true" slot="start" :icon="fileTrayFull"></ion-icon>
                  <ion-label>导入</ion-label>
                </ion-item>
                <ion-modal ref="iptKnlibMdl" trigger="open-input-knlib">
                  <ion-header>
                    <ion-toolbar>
                      <ion-title>导入知识库</ion-title>
                      <ion-buttons slot="end">
                        <ion-button @click="() => iptKnlibMdl.$el.dismiss(null, 'cancel')">
                          取消
                        </ion-button>
                      </ion-buttons>
                    </ion-toolbar>
                  </ion-header>
                  <ion-content class="ion-padding">
                    <ion-list :inset="true">
                      <ion-item button>
                        <ion-label>
                          abcd
                          <br />
                          <ion-note>adsasdasd</ion-note>
                        </ion-label>
                        <ion-checkbox slot="end"></ion-checkbox>
                      </ion-item>
                    </ion-list>
                  </ion-content>
                  <ion-button @click="onAddLibSubmit">确定</ion-button>
                </ion-modal>
              </ion-list>
            </ion-content>
          </ion-popover>
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
          <ion-list v-show="openFolder === folder.name">
            <ion-item-sliding v-for="doc in folder.items">
              <ion-item button>
                <ion-label>{{ doc.title }}</ion-label>
              </ion-item>
              <ion-item-options slot="end">
                <ion-item-option color="tertiary" @click.stop>
                  <ion-icon slot="icon-only" :icon="informationCircleOutline"></ion-icon>
                </ion-item-option>
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
            <ion-title>新增文档</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="() => (addDocVsb = false)">Cancel</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding"></ion-content>
      </ion-modal>
    </ion-content>
    <ion-alert
      :is-open="rmvDoc !== null"
      header="确认删除该文档？"
      :message="typeof rmvDoc === 'string' ? `【知识库】：${rmvDoc}` : `【文档】：${rmvDoc?.title}`"
      :buttons="actShtBtns"
    />
    <input class="hidden" ref="uploadDoc" name="file" type="file" @change="onUploadChange" />
  </ion-page>
</template>

<script setup lang="ts">
import {
  add,
  share,
  trash,
  chevronForward,
  chevronDown,
  informationCircleOutline,
  library,
  fileTrayFull
} from 'ionicons/icons'
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
  IonAlert,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  IonPopover,
  IonToggle,
  IonNote,
  IonCheckbox,
  toastController
} from '@ionic/vue'
import { reactive, ref } from 'vue'
import axios from 'axios'
import { anyApiKey, anyBaseURL } from '@/utils'
import { onMounted } from 'vue'
import Document from '@/types/document'
import { useRouter } from 'vue-router'

const router = useRouter()
const addKnlibMdl = ref()
const iptKnlibMdl = ref()
const addDocVsb = ref(false)
const addLibState = reactive({
  knlibName: ''
})
const folders = ref<{ name: string; items: Document[] }[]>([])
const openFolder = ref('')
const rmvDoc = ref<string | Document | null>(null)
const actShtBtns = [
  {
    text: '确定',
    cssClass: 'text-red-500',
    role: 'confirm',
    handler: onRmvConfirm
  },
  {
    text: '取消',
    role: 'cancel',
    handler: () => (rmvDoc.value = null)
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
  addKnlibMdl.value.$el.dismiss(addLibState, 'submit')
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
async function onRmvConfirm() {
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
  rmvDoc.value = null
  toastController
    .create({
      message: '删除文档成功！',
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
  formData.append('file', file, file.name)
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
