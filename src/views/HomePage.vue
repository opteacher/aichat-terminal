<template>
  <ion-loading :is-open="loading" message="Loading Models" />
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>
          <ion-select aria-label="Model" interface="popover" v-model="selModel">
            <ion-select-option v-for="[name, id] in Object.entries(mdlIds)" :value="id">
              {{ name }}
            </ion-select-option>
          </ion-select>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button id="click-trigger">
            <ion-icon aria-hidden="true" :icon="ellipsisVertical" />
          </ion-button>
          <ion-popover ref="settingsPpv" trigger="click-trigger" trigger-action="click">
            <ion-content>
              <ion-list>
                <ion-item button detail lines="none" id="open-modal">
                  <ion-icon aria-hidden="true" slot="start" :icon="settings"></ion-icon>
                  <ion-label>Settings</ion-label>
                </ion-item>
                <ion-modal
                  ref="settingsMdl"
                  trigger="open-modal"
                  @willPresent="onSettingOpen"
                  @didDismiss="() => settingsPpv.$el.dismiss(null, 'cancel')"
                >
                  <ion-header>
                    <ion-toolbar>
                      <ion-title>Settings</ion-title>
                      <ion-buttons slot="end">
                        <ion-button @click="onSettingClose">Cancel</ion-button>
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
                        v-model="settingForm.baseURL"
                      />
                    </ion-item>
                    <ion-item>
                      <ion-input
                        label="API Key"
                        label-placement="stacked"
                        type="text"
                        clearInput
                        v-model="settingForm.apiKey"
                      />
                    </ion-item>
                    <ion-item>
                      <ion-input
                        label="Sensevoice URL"
                        label-placement="stacked"
                        type="text"
                        clearInput
                        v-model="settingForm.ssvURL"
                      />
                    </ion-item>
                  </ion-content>
                  <ion-button :strong="true" @click="onSettingSubmit">Confirm</ion-button>
                </ion-modal>
              </ion-list>
            </ion-content>
          </ion-popover>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-list lines="none">
        <ion-item v-for="(message, index) in messages" class="flex items-start">
          <msg-card :index="index" :message="message" />
        </ion-item>
      </ion-list>
      <ion-infinite-scroll position="bottom">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-grid :fixed="true">
          <ion-row>
            <ion-col size="auto">
              <ion-button
                shape="round"
                fill="outline"
                :color="recording ? 'danger' : 'medium'"
                @click="onRecordClick"
              >
                <ion-icon v-if="recording" slot="icon-only" :icon="stop" />
                <ion-icon v-else slot="icon-only" :icon="mic" />
              </ion-button>
            </ion-col>
            <ion-col>
              <ion-textarea
                placeholder="Input something"
                fill="outline"
                required
                v-model="questText"
                @keyup="e => (e.keyCode === 13 ? onMsgSend() : undefined)"
              />
            </ion-col>
            <ion-col size="auto">
              <ion-button size="large" shape="round" @click="onMsgSend">
                <ion-icon slot="icon-only" :icon="paperPlane" />
              </ion-button>
            </ion-col>
            <ion-col size="auto">
              <ion-button fill="outline" shape="round">
                <ion-icon slot="icon-only" :icon="add" />
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import Message, { LOADING_FLAG, RECORDING_FLAG, VOICE_FLAG } from '@/types/message'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  IonFooter,
  IonGrid,
  IonRow,
  IonCol,
  IonTextarea,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSelect,
  IonSelectOption,
  IonLoading,
  IonModal,
  IonInput,
  toastController
} from '@ionic/vue'
import { ellipsisVertical, mic, paperPlane, settings, add, stop } from 'ionicons/icons'
import { reactive, ref } from 'vue'
import msgCard from '@/components/msgCard.vue'
import axios from 'axios'
import { onMounted } from 'vue'
import { VoiceRecorder } from 'capacitor-voice-recorder'
import { alertMessage, base64ToBlob } from '@/utils'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const messages = reactive<Message[]>([])
const questText = ref<string>()
const mdlIds = ref({})
const selModel = ref('')
const loading = ref(false)
const recording = ref(false)
const settingsMdl = ref()
const settingsPpv = ref()
const baseURL = ref('http://192.168.1.16:3000')
const apiKey = ref('sk-7477291782ea4ac4a51b995a344a746c')
const ssvURL = ref('http://192.168.1.16:8000')
const settingForm = reactive({
  baseURL: baseURL.value,
  apiKey: apiKey.value,
  ssvURL: ssvURL.value
})
const unpkgURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
const ffmpeg = new FFmpeg()

