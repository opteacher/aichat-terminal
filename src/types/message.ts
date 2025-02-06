export default class Message {
  content: string
  sender: string

  constructor(init?: any) {
    if (init) {
      this.content = init.content || ''
      this.sender = init.sender || ''
    } else {
      this.content = ''
      this.sender = ''
    }
  }
}

export const LOADING_FLAG = '^LoAdInG$'
export const RECORDING_FLAG = '^ReCoRdInG$'
export const VOICE_FLAG = '^VoIcE$'