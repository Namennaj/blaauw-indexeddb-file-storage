import { FileData, UploadMetadata, UploadStatus, DownloadMetadata, DownloadStatus } from '../../types/index.js';

// Define database name and version
let DB_NAME = 'file_cache_db'; // Default name
let DB_VERSION = 1;
const FILES_OBJECT_STORE_NAME = 'files';
const UPLOADS_OBJECT_STORE_NAME = 'uploads'; // Added upload store name
const DOWNLOADS_OBJECT_STORE_NAME = 'downloads'; // Added download store name

let db: IDBDatabase | null = null;

export function setDBName(name: string): void {
  DB_NAME = name;
}

async function openDB(): Promise<IDBDatabase> {
  //console.log('Opening database...');
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error opening database', event);
      reject(new Error('IndexedDB error opening database'));
    };

    request.onsuccess = (event) => {
      //console.log('Database opened successfully');
      db = (event.target as IDBRequest).result as IDBDatabase;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      //console.log('Database upgrade needed');
      const db = (event.target as IDBRequest).result as IDBDatabase;
      // Create the 'files' object store (if it doesn't exist)
      if (!db.objectStoreNames.contains(FILES_OBJECT_STORE_NAME)) {
        db.createObjectStore(FILES_OBJECT_STORE_NAME, { keyPath: 'url' });
        //console.log('File store created');
      } else {
        //console.log('File store already created');
      }

      // Create the 'uploads' object store (if it doesn't exist)
      if (!db.objectStoreNames.contains(UPLOADS_OBJECT_STORE_NAME)) {
        const uploadsStore = db.createObjectStore(UPLOADS_OBJECT_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        uploadsStore.createIndex('fileKey', 'fileKey', { unique: false });
        uploadsStore.createIndex('uploadStatus', 'uploadStatus', {
          unique: false,
        });
        //console.log('Upload store created');
      } else {
        //console.log('Upload already created');
      }

      // Create the 'downloads' object store (if it doesn't exist)
      if (!db.objectStoreNames.contains(DOWNLOADS_OBJECT_STORE_NAME)) {
        const downloadsStore = db.createObjectStore(DOWNLOADS_OBJECT_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        downloadsStore.createIndex('fileKey', 'fileKey', { unique: false });
        downloadsStore.createIndex('downloadStatus', 'downloadStatus', {
          unique: false,
        });
        downloadsStore.createIndex('lastAccessed', 'lastAccessed', {
          unique: false,
        });
        //console.log('Download store created');
      } else {
        //console.log('Download already created');
      }
    };
  });
}

async function closeDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close();
      db = null;
      resolve();
    } else {
      resolve();
    }
  });
}

export async function addFileToDB(url: string, data: FileData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FILES_OBJECT_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(FILES_OBJECT_STORE_NAME);

    // Check if the file already exists
    const getRequest = objectStore.get(url);

    getRequest.onsuccess = () => {
      if (getRequest.result) {
        // File already exists, reject with a specific error
        const error = new Error(`File with the name "${url}" already exists.`);
        (error as any).code = 409; // Add custom error code
        reject(error);
      } else {
        // File doesn't exist, proceed with adding
        const addRequest = objectStore.add({ url, data });

        addRequest.onsuccess = () => resolve();
        addRequest.onerror = (event) => {
          console.error('IndexedDB error adding file', event);
          reject(new Error('IndexedDB error adding file'));
        };
      }
    };

    getRequest.onerror = (event) => {
      console.error('IndexedDB error checking file existence', event);
      reject(new Error('IndexedDB error checking file existence'));
    };
  });
}

export async function replaceFileInDB(url: string, data: FileData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FILES_OBJECT_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(FILES_OBJECT_STORE_NAME);
    const request = objectStore.put({ url, data }); // Use put to replace

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('IndexedDB error replacing file', event);
      reject(new Error('IndexedDB error replacing file'));
    };
  });
}

export async function getFileFromDB(url: string): Promise<FileData | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FILES_OBJECT_STORE_NAME, 'readonly');
    const objectStore = transaction.objectStore(FILES_OBJECT_STORE_NAME);
    const request = objectStore.get(url);

    request.onsuccess = (event) => {
      const result = (event.target as IDBRequest).result;
      resolve(result ? result.data : null);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error getting file', event);
      reject(new Error('IndexedDB error getting file'));
    };
  });
}

export async function removeFileFromDB(url: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FILES_OBJECT_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(FILES_OBJECT_STORE_NAME);
    const request = objectStore.delete(url);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('IndexedDB error deleting file', event);
      reject(new Error('IndexedDB error deleting file'));
    };
  });
}

