// src/lib/secureStorage.ts

export async function encryptMnemonic(mnemonic: string, password: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyMaterial = await getKeyMaterial(password)
  const key = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder.encode('turion-salt'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )

  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(mnemonic)
  )

  const buffer = new Uint8Array([...iv, ...new Uint8Array(encrypted)])
  return btoa(String.fromCharCode(...buffer))
}

export async function decryptMnemonic(encryptedBase64: string, password: string): Promise<string | null> {
  try {
    const buffer = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0))
    const iv = buffer.slice(0, 12)
    const data = buffer.slice(12)

    const encoder = new TextEncoder()
    const keyMaterial = await getKeyMaterial(password)
    const key = await window.crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: encoder.encode('turion-salt'), iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    )

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    return new TextDecoder().decode(decrypted)
  } catch {
    return null
  }
}

async function getKeyMaterial(password: string) {
  const enc = new TextEncoder()
  return window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
}
