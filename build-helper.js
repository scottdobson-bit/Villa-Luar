import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootPath = process.cwd();
const rootFile = path.join(rootPath, 'villa-content.json');
const destDir = path.join(rootPath, 'public');
const destFile = path.join(destDir, 'villa-content.json');

console.log('--- Build Helper: Content Sync ---');

// Ensure public directory exists
if (!fs.existsSync(destDir)){
    fs.mkdirSync(destDir, { recursive: true });
}

const rootExists = fs.existsSync(rootFile);
const destExists = fs.existsSync(destFile);

if (rootExists) {
    const rootStats = fs.statSync(rootFile);
    console.log(`[Root Source] Found: ${(rootStats.size / 1024).toFixed(2)} KB`);

    let shouldCopy = true;

    if (destExists) {
        const destStats = fs.statSync(destFile);
        console.log(`[Public Dest] Found: ${(destStats.size / 1024).toFixed(2)} KB`);

        // PROTECTION: If root file is smaller than public file (e.g., root is 5KB default, public is 6MB real data),
        // we DO NOT overwrite. This handles cases where user updated public/ locally but left a stale file in root.
        if (rootStats.size < destStats.size) {
            console.log('⚠️  PROTECTION ACTIVE: Root file is smaller than Public file.');
            console.log('   Skipping overwrite to preserve the larger (likely correct) content file.');
            shouldCopy = false;
        }
    }

    if (shouldCopy) {
        console.log(`Copying Root -> Public...`);
        try {
            fs.copyFileSync(rootFile, destFile);
            console.log('✅ Success: Synced content to public folder.');
        } catch (err) {
            console.error('❌ Error copying content file:', err);
            process.exit(1);
        }
    }
} else {
    console.log('ℹ️  No Root file found. Using existing Public file.');
    
    // Fallback: If absolutely no content file exists, create a minimal one to prevent build failure
    if (!destExists) {
        console.warn('⚠️  No content file found anywhere! Creating minimal placeholder.');
        const defaultContent = { gallerySections: [], photos: [], textContent: {}, faqs: [] };
        fs.writeFileSync(destFile, JSON.stringify(defaultContent, null, 2));
    }
}

console.log('----------------------------------');