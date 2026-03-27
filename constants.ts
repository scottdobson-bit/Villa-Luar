
import { VillaContent } from './types';
// Import directly from the public file using relative path to ensure bundling
import contentRaw from './public/villa-content.json';

// SHA-256 hash of the admin password.
// Set VITE_ADMIN_PASSWORD_HASH in your .env file to override.
// Default hash below = "zaq1" — CHANGE THIS before deploying.
// Generate a new hash: echo -n "your-password" | sha256sum
export const ADMIN_PASSWORD_HASH: string =
  import.meta.env.VITE_ADMIN_PASSWORD_HASH ||
  'e3b5bb054314c83c36f62926885156f41d55c20b1060e4456dab4c79f3ced83a';

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
