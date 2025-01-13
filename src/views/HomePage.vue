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
      <ion-list>
        <ion-item v-for="(message, index) in messages">
          <msg-card :index="index" :is-owner="true" />
        </ion-item>
      </ion-list>
      <ion-infinite-scroll>
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
              <ion-textarea placeholder="Input something" fill="outline" required />
            </ion-col>
            <ion-col size="auto">
              <ion-button size="large">
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
import Message from '@/types/message'
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
  IonInfiniteScrollContent
} from '@ionic/vue'
import {
  ellipsisVerticalSharp,
  micSharp,
  paperPlaneSharp,
  settingsSharp,
  addSharp
} from 'ionicons/icons'
import { onMounted, reactive } from 'vue'
import msgCard from '@/components/msgCard.vue'

const messages = reactive<Message[]>([])

onMounted(() => {
  for (let i = 0; i < 1000; ++i) {
    messages.push({ content: `Item: ${i}`, sender: 'abcd' })
  }
})
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
