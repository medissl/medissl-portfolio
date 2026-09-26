const DB_NAME = "medissl-portfolio-cms";
const STORE_NAME = "draft-files";
const DB_VERSION = 1;

export type DraftMediaSlot = "cover" | "gallery" | "process";

function storageId(key: string, slot: DraftMediaSlot) {
  return `${key}:${slot}`;
}

function openDraftDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDraftFiles(
  key: string,
  slot: DraftMediaSlot,
  files: File[],
) {
  try {
    const db = await openDraftDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put({
        id: storageId(key, slot),
        files,
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Draft persistence is a convenience feature. Saving the project still works
    // even when private browsing or browser settings disable IndexedDB.
  }
}

export async function loadDraftFiles(
  key: string,
  slot: DraftMediaSlot,
): Promise<File[]> {
  try {
    const db = await openDraftDb();
    const result = await new Promise<{ id: string; files: File[] } | undefined>(
      (resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).get(storageId(key, slot));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      },
    );
    db.close();
    return result?.files ?? [];
  } catch {
    return [];
  }
}

export async function clearDraftFiles(key: string) {
  try {
    const db = await openDraftDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      (["cover", "gallery", "process"] as DraftMediaSlot[]).forEach((slot) => {
        store.delete(storageId(key, slot));
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Nothing to clean up.
  }
}
