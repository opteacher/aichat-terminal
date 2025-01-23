<template>
  <ion-icon v-if="!isOwner" slot="start" :src="Robot" />
  <ion-card
    :slot="isOwner ? 'end' : 'start'"
    class="max-w-[70%]"
    :button="content.startsWith(VOICE_FLAG)"
  >
    <ion-card-content>
      <ion-spinner v-if="content === LOADING_FLAG" name="dots" />
      <ion-item v-else-if="content === RECORDING_FLAG">
        <ion-spinner slot="start" />
        <ion-label>Recording</ion-label>
      </ion-item>
      <audio v-else-if="content.startsWith(VOICE_FLAG)" controls>
        <source :src="content.substring(VOICE_FLAG.length + 1)" type="audio/mpeg" />
      </audio>
      <div v-else v-html="mdContent" />
    </ion-card-content>
  </ion-card>
  <ion-icon v-if="isOwner" slot="end" :icon="personOutline" />
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonIcon, IonSpinner, IonItem, IonLabel } from '@ionic/vue'
import { personOutline } from 'ionicons/icons'
import { marked } from 'marked'
import { LOADING_FLAG, RECORDING_FLAG, VOICE_FLAG } from '@/types/message'
import { ref, watch } from 'vue'
import Robot from '@/assets/robot (1).svg'

const props = defineProps({
  index: { type: Number, required: true },
  content: { type: String, required: true },
  isOwner: { type: Boolean, default: false }
})
const mdContent = ref(fmtContent())

watch(
  () => props.content,
  () => {
    mdContent.value = fmtContent()
  }
)

function fmtContent() {
  if (props.content === LOADING_FLAG || props.content === RECORDING_FLAG) {
    return props.content
  } else {
    return marked.parse(props.content)
  }
}
</script>
