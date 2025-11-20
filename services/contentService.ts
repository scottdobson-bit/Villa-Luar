
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
        // For put/delete, the result might not be relevant, but for get it is.
        // We rely on request.result usually.
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

const migrateLegacyData = (content: any): VillaContent => {
     // MIGRATION LOGIC: If old photos array exists but no gallerySections, migrate.
    if (content.photos && content.photos.length > 0 && (!content.gallerySections || content.gallerySections.length === 0)) {
            console.log("Migrating flat photos to sections...");
            const migratedSections = JSON.parse(JSON.stringify(INITIAL_CONTENT.gallerySections));
            // Put all existing photos into the first subsection of the first section as a default
            if (migratedSections[0] && migratedSections[0].subSections[0]) {
                migratedSections[0].subSections[0].photos = content.photos;
            }
            content.gallerySections = migratedSections;
            content.photos = []; // Clear flat list
    }
    
    // Ensure gallerySections exists
    if (!content.gallerySections) {
            content.gallerySections = INITIAL_CONTENT.gallerySections;
    }
    
    // Ensure location exists
    if (!content.location) {
        content.location = INITIAL_CONTENT.location;
    }

    return content;
};

const rehydrateDraftFromSession = (draftMeta: any, liveContent: VillaContent): VillaContent => {
    const hydrated = JSON.parse(JSON.stringify(liveContent));
    
    // Merge metadata fields
    hydrated.textContent = { ...hydrated.textContent, ...draftMeta.textContent };
    hydrated.faqs = draftMeta.faqs ?? hydrated.faqs;
    hydrated.logoUrl = draftMeta.logoUrl ?? hydrated.logoUrl;
    hydrated.faviconUrl = draftMeta.faviconUrl ?? hydrated.faviconUrl;
    
    // Hydrate Gallery
    if (draftMeta.gallerySections) {
        hydrated.gallerySections = draftMeta.gallerySections.map((section: PhotoSection) => ({
            ...section,
            subSections: section.subSections.map((sub: any) => ({
                ...sub,
                photos: sub.photos.map((photo: any) => {
                    if (photo.url && photo.url.startsWith('draft-')) {
                        const photoUrl = sessionStorage.getItem(photo.url);
                        if (photoUrl) return { ...photo, url: photoUrl };
                        // Fallback to finding in live content
                         for (const liveSection of liveContent.gallerySections) {
                            for (const liveSub of liveSection.subSections) {
                                const original = liveSub.photos.find((p: VillaPhoto) => p.id === photo.id);
                                if (original) return original;
                            }
                        }
                        return null;
                    }
                    return photo;
                }).filter((p: any): p is VillaPhoto => p !== null)
            }))
        }));
    }

    // Hydrate single images
    const hydrateImage = (key: string | undefined, storageKeyPrefix: string, fallback: string) => {
        if (key && key.startsWith(storageKeyPrefix)) {
            const stored = sessionStorage.getItem(key);
            return stored || fallback;
        }
        return key || fallback;
    };

    hydrated.textContent.heroImageUrl = hydrateImage(draftMeta.textContent.heroImageUrl, 'draft-', liveContent.textContent.heroImageUrl);
    hydrated.logoUrl = hydrateImage(draftMeta.logoUrl, 'draft-', liveContent.logoUrl || '');
    hydrated.faviconUrl = hydrateImage(draftMeta.faviconUrl, 'draft-', liveContent.faviconUrl || '');
    
    // Hydrate Location
    if (draftMeta.location || liveContent.location) {
        hydrated.location = { ... (liveContent.location || INITIAL_CONTENT.location), ...(draftMeta.location || {}) };
        hydrated.location.imageUrl = hydrateImage(draftMeta.location?.imageUrl, 'draft-', liveContent.location?.imageUrl || INITIAL_CONTENT.location.imageUrl);
    }

    return hydrated;
};

