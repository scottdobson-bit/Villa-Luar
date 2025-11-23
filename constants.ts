import { VillaContent } from './types';
// Import directly from the root file. Vite bundles this automatically.
import contentFile from './villa-content.json';

export const ADMIN_PASSWORD = 'zaq1';

export const CALENDLY_URL = 'https://calendly.com/scott-cobellon/new-meeting';

// --- CLOUD CONFIGURATION ---
export const PRODUCTION_CONFIG_URL = ''; 

// Fallback content is now the actual content file at build time
export const INITIAL_CONTENT: VillaContent = contentFile as unknown as VillaContent;