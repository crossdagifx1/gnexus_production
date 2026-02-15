
/**
 * Storage Configuration
 */

// TOGGLE STORAGE MODE: 'local' | 'mysql'
// Set to 'mysql' to use the cPanel PHP API
// Set to 'local' to use IndexedDB in the browser
export const STORAGE_MODE: 'local' | 'mysql' = 'local';

export const useMySQL = (STORAGE_MODE as string) === 'mysql';
