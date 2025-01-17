import { alertController } from '@ionic/vue'

export async function alertMessage(message: string, header?: string, subHeader?: string) {
  const alert = await alertController
    .create({
      header,
      subHeader,
      message,
      buttons: ['Action']
    })
  return await alert.present()
}
