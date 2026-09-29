import 'server-only'

import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 6) {
    const lower = address.toLowerCase()
    return lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80') || lower.startsWith('::ffff:127.')
  }
  const [a, b] = address.split('.').map(Number)
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b! >= 16 && b! <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b! >= 64 && b! <= 127)
  )
}

// Monitored URLs are user input fetched by our server: block private/loopback targets (SSRF).
export async function assertPublicUrl(raw: string): Promise<URL> {
  const url = new URL(raw)
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Use uma URL http(s).')
  if (url.username || url.password) throw new Error('A URL não pode conter credenciais.')
  if (process.env.MONITOR_ALLOW_PRIVATE === 'true') return url
  const addresses = isIP(url.hostname) ? [{ address: url.hostname }] : await lookup(url.hostname, { all: true })
  if (addresses.some(({ address }) => isPrivateAddress(address))) throw new Error('A URL aponta para uma rede privada.')
  return url
}
