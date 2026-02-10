export async function saveImageBase64(base64: string): Promise<string> {
  const dbRequest = indexedDB.open("form-images", 1);

  return new Promise((resolve, reject) => {
    dbRequest.onupgradeneeded = () => {
      dbRequest.result.createObjectStore("images");
    };

    dbRequest.onsuccess = () => {
      const db = dbRequest.result;
      const tx = db.transaction("images", "readwrite");
      const store = tx.objectStore("images");
      const id = crypto.randomUUID();
      store.put(base64, id);
      tx.oncomplete = () => resolve(id);
      tx.onerror = () => reject(tx.error);
    };

    dbRequest.onerror = () => reject(dbRequest.error);
  });
}

export async function loadImageBase64(id: string): Promise<string | undefined> {
  const dbRequest = indexedDB.open("form-images", 1);

  return new Promise((resolve, reject) => {
    dbRequest.onsuccess = () => {
      const db = dbRequest.result;
      const tx = db.transaction("images", "readonly");
      const store = tx.objectStore("images");
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const base64 = getReq.result;
        if (!base64) {
          resolve(undefined);
          return;
        }

        // Add prefix if missing
        const dataUrl = base64.startsWith("data:image")
          ? base64
          : `data:image/png;base64,${base64}`;

        resolve(dataUrl);
      };
      getReq.onerror = () => reject(getReq.error);
    };

    dbRequest.onerror = () => reject(dbRequest.error);
  });
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
