import { FormState } from '@/types'

const HASH_KEY = 'form'

const toBase64Url = (bytes: Uint8Array) =>
  btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const response = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream))
  return new Uint8Array(await response.arrayBuffer())
}

export async function encodeState(state: FormState) {
  const json = new TextEncoder().encode(JSON.stringify(state))
  return toBase64Url(await pipe(json, new CompressionStream('deflate-raw')))
}

export async function decodeState(encoded: string): Promise<FormState> {
  const json = await pipe(fromBase64Url(encoded), new DecompressionStream('deflate-raw'))
  return JSON.parse(new TextDecoder().decode(json))
}

export async function buildShareUrl(state: FormState) {
  const url = new URL(window.location.href)
  url.hash = `${HASH_KEY}=${await encodeState(state)}`
  return url.toString()
}

export function readSharedHash() {
  const params = new URLSearchParams(window.location.hash.slice(1))
  return params.get(HASH_KEY)
}
