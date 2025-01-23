import { alertController } from '@ionic/vue'
import lamejs from 'lamejs'

export async function alertMessage(message: string, header?: string, subHeader?: string) {
  const alert = await alertController.create({
    header,
    subHeader,
    message,
    buttons: ['Action']
  })
  return await alert.present()
}

export function blobToMp3(samples: Int16Array) {
  const channels = 1 //1 单声道 2 立体声
  const kbps = 128 //128kbps 
  const sampleRate = 44100 // 44.1khz
  const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps)
  const mp3Data = []
  const sampleBlockSize = 1152 //576的倍数
  for (let i = 0; i < samples.length; i += sampleBlockSize) {
    const sampleChunk = samples.subarray(i, i + sampleBlockSize)
    const mp3buf = mp3encoder.encodeBuffer(sampleChunk)
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf)
    }
  }
  const mp3buf = mp3encoder.flush() //finish writing mp3
  if (mp3buf.length > 0) {
    mp3Data.push(new Int8Array(mp3buf))
  }
  return new Blob(mp3Data, { type: 'audio/mp3' })
}
