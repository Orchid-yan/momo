/// <reference types="vite/client" />
/// <reference path="../../preload/index.d.ts" />

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}
