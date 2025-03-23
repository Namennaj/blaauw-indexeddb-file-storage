// Define database name and version
let DB_NAME = 'file_cache_db'; // Default name
let DB_VERSION = 1;
const FILES_OBJECT_STORE_NAME = 'files';
const UPLOADS_OBJECT_STORE_NAME = 'uploads'; // Added upload store name
const DOWNLOADS_OBJECT_STORE_NAME = 'downloads'; // Added download store name
let db = null;
export function setDBName(name) {
    DB_NAME = name;
}
async function openDB() {
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
            db = event.target.result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            //console.log('Database upgrade needed');
            const db = event.target.result;
            // Create the 'files' object store (if it doesn't exist)
            if (!db.objectStoreNames.contains(FILES_OBJECT_STORE_NAME)) {
                db.createObjectStore(FILES_OBJECT_STORE_NAME, { keyPath: 'url' });
                //console.log('File store created');
            }
            else {
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
            }
            else {
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
            }
            else {
                //console.log('Download already created');
            }
        };
    });
}
async function closeDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close();
            db = null;
            resolve();
        }
        else {
            resolve();
        }
    });
}
export async function addFileToDB(url, data) {
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
                error.code = 409; // Add custom error code
                reject(error);
            }
            else {
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
export async function replaceFileInDB(url, data) {
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
export async function getFileFromDB(url) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(FILES_OBJECT_STORE_NAME, 'readonly');
        const objectStore = transaction.objectStore(FILES_OBJECT_STORE_NAME);
        const request = objectStore.get(url);
        request.onsuccess = (event) => {
            const result = event.target.result;
            resolve(result ? result.data : null);
        };
        request.onerror = (event) => {
            console.error('IndexedDB error getting file', event);
            reject(new Error('IndexedDB error getting file'));
        };
    });
}
export async function removeFileFromDB(url) {
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
export async function clearAllFilesFromDB() {
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
export async function addUploadMetadata(metadata) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(UPLOADS_OBJECT_STORE_NAME, 'readwrite');
        const objectStore = transaction.objectStore(UPLOADS_OBJECT_STORE_NAME);
        const request = objectStore.add(metadata);
        request.onsuccess = (event) => {
            resolve(event.target.result); // Return the new ID
        };
        request.onerror = (event) => {
            console.error('IndexedDB error adding upload metadata', event);
            reject(new Error('IndexedDB error adding upload metadata'));
        };
    });
}
export async function getUploadMetadata(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(UPLOADS_OBJECT_STORE_NAME, 'readonly');
        const objectStore = transaction.objectStore(UPLOADS_OBJECT_STORE_NAME);
        const request = objectStore.get(id);
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            console.error('IndexedDB error getting upload metadata', event);
            reject(new Error('IndexedDB error getting upload metadata'));
        };
    });
}
export async function removeUploadMetadata(id) {
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
export async function getAllFilesFromDB() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(FILES_OBJECT_STORE_NAME, 'readonly');
        const objectStore = transaction.objectStore(FILES_OBJECT_STORE_NAME);
        const request = objectStore.getAll();
        request.onsuccess = (event) => {
            const result = event.target.result;
            resolve(result.map((item) => item.data));
        };
        request.onerror = (event) => {
            console.error('IndexedDB error getting all files', event);
            reject(new Error('IndexedDB error getting all files'));
        };
    });
}
export async function getAllUploadMetadata() {
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
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            console.error('IndexedDB error getting all upload metadata', event);
            reject(new Error('IndexedDB error getting all upload metadata'));
        };
    });
}
export async function clearUploadMetadata() {
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
export async function getUploadMetadataByUploadStatus(uploadStatus) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(UPLOADS_OBJECT_STORE_NAME, 'readonly');
        const objectStore = transaction.objectStore(UPLOADS_OBJECT_STORE_NAME);
        const index = objectStore.index('uploadStatus');
        const request = index.getAll(uploadStatus);
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            console.error('IndexedDB error getting upload metadata by upload status', event);
            reject(new Error('IndexedDB error getting upload metadata by upload status'));
        };
    });
}
export async function deleteDatabase() {
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
export async function addDownloadMetadata(metadata) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(DOWNLOADS_OBJECT_STORE_NAME, 'readwrite');
        const objectStore = transaction.objectStore(DOWNLOADS_OBJECT_STORE_NAME);
        const request = objectStore.add(metadata);
        request.onsuccess = (event) => {
            resolve(event.target.result); // Return the new ID
        };
        request.onerror = (event) => {
            console.error('IndexedDB error adding download metadata', event);
            reject(new Error('IndexedDB error adding download metadata'));
        };
    });
}
export async function getDownloadMetadata(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(DOWNLOADS_OBJECT_STORE_NAME, 'readonly');
        const objectStore = transaction.objectStore(DOWNLOADS_OBJECT_STORE_NAME);
        const request = objectStore.get(id);
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            console.error('IndexedDB error getting download metadata', event);
            reject(new Error('IndexedDB error getting download metadata'));
        };
    });
}
export async function removeDownloadMetadata(id) {
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
export async function getAllDownloadMetadata() {
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
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            console.error('IndexedDB error getting all download metadata', event);
            reject(new Error('IndexedDB error getting all download metadata'));
        };
    });
}
export async function clearDownloadMetadata() {
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
export async function getDownloadMetadataByDownloadStatus(downloadStatus) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(DOWNLOADS_OBJECT_STORE_NAME, 'readonly');
        const objectStore = transaction.objectStore(DOWNLOADS_OBJECT_STORE_NAME);
        const index = objectStore.index('downloadStatus');
        const request = index.getAll(downloadStatus);
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            console.error('IndexedDB error getting download metadata by download status', event);
            reject(new Error('IndexedDB error getting download metadata by download status'));
        };
    });
}
