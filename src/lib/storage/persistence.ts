export interface StoragePersistenceResult {
  supported: boolean;
  persistent: boolean;
}

/**
 * Best-effort request for persistent browser storage.
 * Browsers are free to grant or deny this request.
 */
export async function requestPersistentStorage(): Promise<StoragePersistenceResult> {
  if (!("storage" in navigator) || !navigator.storage) {
    return { supported: false, persistent: false };
  }

  try {
    const alreadyPersistent =
      typeof navigator.storage.persisted === "function"
        ? await navigator.storage.persisted()
        : false;

    if (alreadyPersistent) {
      return { supported: true, persistent: true };
    }

    if (typeof navigator.storage.persist !== "function") {
      return { supported: true, persistent: false };
    }

    const persistent = await navigator.storage.persist();
    return { supported: true, persistent };
  } catch {
    return { supported: true, persistent: false };
  }
}
