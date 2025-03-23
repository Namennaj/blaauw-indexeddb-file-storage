import { FileManager } from './lib/FileManager.js';
export const initialize = (dbName) => {
    //console.log('Application initializing...');
    const fileManager = new FileManager(dbName);
    //console.log('Application initialized.');
    return fileManager;
};
initialize();
