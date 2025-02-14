import { Message } from "@/types/chat";

const DB_NAME = "toybot_db";
const DB_VERSION = 1;
const CHAT_STORE = "chat_histories";

export interface ChatHistory {
  id: string;
  characterId: string;
  characterName: string; // Add this line
  messages: Message[];
  lastUpdated: Date;
}

let db: IDBDatabase | null = null;

export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve();
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(CHAT_STORE)) {
        const store = db.createObjectStore(CHAT_STORE, { keyPath: "id" });
        store.createIndex("characterId", "characterId", { unique: false });
        store.createIndex("characterName", "characterName", { unique: false }); // Add this line
        store.createIndex("lastUpdated", "lastUpdated", { unique: false });
      }
    };
  });
};

const openDB = async (): Promise<IDBDatabase> => {
  if (!db) {
    await initDB();
  }
  if (!db) {
    throw new Error("Database failed to initialize");
  }
  return db;
};

export const saveChatHistory = async (
  chatHistory: ChatHistory
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const tx = db.transaction(CHAT_STORE, "readwrite");
      const store = tx.objectStore(CHAT_STORE);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);

      store.put(chatHistory);
    } catch (error) {
      reject(error);
    }
  });
};

export const getChatHistory = async (
  id: string
): Promise<ChatHistory | null> => {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(CHAT_STORE, "readonly");
    const store = tx.objectStore(CHAT_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as ChatHistory | null);
    request.onerror = () => reject(request.error);
  });
};

export const getAllChatHistories = async (): Promise<ChatHistory[]> => {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(CHAT_STORE, "readonly");
    const store = tx.objectStore(CHAT_STORE);
    const index = store.index("lastUpdated");
    const request = index.getAll();

    request.onsuccess = () => resolve(request.result as ChatHistory[]);
    request.onerror = () => reject(request.error);
  });
};

export const getCharacterChatHistories = async (
  characterId?: string
): Promise<ChatHistory[]> => {
  // If no characterId is provided, return all chat histories
  if (!characterId) {
    return getAllChatHistories();
  }

  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(CHAT_STORE, "readonly");
    const store = tx.objectStore(CHAT_STORE);
    const index = store.index("characterId");
    const request = index.getAll(characterId);

    request.onsuccess = () => resolve(request.result as ChatHistory[]);
    request.onerror = () => reject(request.error);
  });
};
