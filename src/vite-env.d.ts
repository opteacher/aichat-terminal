/// <reference types="vite/client" />

declare var W3Module: {
  convertWebmToMP3(webmBlob: Blob, decomposition = false): Promise
}
