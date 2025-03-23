import { FileData, UploadMetadata, UploadStatus, DownloadMetadata, DownloadStatus } from '../types/index.js';
export declare class FileManager {
    constructor(dbName?: string);
    addFile(url: string, data: Blob, contentType: string): Promise<void>;
    replaceFile(url: string, data: Blob, contentType: string): Promise<void>;
    removeFile(url: string): Promise<void>;
    getFile(url: string): Promise<FileData | null>;
    getFiles(): Promise<FileData[]>;
    clearFiles(): Promise<boolean>;
    queueUpload(url: string, data: Blob, contentType: string, uploadUrl: string): Promise<void>;
    removeUploadMetadata(id: number): Promise<void>;
    getAllUploadMetadata(): Promise<UploadMetadata[]>;
    clearUploadMetadata(): Promise<void>;
    getUploadMetadataByUploadStatus(uploadStatus: UploadStatus): Promise<UploadMetadata[]>;
    deleteStorageDatabase(): Promise<void>;
    addDownloadMetadata(fileKey: string, url: string, contentType: string, downloadStatus: DownloadStatus, lastAccessed: number): Promise<number>;
    getDownloadMetadata(id: number): Promise<DownloadMetadata | undefined>;
    removeDownloadMetadata(id: number): Promise<void>;
    getAllDownloadMetadata(): Promise<DownloadMetadata[]>;
    clearDownloadMetadata(): Promise<void>;
    getDownloadMetadataByDownloadStatus(downloadStatus: DownloadStatus): Promise<DownloadMetadata[]>;
}
