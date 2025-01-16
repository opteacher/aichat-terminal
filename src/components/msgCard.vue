<template>
  <ion-icon v-if="!isOwner" slot="start" :src="Robot" />
  <ion-card :slot="isOwner ? 'end' : 'start'" class="max-w-[70%]">
    <ion-card-content>
      <ion-spinner v-if="content === LOADING_FLAG" name="dots" />
      <div v-else v-html="mdContent" />
    </ion-card-content>
  </ion-card>
  <ion-icon v-if="isOwner" slot="end" :icon="personOutline" />
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonIcon, IonSpinner } from '@ionic/vue'
import { personOutline } from 'ionicons/icons'
import { marked } from 'marked'
import { LOADING_FLAG } from '@/types/message'
import { ref, watch } from 'vue'
import Robot from '@/assets/robot (1).svg'

const props = defineProps({
  index: { type: Number, required: true },
  content: { type: String, required: true },
  isOwner: { type: Boolean, default: false }
})
const mdContent = ref(marked.parse(props.content))

watch(
  () => props.content,
  () => {
    mdContent.value = marked.parse(props.content)
  }
)
</script>
