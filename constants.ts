
import { VillaContent } from './types';
// Import directly from the public file using relative path to ensure bundling
// We use a relative path here assuming constants.ts is in the root alongside the public folder
import contentRaw from './public/villa-content.json';

export const ADMIN_PASSWORD = 'zaq1';

export const CALENDLY_URL = 'https://calendly.com/scott-cobellon/new-meeting';

// --- CLOUD CONFIGURATION ---
export const PRODUCTION_CONFIG_URL = ''; 

// specific helper to unwrap the module if it has a default export
const unwrapContent = (data: any): VillaContent => {
    if (data && typeof data === 'object' && 'default' in data) {
        return data.default as VillaContent;
    }
    return data as VillaContent;
};

// Fallback content is now the actual content file at build time
export const INITIAL_CONTENT: VillaContent = unwrapContent(contentRaw);
