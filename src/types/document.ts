import dayjs, { Dayjs } from "dayjs"

export default class Document {
  id: string
  name: string
  title: string
  folders: string[]
  url: string
  published: Dayjs

  constructor(init?: any) {
    if (init) {
      this.id = init.id || ''
      this.name = init.name || ''
      this.title = init.title || ''
      this.folders = init.folders || []
      this.url = init.url || ''
      this.published = dayjs(init.published || null)
    } else {
      this.id = ''
      this.name = ''
      this.title = ''
      this.folders = []
      this.url = ''
      this.published = dayjs(null)
    }
  }
}