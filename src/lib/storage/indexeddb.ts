/**
 * IndexedDB Wrapper
 * Promise-based IndexedDB wrapper for efficient local storage
 */

import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

export interface DBConfig {
    name: string;
    version: number;
    stores: StoreConfig[];
}

export interface StoreConfig {
    name: string;
    keyPath: string;
    indexes?: IndexConfig[];
    autoIncrement?: boolean;
}

export interface IndexConfig {
    name: string;
    keyPath: string;
    unique?: boolean;
    multiEntry?: boolean;
}

export interface DBOperation<T> {
    success: boolean;
    data?: T;
    error?: string;
}

class IndexedDBWrapper {
    private db: IDBDatabase | null = null;
    private dbName: string = '';
    private version: number = 1;
    private ready: Promise<void>;

    constructor(config: DBConfig) {
        this.dbName = config.name;
        this.version = config.version;
        this.ready = this.initDB(config);
    }

    private initDB(config: DBConfig): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(config.name, config.version);

            request.onerror = () => {
                reject(new Error(`Failed to open database: ${config.name}`));
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                config.stores.forEach((storeConfig) => {
                    if (!db.objectStoreNames.contains(storeConfig.name)) {
                        const store = db.createObjectStore(
                            storeConfig.name,
                            storeConfig.autoIncrement
                                ? { keyPath: storeConfig.keyPath, autoIncrement: true }
                                : { keyPath: storeConfig.keyPath }
                        );

                        storeConfig.indexes?.forEach((index) => {
                            store.createIndex(index.name, index.keyPath, {
                                unique: index.unique || false,
                                multiEntry: index.multiEntry || false,
                            });
                        });
                    }
                });
            };
        });
    }

    async waitForReady(): Promise<void> {
        await this.ready;
    }

    private ensureDB(): IDBDatabase {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        return this.db;
    }

    async put<T>(storeName: string, data: T, key?: IDBValidKey): Promise<DBOperation<IDBValidKey>> {
        await this.ready;

        return new Promise((resolve) => {
            const db = this.ensureDB();
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            // Compress large data
            const serialized = JSON.stringify(data);
            const compressed = serialized.length > 10000
                ? compressToUTF16(serialized)
                : serialized;

            const request = key
                ? store.put({ ...data as object, _compressed: serialized.length > 10000 } as T, key)
                : store.put(compressed);

            request.onsuccess = () => {
                resolve({ success: true, data: request.result });
            };

            request.onerror = () => {
                resolve({ success: false, error: request.error?.message });
            };
        });
    }

    async get<T>(storeName: string, key: IDBValidKey): Promise<DBOperation<T>> {
        await this.ready;

        return new Promise((resolve) => {
            const db = this.ensureDB();
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => {
                if (request.result) {
                    const data = request.result as T & { _compressed?: boolean };
                    if (data._compressed && typeof data === 'object') {
                        // Decompress data
                        try {
                            const decompressed = decompressFromUTF16(JSON.stringify(data));
                            if (decompressed) {
                                resolve({ success: true, data: JSON.parse(decompressed) as T });
                                return;
                            }
                        } catch (e) {
                            // Fall through to return original
                        }
                    }
                    resolve({ success: true, data: request.result as T });
                } else {
                    resolve({ success: false, error: 'Not found' });
                }
            };

            request.onerror = () => {
                resolve({ success: false, error: request.error?.message });
            };
        });
    }

    async getAll<T>(storeName: string, query?: IDBValidKey | IDBKeyRange): Promise<DBOperation<T[]>> {
        await this.ready;

        return new Promise((resolve) => {
            const db = this.ensureDB();
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = query ? store.getAll(query) : store.getAll();

            request.onsuccess = () => {
                resolve({ success: true, data: request.result as T[] });
            };

            request.onerror = () => {
                resolve({ success: false, error: request.error?.message });
            };
        });
    }

    async getAllByIndex<T>(
        storeName: string,
        indexName: string,
        query?: IDBValidKey | IDBKeyRange
    ): Promise<DBOperation<T[]>> {
        await this.ready;

        return new Promise((resolve) => {
            const db = this.ensureDB();
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = query ? index.getAll(query) : index.getAll();

            request.onsuccess = () => {
                resolve({ success: true, data: request.result as T[] });
            };

            request.onerror = () => {
                resolve({ success: false, error: request.error?.message });
            };
        });
    }

    async getFromIndex<T>(
        storeName: string,
        indexName: string,
        query: IDBValidKey | IDBKeyRange
    ): Promise<DBOperation<T>> {
        await this.ready;

        return new Promise((resolve) => {
            const db = this.ensureDB();
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.get(query);

            request.onsuccess = () => {
                if (request.result) {
                    resolve({ success: true, data: request.result as T });
                } else {
                    resolve({ success: false, error: 'Not found' });
                }
            };

            request.onerror = () => {
                resolve({ success: false, error: request.error?.message });
            };
        });
    }

    async delete(storeName: string, key: IDBValidKey): Promise<DBOperation<void>> {
        await this.ready;

        return new Promise((resolve) => {
            const db = this.ensureDB();
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => {
                resolve({ success: true });
            };

            request.onerror = () => {
                resolve({ success: false, error: request.error?.message });
            };
        });
    }

    async clear(storeName: string): Promise<DBOperation<void>> {
        await this.ready;

        return new Promise((resolve) => {
            const db = this.ensureDB();
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => {
                resolve({ success: true });
            };

            request.onerror = () => {
                resolve({ success: false, error: request.error?.message });
            };
        });
    }

    async count(storeName: string, query?: IDBValidKey | IDBKeyRange): Promise<DBOperation<number>> {
        await this.ready;

        return new Promise((resolve) => {
            const db = this.ensureDB();
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = query ? store.count(query) : store.count();

            request.onsuccess = () => {
                resolve({ success: true, data: request.result });
            };

            request.onerror = () => {
                resolve({ success: false, error: request.error?.message });
            };
        });
    }

    async deleteDatabase(): Promise<DBOperation<void>> {
        return new Promise((resolve) => {
            const request = indexedDB.deleteDatabase(this.dbName);

            request.onsuccess = () => {
                this.db = null;
                resolve({ success: true });
            };

            request.onerror = () => {
                resolve({ success: false, error: request.error?.message });
            };
        });
    }

    async getStorageUsage(): Promise<DBOperation<{ usage: number; quota: number }>> {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                success: true,
                data: {
                    usage: estimate.usage || 0,
                    quota: estimate.quota || 0,
                },
            };
        }
        return { success: false, error: 'Storage API not supported' };
    }
}

