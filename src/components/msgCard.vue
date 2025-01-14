<template>
  <ion-avatar v-if="!isOwner" :slot="isOwner ? 'end' : 'start'">
    <img :src="'https://picsum.photos/80/80?random=' + index" alt="avatar" />
  </ion-avatar>
  <ion-card :slot="isOwner ? 'end' : 'start'" class="max-w-[70%]">
    <ion-card-content>
      <ion-spinner v-if="content === LOADING_FLAG" name="dots" />
      <div v-else v-html="mdContent" />
    </ion-card-content>
  </ion-card>
  <ion-avatar v-if="isOwner" :slot="isOwner ? 'end' : 'start'">
    <img :src="'https://picsum.photos/80/80?random=' + index" alt="avatar" />
  </ion-avatar>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonAvatar, IonSpinner } from '@ionic/vue'
import { marked } from 'marked'
import { LOADING_FLAG } from '@/types/message'
import { ref, watch } from 'vue';

const props = defineProps({
  index: { type: Number, required: true },
  content: { type: String, required: true },
  isOwner: { type: Boolean, default: false }
})
const mdContent = ref(marked.parse(props.content))

watch(() => props.content, () => {
  mdContent.value = marked.parse(props.content)
})
</script>
