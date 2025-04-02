import { addFileToDB, removeFileFromDB, getFileFromDB, getAllFilesFromDB, clearAllFilesFromDB, setDBName, replaceFileInDB, addUploadMetadata, removeUploadMetadata as removeUploadMetadataFromDB, getAllUploadMetadata, clearUploadMetadata, getUploadMetadataByUploadStatus, deleteDatabase, addDownloadMetadata, getDownloadMetadata, removeDownloadMetadata as removeDownloadMetadataFromDB, getAllDownloadMetadata, clearDownloadMetadata as clearDownloadMetadataFromDB, 
  getDownloadMetadataByDownloadStatus, updateUploadMetadata, updateDownloadMetadata } from './storage/indexeddb-storage.js';
import { FileData, UploadMetadata, UploadStatus, DownloadMetadata, DownloadStatus } from '../types/index.js';

export class FileManager {
  constructor(dbName: string = 'file_cache_db') {
    //console.log('FileManager initialized');
    setDBName(dbName);
  }

  public async addFile(url: string, data: Blob, contentType: string): Promise<void> {
    //console.log(`Adding file from URL: ${url}`);
    const fileData: FileData = {
      contentType: contentType,
      content: data,
    };
    await addFileToDB(url, fileData);
  }

  public async replaceFile(url: string, data: Blob, contentType: string): Promise<void> {
    //console.log(`Replacing file from URL: ${url}`);
    const fileData: FileData = {
      contentType: contentType,
      content: data,
    };
    await replaceFileInDB(url, fileData);
  }

  public async removeFile(url: string): Promise<void> {
    //console.log(`Removing file with URL: ${url}`);
    await removeFileFromDB(url);
  }

  public async getFile(url: string): Promise<FileData | null> {
    //console.log(`Getting file with URL: ${url}`);
    return await getFileFromDB(url);
  }

  public async getFiles(): Promise<FileData[]> {
    //console.log('Getting all files');
    return await getAllFilesFromDB();
  }

  public async clearFiles(): Promise<boolean> {
    //console.log('Clearing all files');
    try {
      await clearAllFilesFromDB();
      return true;
    } catch (error) {
      console.error('Error clearing files:', error);
      throw error; // Re-throw the error to propagate it
    }
  }

  public async queueUpload(url: string, data: Blob, contentType: string, uploadUrl: string): Promise<void> {
    //console.log(`Queueing upload for URL: ${url}`);
    const fileData: FileData = {
      contentType: contentType,
      content: data,
    };
    await addFileToDB(url, fileData); // Store the file

    // Add upload metadata
    await addUploadMetadata({
      fileKey: url,
      url: uploadUrl,
      contentType: contentType,
      uploadStatus: UploadStatus.PENDING,
      retryCount: 0,
    });
  }

  public async removeUploadMetadata(id: number): Promise<void> {
    //console.log(`Removing upload metadata with ID: ${id}`);
    await removeUploadMetadataFromDB(id);
  }

  public async getAllUploadMetadata(): Promise<UploadMetadata[]> {
    //console.log('Getting all upload metadata');
    return await getAllUploadMetadata();
  }

  public async clearUploadMetadata(): Promise<void> {
    //console.log('Clearing all upload metadata');
    await clearUploadMetadata();
  }

  public async getUploadMetadataByUploadStatus(uploadStatus: UploadStatus): Promise<UploadMetadata[]> {
    //console.log(`Getting upload metadata by upload status: ${uploadStatus}`);
    return await getUploadMetadataByUploadStatus(uploadStatus);
  }

  public async deleteStorageDatabase(): Promise<void> {
    //console.log('Deleting storage database');
    await deleteDatabase();
  }

  public async addDownloadMetadata(fileKey: string, url: string, contentType: string, downloadStatus: DownloadStatus, lastAccessed: number): Promise<number> {
    //console.log(`Adding download metadata for fileKey: ${fileKey}`);
    return await addDownloadMetadata({
      fileKey: fileKey,
      url: url,
      contentType: contentType,
      downloadStatus: downloadStatus,
      lastAccessed: lastAccessed,
    });
  }

  public async getDownloadMetadata(id: number): Promise<DownloadMetadata | undefined> {
    //console.log(`Getting download metadata with ID: ${id}`);
    return await getDownloadMetadata(id);
  }

  public async removeDownloadMetadata(id: number): Promise<void> {
    //console.log(`Removing download metadata with ID: ${id}`);
    await removeDownloadMetadataFromDB(id);
  }

  public async getAllDownloadMetadata(): Promise<DownloadMetadata[]> {
    //console.log('Getting all download metadata');
    return await getAllDownloadMetadata();
  }

  public async clearDownloadMetadata(): Promise<void> {
    //console.log('Clearing all download metadata');
    await clearDownloadMetadataFromDB();
  }

  public async getDownloadMetadataByDownloadStatus(downloadStatus: DownloadStatus): Promise<DownloadMetadata[]> {
    //console.log(`Getting download metadata by download status: ${downloadStatus}`);
    return await getDownloadMetadataByDownloadStatus(downloadStatus);
  }

  public async updateUploadMetadata(id: number, metadata: Partial<UploadMetadata>): Promise<void> {
    console.log(`Updating upload metadata with ID: ${id}`);
    await updateUploadMetadata(id, metadata);
  }

  public async updateDownloadMetadata(id: number, metadata: Partial<DownloadMetadata>): Promise<void> {
    console.log(`Updating download metadata with ID: ${id}`);
    await updateDownloadMetadata(id, metadata);
  }
}