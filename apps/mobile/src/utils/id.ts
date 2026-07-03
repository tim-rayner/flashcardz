/**
 * Local primary keys only need to be unique on-device, not
 * cryptographically unguessable, so we use the platform's randomUUID when
 * Hermes provides it and fall back to a Math.random-based v4 shape when it
 * doesn't (no expo-crypto dependency needed either way).
 */
export function createId(): string {
  const globalCrypto = (globalThis as { crypto?: { randomUUID?: () => string } })
    .crypto;
  if (globalCrypto?.randomUUID) {
    return globalCrypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
