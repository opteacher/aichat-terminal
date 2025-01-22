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

export async function base64ToAudio(base64: string, type: string) {
  // 将一系列Base64编码的音频段合并成一个PCM数据流
  const encoder = new TextEncoder()
  const pcmData = encoder.encode(base64)

  // 采样率
  const sampleRate = 44100 // 44.1khz
  // 创建一个大小为44字节的ArrayBuffer，用于存储WAV文件头
  const buffer = new ArrayBuffer(44)
  // 创建一个DataView，用于操作buffer中的数据
  const wavHeader = new DataView(buffer)

  wavHeader.setUint32(0, 0x52494646, false) // 设置Chunk ID为"RIFF"
  wavHeader.setUint32(4, pcmData.length + 36, true) // 设置文件大小（不包括前8个字节）
  wavHeader.setUint32(8, 0x57415645, false) // 设置格式标识为"WAVE"
  wavHeader.setUint32(12, 0x666d7420, false) // 设置第一个子块ID为"fmt "
  wavHeader.setUint32(16, 16, true) // 设置第一个子块大小为16字节
  wavHeader.setUint16(20, 1, true) // 设置音频格式为PCM（1表示PCM）
  wavHeader.setUint16(22, 1, true) // 设置声道数（单声道为1）
  wavHeader.setUint32(24, sampleRate, true) // 设置采样率
  wavHeader.setUint32(28, sampleRate * 2, true) // 设置字节率（采样率 * 每帧字节数）
  wavHeader.setUint16(32, 2, true) // 设置每帧字节数（块对齐）
  wavHeader.setUint16(34, 16, true) // 设置每样本位数
  wavHeader.setUint32(36, 0x64617461, false) // 设置第二个子块ID为"data"
  wavHeader.setUint32(40, pcmData.length, true) // 设置第二个子块大小（即音频数据大小）

  const blob = new Blob([wavHeader, pcmData], { type })

  // 转成mp3
  const channels = 1 //1 单声道 2 立体声
  const kbps = 128 //128kbps mp3
  const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps)
  const mp3Data = []
  const samples = new Int16Array(await blob.arrayBuffer()) // 从源中获取数据
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
