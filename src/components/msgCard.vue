<template>
  <ion-button v-if="!isOwner" slot="start" fill="clear" class="mt-5 mb-0 mx-0" size="large">
    <ion-icon slot="icon-only" :src="Robot" />
  </ion-button>
  <ion-card
    :slot="isOwner ? 'end' : 'start'"
    :class="isVoice ? 'w-80' : 'max-w-[70%]'"
    :button="isVoice"
  >
    <ion-card-content>
      <ion-spinner v-if="message.content === LOADING_FLAG" name="dots" />
      <ion-item v-else-if="message.content === RECORDING_FLAG">
        <ion-spinner slot="start" />
        <ion-label>Recording</ion-label>
      </ion-item>
      <audio v-else-if="isVoice" controls>
        <source :src="mdContent" type="audio/webm" />
      </audio>
      <div v-else v-html="mdContent" />
    </ion-card-content>
  </ion-card>
  <ion-button v-if="isOwner" slot="end" fill="clear" class="mt-5 mb-0 mx-0" size="large">
    <ion-icon slot="icon-only" :icon="personOutline" />
  </ion-button>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonItem,
  IonLabel,
  IonButton
} from '@ionic/vue'
import { personOutline } from 'ionicons/icons'
import { marked } from 'marked'
import Message, { LOADING_FLAG, RECORDING_FLAG, VOICE_FLAG } from '@/types/message'
import { ref, watch } from 'vue'
import Robot from '@/assets/robot (1).svg'
import { computed } from 'vue'

const props = defineProps({
  index: { type: Number, required: true },
  message: { type: Object as () => Message, required: true }
})
const mdContent = ref(fmtContent())
const isOwner = computed(() => props.message.sender === 'self')
const isVoice = computed(() => props.message.content.startsWith(VOICE_FLAG))

watch(
  () => props.message.content,
  () => {
    mdContent.value = fmtContent()
  }
)

function fmtContent() {
  if (props.message.content === LOADING_FLAG || props.message.content === RECORDING_FLAG) {
    return props.message.content
  } else if (props.message.content.startsWith(VOICE_FLAG)) {
    // const blob = base64ToBlob(props.content.substring(VOICE_FLAG.length + 1))
    // return URL.createObjectURL(blob)
    return props.message.content.substring(VOICE_FLAG.length + 1)
  } else {
    return marked.parse(props.message.content) as string
  }
}
</script>