// Database configuration
const DB_CONFIG: DBConfig = {
    name: 'gnexus-chat-db',
    version: 2,
    stores: [
        {
            name: 'sessions',
            keyPath: 'id',
            indexes: [
                { name: 'by_updated', keyPath: 'updated_at' },
                { name: 'by_pinned', keyPath: 'pinned' },
                { name: 'by_created', keyPath: 'created_at' },
            ],
        },
        {
            name: 'messages',
            keyPath: 'id',
            indexes: [
                { name: 'by_session', keyPath: 'session_id' },
                { name: 'by_created', keyPath: 'created_at' },
                { name: 'by_role', keyPath: 'role' },
            ],
        },
        {
            name: 'attachments',
            keyPath: 'id',
            indexes: [
                { name: 'by_message', keyPath: 'message_id' },
            ],
        },
        {
            name: 'settings',
            keyPath: 'key',
        },
        {
            name: 'tool_cache',
            keyPath: 'id',
            indexes: [
                { name: 'by_tool_input', keyPath: 'tool_id-input_hash', unique: true },
                { name: 'by_tool', keyPath: 'tool_id' },
                { name: 'by_expires', keyPath: 'expires_at' },
            ],
        },
        {
            name: 'tool_history',
            keyPath: 'id',
            indexes: [
                { name: 'by_session', keyPath: 'session_id' },
                { name: 'by_tool', keyPath: 'tool_id' },
                { name: 'by_created', keyPath: 'created_at' },
            ],
        },
        {
            name: 'tool_favorites',
            keyPath: 'id',
            indexes: [
                { name: 'by_user', keyPath: 'user_id' },
            ],
        },
    ],
};

// Singleton instance
let dbInstance: IndexedDBWrapper | null = null;

export function getDatabase(): IndexedDBWrapper {
    if (!dbInstance) {
        dbInstance = new IndexedDBWrapper(DB_CONFIG);
    }
    return dbInstance;
}

export type { IndexedDBWrapper };