export async function clearAllFilesFromDB(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FILES_OBJECT_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(FILES_OBJECT_STORE_NAME);
    const request = objectStore.clear();

    request.onsuccess = () => resolve();

    request.onerror = (event) => {
      console.error('IndexedDB error clearing all files', event);
      reject(new Error('IndexedDB error clearing all files'));
    };
  });
}

export async function addUploadMetadata(
  metadata: Omit<UploadMetadata, 'id'>
): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(UPLOADS_OBJECT_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(UPLOADS_OBJECT_STORE_NAME);
    const request = objectStore.add(metadata);

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result as number); // Return the new ID
    };
    request.onerror = (event) => {
      console.error('IndexedDB error adding upload metadata', event);
      reject(new Error('IndexedDB error adding upload metadata'));
    };
  });
}

export async function getUploadMetadata(
  id: number
): Promise<UploadMetadata | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(UPLOADS_OBJECT_STORE_NAME, 'readonly');
    const objectStore = transaction.objectStore(UPLOADS_OBJECT_STORE_NAME);
    const request = objectStore.get(id);

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result as UploadMetadata);
    };
    request.onerror = (event) => {
      console.error('IndexedDB error getting upload metadata', event);
      reject(new Error('IndexedDB error getting upload metadata'));
    };
  });
}

export async function removeUploadMetadata(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(UPLOADS_OBJECT_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(UPLOADS_OBJECT_STORE_NAME);
    const request = objectStore.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('IndexedDB error removing upload metadata', event);
      reject(new Error('IndexedDB error removing upload metadata'));
    };
  });
}

export async function updateUploadMetadata(
  id: number,
  metadata: Partial<UploadMetadata>
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(UPLOADS_OBJECT_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(UPLOADS_OBJECT_STORE_NAME);
    const request = objectStore.get(id);

    request.onsuccess = (event) => {
      const existingMetadata = (event.target as IDBRequest).result as UploadMetadata;
      if (!existingMetadata) {
        reject(new Error(`Upload metadata with id ${id} not found`));
        return;
      }

      const updatedMetadata = { ...existingMetadata, ...metadata };
      const updateRequest = objectStore.put(updatedMetadata);

      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = (event) => {
        console.error('IndexedDB error updating upload metadata', event);
        reject(new Error('IndexedDB error updating upload metadata'));
      };
    };

    request.onerror = (event) => {
      console.error('IndexedDB error getting upload metadata for update', event);
      reject(new Error('IndexedDB error getting upload metadata for update'));
    };
  });
}

export async function getAllFilesFromDB(): Promise<FileData[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FILES_OBJECT_STORE_NAME, 'readonly');
    const objectStore = transaction.objectStore(FILES_OBJECT_STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = (event) => {
      const result = (event.target as IDBRequest).result;
      resolve(result.map((item: { data: FileData; }) => item.data));
    };

    request.onerror = (event) => {
      console.error('IndexedDB error getting all files', event);
      reject(new Error('IndexedDB error getting all files'));
    };
  });
}

export async function getAllUploadMetadata(): Promise<UploadMetadata[]> {
  let db = await openDB();
  if (!db.objectStoreNames.contains(UPLOADS_OBJECT_STORE_NAME)) {
    console.warn('Upload object store not found.  Upgrading database.');
    // Force database upgrade
    DB_VERSION++;
    await closeDB();
    db = await openDB();
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(UPLOADS_OBJECT_STORE_NAME, 'readonly');
    const objectStore = transaction.objectStore(UPLOADS_OBJECT_STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result as UploadMetadata[]);
    };
    request.onerror = (event) => {
      console.error('IndexedDB error getting all upload metadata', event);
      reject(new Error('IndexedDB error getting all upload metadata'));
    };
  });
}

export async function clearUploadMetadata(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(UPLOADS_OBJECT_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(UPLOADS_OBJECT_STORE_NAME);
    const request = objectStore.clear();

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('IndexedDB error clearing all upload metadata', event);
      reject(new Error('IndexedDB error clearing all upload metadata'));
    };
  });
}

export async function getUploadMetadataByUploadStatus(
  uploadStatus: UploadStatus
): Promise<UploadMetadata[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(UPLOADS_OBJECT_STORE_NAME, 'readonly');
    const objectStore = transaction.objectStore(UPLOADS_OBJECT_STORE_NAME);
    const index = objectStore.index('uploadStatus');
    const request = index.getAll(uploadStatus);

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result as UploadMetadata[]);
    };
    request.onerror = (event) => {
      console.error(
        'IndexedDB error getting upload metadata by upload status',
        event
      );
      reject(
        new Error('IndexedDB error getting upload metadata by upload status')
      );
    };
  });
}

