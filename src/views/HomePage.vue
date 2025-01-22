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
          <ion-popover trigger="click-trigger" trigger-action="click">
            <ion-content>
              <ion-list>
                <ion-item button detail lines="none">
                  <ion-icon aria-hidden="true" slot="start" :icon="settings"></ion-icon>
                  <ion-label>Settings</ion-label>
                </ion-item>
              </ion-list>
            </ion-content>
          </ion-popover>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-list lines="none">
        <ion-item v-for="(message, index) in messages">
          <msg-card
            :index="index"
            :content="message.content"
            :is-owner="message.sender === 'self'"
          />
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
                <ion-icon v-if="recording" slot="icon-only" :icon="ellipse" />
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
  IonLoading
} from '@ionic/vue'
import { ellipsisVertical, mic, paperPlane, settings, add, ellipse } from 'ionicons/icons'
import { reactive, ref } from 'vue'
import msgCard from '@/components/msgCard.vue'
import axios from 'axios'
import { onMounted } from 'vue'
import { VoiceRecorder } from 'capacitor-voice-recorder'
import { alertMessage, base64ToAudio } from '@/utils'

const messages = reactive<Message[]>([])
const questText = ref<string>()
const mdlIds = ref({})
const selModel = ref('')
const loading = ref(false)
const recording = ref(false)

const baseURL = 'http://192.168.1.16:3000'
const apiKey = 'sk-7477291782ea4ac4a51b995a344a746c'
const reqOptions = {
  baseURL,
  headers: {
    Authorization: `Bearer ${apiKey}`
  }
}

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
  // 获取所有可用模型
  const resp = await axios.get('/api/models', reqOptions)
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

async function onMsgSend() {
  messages.push({ content: questText.value as string, sender: 'self' })
  messages.push({ content: LOADING_FLAG, sender: 'robot' })
  const content = questText.value
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
    reqOptions
  )
  if (resp.status !== 200) {
    return alertMessage(resp.statusText, 'Network Request Failed', 'Response Code ' + resp.status)
  }
  const { choices } = resp.data
  messages.pop()
  for (const choice of choices) {
    messages.push({ content: choice.message.content, sender: choice.message.role })
  }
}
async function onRecordClick() {
  recording.value = !recording.value
  if (recording.value) {
    messages.push({ content: RECORDING_FLAG, sender: 'self' })
    await VoiceRecorder.startRecording()
  } else {
    messages.pop()
    const { value } = await VoiceRecorder.stopRecording()
    console.log(value.mimeType, value.recordDataBase64)
    // const mp3Blob = await base64ToAudio(value.recordDataBase64, value.mimeType)
    // messages.push({
    //   content: `${VOICE_FLAG},${URL.createObjectURL(mp3Blob)}`,
    //   sender: 'self'
    // })

    // const formData = new FormData()
    // formData.append('file', wavFile)
    // const resp = await axios.post('/extract_text', formData, {
    //   baseURL: 'http://192.168.1.16:8000',
    //   headers: {
    //     'Content-Type': 'multipart/form-data'
    //   }
    // })
    // if (resp.status !== 200) {
    //   return alertMessage(resp.statusText, 'Network Request Failed', 'Response Code ' + resp.status)
    // }
    // console.log(resp.data)
  }
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
