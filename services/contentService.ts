
import { VillaContent, VillaPhoto, PhotoSection } from '../types';
import { INITIAL_CONTENT, PRODUCTION_CONFIG_URL } from '../constants';

const DB_NAME = 'VillaLuarDB';
const DB_VERSION = 1;
const LIVE_STORE = 'liveContent';
const DRAFT_STORE = 'draftContent';

// --- IndexedDB Helpers ---

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(LIVE_STORE)) {
        db.createObjectStore(LIVE_STORE);
      }
      if (!db.objectStoreNames.contains(DRAFT_STORE)) {
        db.createObjectStore(DRAFT_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const dbAction = async <T>(
  storeName: string, 
  mode: IDBTransactionMode, 
  action: (store: IDBObjectStore) => IDBRequest
): Promise<T> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = action(store);
    
    tx.oncomplete = () => {
        // For put/delete, the result might not be relevant
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// --- Validation & Migration Logic ---

const isValidContent = (content: any): content is VillaContent => {
  return content && 
         content.textContent &&
         content.textContent.considerationsTitle !== undefined &&
         content.textContent.considerationsText !== undefined &&
         Array.isArray(content.faqs);
};

// --- Public API ---

export const getContent = async (): Promise<VillaContent> => {
  try {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    // 1. If logged in, try to get local work-in-progress content first
    if (isLoggedIn) {
        try {
            const draftContent = await dbAction<VillaContent>(DRAFT_STORE, 'readonly', store => store.get('content'));
            if (draftContent) {
                if (!draftContent.location) draftContent.location = INITIAL_CONTENT.location;
                return draftContent;
            }
        } catch (e) {
            console.log("No draft content found, falling back.");
        }
    }

    // 2. If not logged in (Public), OR if no local draft exists, FETCH THE FILE
    // This is the critical path for the live site.
    try {
        // Use absolute path to ensure we load the local project file
        const fetchUrl = '/villa-content.json';
        
        // Add timestamp to bust cache
        const separator = fetchUrl.includes('?') ? '&' : '?';
        const response = await fetch(`${fetchUrl}${separator}t=${new Date().getTime()}`);
        
        if (response.ok) {
            const serverContent = await response.json();
            if (isValidContent(serverContent)) {
                // Ensure new fields exist if loading older JSON
                if (!serverContent.location) serverContent.location = INITIAL_CONTENT.location;
                return serverContent;
            }
        } else {
            console.warn(`Could not load ${fetchUrl}, status: ${response.status}`);
        }
    } catch (e) {
        console.warn("Could not load server content (villa-content.json). Loading defaults.", e);
    }
    
    // 3. Absolute fallback
    return INITIAL_CONTENT;
  } catch (error) {
    console.error("Failed to get content:", error);
    return INITIAL_CONTENT;
  }
};

export const getDraftContent = async (): Promise<VillaContent | null> => {
  try {
    const content = await dbAction<VillaContent>(DRAFT_STORE, 'readonly', store => store.get('content'));
    if (content && !content.location) {
        content.location = INITIAL_CONTENT.location;
    }
    return content || null;
  } catch (error) {
    console.error("Failed to get draft from DB:", error);
    return null;
  }
};

export const saveDraftContent = async (content: VillaContent): Promise<void> => {
  try {
    await dbAction(DRAFT_STORE, 'readwrite', store => store.put(content, 'content'));
  } catch (error) {
    console.error("Failed to save draft to DB:", error);
    // The image optimizer should prevent this, but if it happens:
    alert("Failed to save changes locally. The images are still too large. Please try uploading smaller images.");
  }
};

export const clearDraftContent = async (): Promise<void> => {
  try {
    await dbAction(DRAFT_STORE, 'readwrite', store => store.delete('content'));
  } catch (error) {
    console.error("Failed to clear draft from DB:", error);
  }
};
