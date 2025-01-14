export default class Message {
  content: string
  sender: string

  constructor() {
    this.content = ''
    this.sender = ''
  }
}

export const LOADING_FLAG = '^LoAdInG$'