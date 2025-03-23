import { addFileToDB, removeFileFromDB, getFileFromDB, getAllFilesFromDB, clearAllFilesFromDB, setDBName, replaceFileInDB, addUploadMetadata, removeUploadMetadata as removeUploadMetadataFromDB, getAllUploadMetadata, clearUploadMetadata, getUploadMetadataByUploadStatus, deleteDatabase, addDownloadMetadata, getDownloadMetadata, removeDownloadMetadata as removeDownloadMetadataFromDB, getAllDownloadMetadata, clearDownloadMetadata as clearDownloadMetadataFromDB, getDownloadMetadataByDownloadStatus } from './storage/indexeddb-storage.js';
import { UploadStatus } from '../types/index.js';
export class FileManager {
    constructor(dbName = 'file_cache_db') {
        //console.log('FileManager initialized');
        setDBName(dbName);
    }
    async addFile(url, data, contentType) {
        //console.log(`Adding file from URL: ${url}`);
        const fileData = {
            contentType: contentType,
            content: data,
        };
        await addFileToDB(url, fileData);
    }
    async replaceFile(url, data, contentType) {
        //console.log(`Replacing file from URL: ${url}`);
        const fileData = {
            contentType: contentType,
            content: data,
        };
        await replaceFileInDB(url, fileData);
    }
    async removeFile(url) {
        //console.log(`Removing file with URL: ${url}`);
        await removeFileFromDB(url);
    }
    async getFile(url) {
        //console.log(`Getting file with URL: ${url}`);
        return await getFileFromDB(url);
    }
    async getFiles() {
        //console.log('Getting all files');
        return await getAllFilesFromDB();
    }
    async clearFiles() {
        //console.log('Clearing all files');
        try {
            await clearAllFilesFromDB();
            return true;
        }
        catch (error) {
            console.error('Error clearing files:', error);
            throw error; // Re-throw the error to propagate it
        }
    }
    async queueUpload(url, data, contentType, uploadUrl) {
        //console.log(`Queueing upload for URL: ${url}`);
        const fileData = {
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
    async removeUploadMetadata(id) {
        //console.log(`Removing upload metadata with ID: ${id}`);
        await removeUploadMetadataFromDB(id);
    }
    async getAllUploadMetadata() {
        //console.log('Getting all upload metadata');
        return await getAllUploadMetadata();
    }
    async clearUploadMetadata() {
        //console.log('Clearing all upload metadata');
        await clearUploadMetadata();
    }
    async getUploadMetadataByUploadStatus(uploadStatus) {
        //console.log(`Getting upload metadata by upload status: ${uploadStatus}`);
        return await getUploadMetadataByUploadStatus(uploadStatus);
    }
    async deleteStorageDatabase() {
        //console.log('Deleting storage database');
        await deleteDatabase();
    }
    async addDownloadMetadata(fileKey, url, contentType, downloadStatus, lastAccessed) {
        //console.log(`Adding download metadata for fileKey: ${fileKey}`);
        return await addDownloadMetadata({
            fileKey: fileKey,
            url: url,
            contentType: contentType,
            downloadStatus: downloadStatus,
            lastAccessed: lastAccessed,
        });
    }
    async getDownloadMetadata(id) {
        //console.log(`Getting download metadata with ID: ${id}`);
        return await getDownloadMetadata(id);
    }
    async removeDownloadMetadata(id) {
        //console.log(`Removing download metadata with ID: ${id}`);
        await removeDownloadMetadataFromDB(id);
    }
    async getAllDownloadMetadata() {
        //console.log('Getting all download metadata');
        return await getAllDownloadMetadata();
    }
    async clearDownloadMetadata() {
        //console.log('Clearing all download metadata');
        await clearDownloadMetadataFromDB();
    }
    async getDownloadMetadataByDownloadStatus(downloadStatus) {
        //console.log(`Getting download metadata by download status: ${downloadStatus}`);
        return await getDownloadMetadataByDownloadStatus(downloadStatus);
    }
}
