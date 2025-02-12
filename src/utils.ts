import { alertController } from '@ionic/vue'
import lamejs from 'lamejs'

export const baseURL = 'http://192.168.1.16:3000'
export const apiKey = 'sk-7477291782ea4ac4a51b995a344a746c'
export const ssvURL = 'http://192.168.1.16:8000'
export const unpkgURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
export const anyApiKey = 'VRCZTWT-N8Z44KX-G7XYVSS-VTG5TTJ'
export const anyBaseURL = 'http://192.168.1.16:3001'

export async function alertMessage(message: string, header?: string, subHeader?: string) {
  const alert = await alertController.create({
    header,
    subHeader,
    message,
    buttons: ['Action']
  })
  return await alert.present()
}

export async function blobToMp3(blob: Blob) {
  const ab = await blob.arrayBuffer()
  const samples = new Int16Array(ab)
  const channels = 1 //1 单声道 2 立体声
  const kbps = 128 //128kbps
  const sampleRate = 44100 // 44.1khz
  const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps)
  const mp3Data = []
  // const sampleBlockSize = 1152 //576的倍数
  // for (let i = 0; i < samples.length; i += sampleBlockSize) {
  //   const sampleChunk = samples.subarray(i, i + sampleBlockSize)
  //   const mp3buf = mp3encoder.encodeBuffer(sampleChunk)
  //   if (mp3buf.length > 0) {
  //     mp3Data.push(mp3buf)
  //   }
  // }
  // const mp3buf = mp3encoder.flush() //finish writing mp3
  // if (mp3buf.length > 0) {
  //   mp3Data.push(new Int8Array(mp3buf))
  // }
  // return new Blob(mp3Data, { type: 'audio/mp3' })
  let mp3Tmp = mp3encoder.encodeBuffer(samples)
  mp3Data.push(mp3Tmp)
  mp3Tmp = mp3encoder.flush()
  mp3Data.push(mp3Tmp)
  return new Blob(mp3Data, { type: 'audio/mp3' })
}

export function base64ToBlob(base64: string) {
  const [header, data] = base64.split(';base64,')
  const mime = header.substring('data:'.length)
  const bytes = atob(data)
  const ab = new ArrayBuffer(bytes.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < bytes.length; ++i) {
    ia[i] = bytes.charCodeAt(i)
  }
  return new Blob([ab], { type: mime })
}