export async function deleteDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onerror = (event) => {
      console.error('IndexedDB error deleting database', event);
      reject(new Error('IndexedDB error deleting database'));
    };

    request.onsuccess = () => {
      //console.log('Database deleted successfully');
      // Reset db variable
      db = null;
      resolve();
    };
  });
}

export async function addDownloadMetadata(
  metadata: Omit<DownloadMetadata, 'id'>
): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DOWNLOADS_OBJECT_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(DOWNLOADS_OBJECT_STORE_NAME);
    const request = objectStore.add(metadata);

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result as number); // Return the new ID
    };
    request.onerror = (event) => {
      console.error('IndexedDB error adding download metadata', event);
      reject(new Error('IndexedDB error adding download metadata'));
    };
  });
}

export async function getDownloadMetadata(
  id: number
): Promise<DownloadMetadata | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DOWNLOADS_OBJECT_STORE_NAME, 'readonly');
    const objectStore = transaction.objectStore(DOWNLOADS_OBJECT_STORE_NAME);
    const request = objectStore.get(id);

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result as DownloadMetadata);
    };
    request.onerror = (event) => {
      console.error('IndexedDB error getting download metadata', event);
      reject(new Error('IndexedDB error getting download metadata'));
    };
  });
}

export async function removeDownloadMetadata(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DOWNLOADS_OBJECT_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(DOWNLOADS_OBJECT_STORE_NAME);
    const request = objectStore.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('IndexedDB error removing download metadata', event);
      reject(new Error('IndexedDB error removing download metadata'));
    };
  });
}

export async function getAllDownloadMetadata(): Promise<DownloadMetadata[]> {
  let db = await openDB();
  if (!db.objectStoreNames.contains(DOWNLOADS_OBJECT_STORE_NAME)) {
    console.warn('Download object store not found.  Upgrading database.');
    // Force database upgrade
    DB_VERSION++;
    await closeDB();
    db = await openDB();
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DOWNLOADS_OBJECT_STORE_NAME, 'readonly');
    const objectStore = transaction.objectStore(DOWNLOADS_OBJECT_STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result as DownloadMetadata[]);
    };
    request.onerror = (event) => {
      console.error('IndexedDB error getting all download metadata', event);
      reject(new Error('IndexedDB error getting all download metadata'));
    };
  });
}

export async function clearDownloadMetadata(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DOWNLOADS_OBJECT_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(DOWNLOADS_OBJECT_STORE_NAME);
    const request = objectStore.clear();

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('IndexedDB error clearing all download metadata', event);
      reject(new Error('IndexedDB error clearing all download metadata'));
    };
  });
}

export async function getDownloadMetadataByDownloadStatus(
  downloadStatus: DownloadStatus
): Promise<DownloadMetadata[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DOWNLOADS_OBJECT_STORE_NAME, 'readonly');
    const objectStore = transaction.objectStore(DOWNLOADS_OBJECT_STORE_NAME);
    const index = objectStore.index('downloadStatus');
    const request = index.getAll(downloadStatus);

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result as DownloadMetadata[]);
    };
    request.onerror = (event) => {
      console.error(
        'IndexedDB error getting download metadata by download status',
        event
      );
      reject(
        new Error('IndexedDB error getting download metadata by download status')
      );
    };
  });
}

export async function updateDownloadMetadata(
  id: number,
  metadata: Partial<DownloadMetadata>
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DOWNLOADS_OBJECT_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(DOWNLOADS_OBJECT_STORE_NAME);
    const request = objectStore.get(id);

    request.onsuccess = (event) => {
      const existingMetadata = (event.target as IDBRequest).result as DownloadMetadata;
      if (!existingMetadata) {
        reject(new Error(`Download metadata with id ${id} not found`));
        return;
      }

      const updatedMetadata = { ...existingMetadata, ...metadata };
      const updateRequest = objectStore.put(updatedMetadata);

      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = (event) => {
        console.error('IndexedDB error updating download metadata', event);
        reject(new Error('IndexedDB error updating download metadata'));
      };
    };

    request.onerror = (event) => {
      console.error('IndexedDB error getting download metadata for update', event);
      reject(new Error('IndexedDB error getting download metadata for update'));
    };
  });
}