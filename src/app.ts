import { FileManager } from './lib/FileManager.js';

export const initialize = (dbName?: string): FileManager => {
  //console.log('Application initializing...');
  const fileManager = new FileManager(dbName);
  //console.log('Application initialized.');
  return fileManager;
};

initialize();