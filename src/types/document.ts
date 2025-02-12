import dayjs, { Dayjs } from "dayjs"

export default class Document {
  id: string
  title: string
  url: string
  published: Dayjs

  constructor(init?: any) {
    if (init) {
      this.id = init.id || ''
      this.title = init.title || ''
      this.url = init.url || ''
      this.published = dayjs(init.published || null)
    } else {
      this.id = ''
      this.title = ''
      this.url = ''
      this.published = dayjs(null)
    }
  }
}