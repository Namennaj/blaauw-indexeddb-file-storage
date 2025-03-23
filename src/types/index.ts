export interface FileData {
    contentType: string;
    content: Blob;
}

export enum UploadStatus {
    PENDING = 'pending',
    UPLOADING = 'uploading',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

export interface UploadMetadata {
    id?: number;
    fileKey: string;
    url: string;
    contentType: string;
    uploadStatus: UploadStatus;
    retryCount: number;
}

export enum DownloadStatus {
    PENDING = 'pending',
    DOWNLOADING = 'downloading',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

export interface DownloadMetadata {
    id?: number;
    fileKey: string;
    url: string;
    contentType: string;
    downloadStatus: DownloadStatus;
    lastAccessed: number;
}