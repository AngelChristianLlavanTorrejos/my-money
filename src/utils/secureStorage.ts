import * as SecureStore from "expo-secure-store";

const CHUNK_SIZE = 1800;

function chunksMetaKey(key: string) {
  return `${key}_chunks`;
}

function chunkKey(key: string, index: number) {
  return `${key}_${index}`;
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  const previousCountRaw = await SecureStore.getItemAsync(chunksMetaKey(key));
  const previousCount = previousCountRaw ? Number.parseInt(previousCountRaw, 10) : 0;

  const chunks: string[] = [];
  for (let offset = 0; offset < value.length; offset += CHUNK_SIZE) {
    chunks.push(value.slice(offset, offset + CHUNK_SIZE));
  }

  await SecureStore.setItemAsync(chunksMetaKey(key), String(chunks.length));
  await Promise.all(
    chunks.map((chunk, index) => SecureStore.setItemAsync(chunkKey(key, index), chunk)),
  );

  const leftoverDeletes: Promise<void>[] = [];
  for (let index = chunks.length; index < previousCount; index += 1) {
    leftoverDeletes.push(SecureStore.deleteItemAsync(chunkKey(key, index)));
  }
  leftoverDeletes.push(SecureStore.deleteItemAsync(key));
  await Promise.all(leftoverDeletes);
}

export async function getSecureItem(key: string): Promise<string | null> {
  const countRaw = await SecureStore.getItemAsync(chunksMetaKey(key));

  if (!countRaw) {
    return SecureStore.getItemAsync(key);
  }

  const count = Number.parseInt(countRaw, 10);
  const parts: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const part = await SecureStore.getItemAsync(chunkKey(key, index));
    if (part == null) {
      return null;
    }
    parts.push(part);
  }

  return parts.join("");
}

export async function deleteSecureItem(key: string): Promise<void> {
  const countRaw = await SecureStore.getItemAsync(chunksMetaKey(key));
  const count = countRaw ? Number.parseInt(countRaw, 10) : 0;

  const deletes = [
    SecureStore.deleteItemAsync(chunksMetaKey(key)),
    SecureStore.deleteItemAsync(key),
  ];

  for (let index = 0; index < Math.max(count, 1); index += 1) {
    deletes.push(SecureStore.deleteItemAsync(chunkKey(key, index)));
  }

  await Promise.all(deletes);
}

export const secureStoreAdapter = {
  getItem: getSecureItem,
  setItem: setSecureItem,
  removeItem: deleteSecureItem,
};