onMounted(async () => {
  loading.value = true
  // 检查录音可用
  const canRecord = await VoiceRecorder.canDeviceVoiceRecord()
  if (!canRecord.value) {
    loading.value = false
    return alertMessage('Unsupport voice recording device!', 'Runtime Environment Failed')
  }
  // 获取录音权限
  if (!(await VoiceRecorder.hasAudioRecordingPermission().then(has => has.value))) {
    const reqRecord = await VoiceRecorder.requestAudioRecordingPermission()
    if (!reqRecord.value) {
      loading.value = false
      return alertMessage(
        'Request audio recording permission failed!',
        'Runtime Environment Failed'
      )
    }
  }
  // 加载FFmpeg
  if (!ffmpeg.loaded) {
    ffmpeg.on('log', ({ type, message }) => {
      console.log(type, message)
    })
    await ffmpeg.load({
      coreURL: await toBlobURL(`${unpkgURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${unpkgURL}/ffmpeg-core.wasm`, 'application/wasm')
    })
  }
  // 获取所有可用模型
  const resp = await axios.get('/api/models', {
    baseURL: baseURL.value,
    headers: {
      Authorization: `Bearer ${apiKey.value}`
    }
  })
  if (resp.status !== 200) {
    loading.value = false
    return alertMessage(resp.statusText, 'Network Request Failed', 'Response Code ' + resp.status)
  }
  const models = resp.data.data as { id: string; name: string }[]
  mdlIds.value = Object.fromEntries(models.map(mdl => [mdl.name, mdl.id]))
  if (!models.length) {
    loading.value = false
    return alertMessage('No available model can be choiced!', 'Ollama Config Failed')
  }
  selModel.value = models[0].id
  loading.value = false
})

async function onMsgSend(content?: string) {
  if (!content) {
    content = questText.value as string
  }
  messages.push(new Message({ content, sender: 'self' }))
  messages.push(new Message({ content: LOADING_FLAG, sender: 'robot' }))
  questText.value = ''
  const resp = await axios.post(
    '/api/chat/completions',
    {
      model: selModel.value,
      messages: [
        {
          role: 'user',
          content
        }
      ]
    },
    {
      baseURL: baseURL.value,
      headers: {
        Authorization: `Bearer ${apiKey.value}`
      }
    }
  )
  if (resp.status !== 200) {
    return alertMessage(resp.statusText, 'Network Request Failed', 'Response Code ' + resp.status)
  }
  const { choices } = resp.data
  messages.pop()
  for (const choice of choices) {
    messages.push(new Message({ content: choice.message.content, sender: choice.message.role }))
  }
}
async function onRecordClick() {
  recording.value = !recording.value
  if (recording.value) {
    messages.push(new Message({ content: RECORDING_FLAG, sender: 'self' }))
    await VoiceRecorder.startRecording()
  } else {
    const { value } = await VoiceRecorder.stopRecording()
    const base64 = `data:${value.mimeType};base64,${value.recordDataBase64}`
    const blob = base64ToBlob(base64)
    await ffmpeg.writeFile('input.webm', await fetchFile(blob))
    await ffmpeg.exec(['-i', 'input.webm', 'output.wav'])
    const data = (await ffmpeg.readFile('output.wav')) as Uint8Array
    const wavBlob = new Blob([data.buffer as ArrayBuffer], { type: 'audio/wav' })
    const wavHref = window.URL.createObjectURL(wavBlob)
    const msg = new Message({
      content: `${VOICE_FLAG},${wavHref}`,
      sender: 'self'
    })

    // const link = document.createElement('a')
    // link.href = wavHref
    // link.download = 'output.wav'
    // link.style.display = 'none'
    // link.click()
    // link.remove()

    const formData = new FormData()
    formData.append('file', wavBlob, 'output.wav')
    const resp = await axios.post('/extract_text', formData, {
      baseURL: ssvURL.value
    })
    if (resp.status !== 200) {
      return alertMessage(resp.statusText, 'Network Request Failed', 'Response Code ' + resp.status)
    }
    console.log(resp.data)
    const { results } = resp.data

    messages.pop()
    messages.push(msg)

    await onMsgSend(results as string)
  }
}
async function onSettingSubmit() {
  baseURL.value = settingForm.baseURL
  apiKey.value = settingForm.apiKey
  ssvURL.value = settingForm.ssvURL
  settingsMdl.value.$el.dismiss(null, 'confirm')
  await toastController
    .create({
      message: 'Settings Saved!',
      duration: 1500,
      position: 'top'
    })
    .then(toast => toast.present())
}
function onSettingOpen() {
  settingForm.baseURL = baseURL.value
  settingForm.apiKey = apiKey.value
  settingForm.ssvURL = ssvURL.value
  // settingsPpv.value.$el.dismiss(null, 'cancel')
}
function onSettingClose() {
  settingsMdl.value.$el.dismiss(null, 'cancel')
}
</script>

<style scoped>
#container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;

  color: #8c8c8c;

  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
