<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>AI Chat Robot</ion-title>
        <ion-buttons slot="end">
          <ion-button id="click-trigger">
            <ion-icon aria-hidden="true" :icon="ellipsisVerticalSharp" />
          </ion-button>
          <ion-popover trigger="click-trigger" trigger-action="click">
            <ion-content>
              <ion-list>
                <ion-item button detail lines="none">
                  <ion-icon aria-hidden="true" slot="start" :icon="settingsSharp"></ion-icon>
                  <ion-label>Settings</ion-label>
                </ion-item>
              </ion-list>
            </ion-content>
          </ion-popover>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-list class="ls-message">
        <ion-item v-for="(message, index) in messages" class="border-0">
          <msg-card
            :index="index"
            :content="message.content"
            :is-owner="message.sender === 'self'"
          />
        </ion-item>
      </ion-list>
      <ion-infinite-scroll position="top">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-grid :fixed="true">
          <ion-row>
            <ion-col size="auto">
              <ion-button fill="outline" color="dark">
                <ion-icon aria-hidden="true" :icon="micSharp" />
              </ion-button>
            </ion-col>
            <ion-col>
              <ion-textarea
                placeholder="Input something"
                fill="outline"
                required
                v-model="questText"
              />
            </ion-col>
            <ion-col size="auto">
              <ion-button size="large" @click="onMsgSend">
                <ion-icon aria-hidden="true" :icon="paperPlaneSharp" />
              </ion-button>
            </ion-col>
            <ion-col size="auto">
              <ion-button fill="outline">
                <ion-icon aria-hidden="true" :icon="addSharp" />
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import Message, { LOADING_FLAG } from '@/types/message'
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
  alertController
} from '@ionic/vue'
import {
  ellipsisVerticalSharp,
  micSharp,
  paperPlaneSharp,
  settingsSharp,
  addSharp
} from 'ionicons/icons'
import { reactive, ref } from 'vue'
import msgCard from '@/components/msgCard.vue'
import axios from 'axios'

const messages = reactive<Message[]>([])
const questText = ref<string>()

const baseURL = 'http://192.168.1.16:3000'
const apiKey = 'sk-7477291782ea4ac4a51b995a344a746c'

async function onMsgSend() {
  messages.push({ content: questText.value as string, sender: 'self' })
  messages.push({ content: LOADING_FLAG, sender: 'robot' })
  const content = questText.value
  questText.value = ''
  const resp = await axios.post(
    '/api/chat/completions',
    {
      model: 'qwen2:latest',
      messages: [
        {
          role: 'user',
          content
        }
      ]
    },
    {
      baseURL,
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    }
  )
  if (resp.status !== 200) {
    await alertController
      .create({
        header: 'Network Request Failed',
        subHeader: 'Response Code ' + resp.status,
        message: resp.statusText,
        buttons: ['Action']
      })
      .then(alert => alert.present())
  }
  const { choices } = resp.data
  console.log(messages[messages.length - 1].content)
  messages.pop()
  for (const choice of choices) {
    messages.push({ content: choice.message.content, sender: choice.message.role })
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
