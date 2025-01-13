<template>
  <ion-avatar v-if="!isOwner" :slot="isOwner ? 'end' : 'start'">
    <img :src="'https://picsum.photos/80/80?random=' + index" alt="avatar" />
  </ion-avatar>
  <ion-card :slot="isOwner ? 'end' : 'start'">
    <ion-card-content>
      Here's a small text description for the card content. Nothing more, nothing less.
    </ion-card-content>
  </ion-card>
  <ion-avatar v-if="isOwner" :slot="isOwner ? 'end' : 'start'">
    <img :src="'https://picsum.photos/80/80?random=' + index" alt="avatar" />
  </ion-avatar>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonAvatar } from '@ionic/vue'

defineProps({
  index: { type: Number, required: true },
  isOwner: { type: Boolean, default: false }
})
</script>
