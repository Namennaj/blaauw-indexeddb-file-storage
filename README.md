# blaauw-indexeddb-file-storage

## Overview

The `blaauw-indexeddb-file-storage` library provides a simple way to manage files and their metadata in an IndexedDB database. It allows you to store files, queue uploads, and manage downloads, making it suitable for offline caching and background synchronization.

## Project Structure

```
blaauw-indexeddb-file-storage 
├── src 
│ ├── lib 
│ │ ├── FileManager.ts 
│ │ └── storage 
│ │ └── indexeddb-storage.ts 
│ └── types 
│ │ └── index.ts 
├── src 
│ ├── components 
│ │ ├── FileManagerTest.vue 
│ │ ├── UploadManagerTest.vue 
│ │ └── DownloadManagerTest.vue 
├── package.json 
├── tsconfig.json 
└── README.md
```


## Features

*   **File Storage:** Store and retrieve files in IndexedDB.
*   **Upload Management:** Queue files for upload and track their status.
*   **Download Management:** Manage downloaded files and their metadata.
*   **Metadata Storage:** Store metadata for both uploads and downloads.
*   **Vue.js Components:** Includes Vue.js components for testing and demonstration.

## Installation

To get started with the project, follow these steps:

1.  Clone the repository:

    ```bash
    git clone https://github.com/yourusername/blaauw-indexeddb-file-storage.git
    ```
2.  Navigate to the project directory:

    ```bash
    cd blaauw-indexeddb-file-storage
    ```
3.  Install the dependencies:

    ```bash
    npm install
    ```

## Usage

### Initialization

Import the `initialize` function and use it to create a `FileManager` instance:

```typescript
import { initialize } from 'blaauw-indexeddb-file-storage';

const fileManager = await initialize('myStorage');
```

### File Operations

```typescript
// Add a file
await fileManager.addFile('my-file.txt', fileBlob, 'text/plain');

// Get a file
const fileData = await fileManager.getFile('my-file.txt');

// Remove a file
await fileManager.removeFile('my-file.txt');
```

### Upload Management

```typescript
import { UploadStatus } from 'blaauw-indexeddb-file-storage';

// Queue a file for upload
await fileManager.queueUpload('my-file.txt', fileBlob, 'text/plain', 'https://example.com/upload');

// Get all upload metadata
const uploads = await fileManager.getAllUploadMetadata();

// Get uploads by status
const pendingUploads = await fileManager.getUploadMetadataByUploadStatus(UploadStatus.PENDING);

// Remove upload metadata
await fileManager.removeUploadMetadata(1);
```

### Download Management

```typescript
import { DownloadStatus } from 'blaauw-indexeddb-file-storage';

// Add download metadata
const downloadId = await fileManager.addDownloadMetadata('my-file.txt', 'https://example.com/download', 'text/plain', DownloadStatus.PENDING, Date.now());

// Get all download metadata
const downloads = await fileManager.getAllDownloadMetadata();

// Get downloads by status
const pendingDownloads = await fileManager.getDownloadMetadataByDownloadStatus(DownloadStatus.PENDING);

// Remove download metadata
await fileManager.removeDownloadMetadata(1);
```

## TypeScript Declarations

If you encounter TypeScript errors when using this library, you may need to provide custom type declarations. This can happen if the automatic type inference is not working correctly.

To resolve this, create a `*.d.ts` file (e.g., `types/blaauw-indexeddb-file-storage.d.ts`) in your project and add the following declarations:

```typescript
declare module 'blaauw-indexeddb-file-storage';
declare module 'blaauw-indexeddb-file-storage/dist/types' {
  export interface FileData {
    contentType: string;
    content: File;
  }

  export interface UploadMetadata {
    id?: number;
    fileKey: string;
    url: string;
    contentType: string;
    uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
    retryCount: number;
  }

  export interface DownloadMetadata {
    id?: number;
    fileKey: string;
    url: string;
    contentType: string;
    downloadStatus: 'pending' | 'downloading' | 'completed' | 'failed';
    lastAccessed: number;
  }

  export enum DownloadStatus {
      PENDING = 'pending',
      DOWNLOADING = 'downloading',
      COMPLETED = 'completed',
      FAILED = 'failed',
  }
}
```

Make sure your tsconfig.json includes this *.d.ts file. For example:

```typescript
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "*": ["src/*", "types/*"]
    }
  },
  "include": ["src/**/*", "types/**/*"]
}
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.