// Perform one-time migration from localStorage/sessionStorage to IndexedDB
const migrateFromLocalStorage = async () => {
    const CONTENT_STORAGE_KEY = 'villaContent';
    const DRAFT_CONTENT_STORAGE_KEY = 'villaDraftContent';

    // 1. Migrate Live Content
    const storedContent = localStorage.getItem(CONTENT_STORAGE_KEY);
    let liveContent = INITIAL_CONTENT;

    if (storedContent) {
        try {
            const parsed = JSON.parse(storedContent);
            if (isValidContent(parsed)) {
                liveContent = migrateLegacyData(parsed);
                await dbAction(LIVE_STORE, 'readwrite', store => store.put(liveContent, 'content'));
                console.log("Migrated live content to IndexedDB");
            }
        } catch (e) {
            console.error("Migration error (Live):", e);
        }
        localStorage.removeItem(CONTENT_STORAGE_KEY);
    } 
    // NOTE: Removed auto-seeding of INITIAL_CONTENT to DB here.
    // We want the app to fall back to server JSON or INITIAL_CONTENT constant if DB is empty,
    // rather than locking the user into a local copy of the initial state.

    // 2. Migrate Draft Content
    const storedDraftMeta = localStorage.getItem(DRAFT_CONTENT_STORAGE_KEY);
    if (storedDraftMeta) {
        try {
            const parsedMeta = JSON.parse(storedDraftMeta);
            // We need the base live content to hydrate against
            // Since we just migrated live content (or have it), we can use the current 'liveContent' variable
            // providing it was set correctly above.
            
            const hydratedDraft = rehydrateDraftFromSession(parsedMeta, liveContent);
            
            await dbAction(DRAFT_STORE, 'readwrite', store => store.put(hydratedDraft, 'content'));
            console.log("Migrated draft content to IndexedDB");
            
            // Cleanup session storage
            Object.keys(sessionStorage).filter(k => k.startsWith('draft-')).forEach(k => sessionStorage.removeItem(k));
        } catch (e) {
            console.error("Migration error (Draft):", e);
        }
        localStorage.removeItem(DRAFT_CONTENT_STORAGE_KEY);
    }
};

// --- Public API ---

export const getContent = async (): Promise<VillaContent> => {
  try {
    await migrateFromLocalStorage(); // Ensure migration runs if needed
    
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    // STRATEGY: 
    // 1. If Logged In (Admin): Prioritize IndexedDB to show local work-in-progress.
    // 2. If Public: Prioritize 'villa-content.json' from server to show deployed content.
    
    if (isLoggedIn) {
        const localContent = await dbAction<VillaContent>(LIVE_STORE, 'readonly', store => store.get('content'));
        if (localContent) {
            // Ensure backward compatibility for new fields
            if (!localContent.location) localContent.location = INITIAL_CONTENT.location;
            return localContent;
        }
    }

    // If we are public, OR if we are admin but have no local data yet, try fetching server config
    try {
        // Determine fetch URL: either external (Bucket) or local file
        const fetchUrl = PRODUCTION_CONFIG_URL || './villa-content.json';
        
        // Add timestamp to prevent caching of the config file
        const separator = fetchUrl.includes('?') ? '&' : '?';
        const response = await fetch(`${fetchUrl}${separator}t=${new Date().getTime()}`);
        
        if (response.ok) {
            const serverContent = await response.json();
            if (isValidContent(serverContent)) {
                if (!serverContent.location) serverContent.location = INITIAL_CONTENT.location;
                return serverContent;
            }
        }
    } catch (e) {
        // Silent fail, file might not exist yet (local dev or not uploaded)
        console.warn("Could not load server content:", e);
    }
    
    return INITIAL_CONTENT;
  } catch (error) {
    console.error("Failed to get content:", error);
    return INITIAL_CONTENT;
  }
};

export const saveContent = async (content: VillaContent): Promise<void> => {
  try {
    await dbAction(LIVE_STORE, 'readwrite', store => store.put(content, 'content'));
  } catch (error) {
    console.error("Failed to save content to DB:", error);
    throw error; // Re-throw so UI can show error if needed
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
    alert("Failed to save draft changes. The website's total data size is too large for browser storage. Please try removing one or two photos from the gallery and save again.");
  }
};

export const clearDraftContent = async (): Promise<void> => {
  try {
    await dbAction(DRAFT_STORE, 'readwrite', store => store.delete('content'));
  } catch (error) {
    console.error("Failed to clear draft from DB:", error);
  }
};
