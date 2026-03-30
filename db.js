// CineVault - IndexedDB Database Layer
const DB_NAME = "CineVaultDB";
const DB_VERSION = 2;
const STORE_WATCHLIST = "watchlist";
const STORE_SETTINGS = "settings";

let db = null;

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_WATCHLIST)) {
        const store = database.createObjectStore(STORE_WATCHLIST, { keyPath: "id" });
        store.createIndex("type", "type", { unique: false });
        store.createIndex("watched", "watched", { unique: false });
        store.createIndex("favorite", "favorite", { unique: false });
        store.createIndex("dateAdded", "dateAdded", { unique: false });
        store.createIndex("category", "category", { unique: false });
      }
      if (!database.objectStoreNames.contains(STORE_SETTINGS)) {
        database.createObjectStore(STORE_SETTINGS, { keyPath: "key" });
      }
    };
    request.onsuccess = (e) => { db = e.target.result; resolve(db); };
    request.onerror = (e) => reject(e.target.error);
  });
}

function getStore(storeName, mode = "readonly") {
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

export function addItem(item) {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_WATCHLIST, "readwrite");
    const req = store.add(item);
    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
}

export function updateItem(item) {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_WATCHLIST, "readwrite");
    const req = store.put(item);
    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
}

export function deleteItem(id) {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_WATCHLIST, "readwrite");
    const req = store.delete(id);
    req.onsuccess = () => resolve(id);
    req.onerror = () => reject(req.error);
  });
}

export function getAllItems() {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_WATCHLIST);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function getItem(id) {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_WATCHLIST);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function clearAllItems() {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_WATCHLIST, "readwrite");
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function saveSetting(key, value) {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_SETTINGS, "readwrite");
    const req = store.put({ key, value });
    req.onsuccess = () => resolve(value);
    req.onerror = () => reject(req.error);
  });
}

export function getSetting(key) {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_SETTINGS);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
    req.onerror = () => reject(req.error);
  });
}

export function importItems(items) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_WATCHLIST, "readwrite");
    const store = tx.objectStore(STORE_WATCHLIST);
    items.forEach(item => store.put(item));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
