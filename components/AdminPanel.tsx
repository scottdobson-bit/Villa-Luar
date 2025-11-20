
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import PhotoManager from './PhotoManager';
import TextManager from './TextManager';
import FaqManager from './FaqManager';
import MainImageManager from './MainImageManager';
import LocationManager from './LocationManager';
import ThemeToggle from './ThemeToggle';
import { VillaContent } from '../types';

type Tab = 'mainImages' | 'location' | 'photos' | 'text' | 'faqs';

const SaveSuccessToast = ({ show }: { show: boolean }) => (
    <div className={`fixed top-8 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition-transform duration-300 ease-in-out z-50 ${show ? 'transform translate-x-0' : 'transform translate-x-full'}`}
      style={{ transform: show ? 'translateX(0)' : 'translateX(calc(100% + 2rem))' }}
    >
      Content saved successfully! Don't forget to download the config to publish.
    </div>
);


const AdminPanel = () => {
    const { logout } = useAuth();
    const { updateDraftContent, saveChanges, isDirty, draftContent } = useContent();
    const [activeTab, setActiveTab] = useState<Tab>('mainImages');
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    useEffect(() => {
        if (showSaveSuccess) {
            const timer = setTimeout(() => {
                setShowSaveSuccess(false);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [showSaveSuccess]);
    
    const handleExport = () => {
        const contentToExport = draftContent;
        if (!contentToExport) {
            alert("No content available to export.");
            return;
        }
        try {
            const jsonString = JSON.stringify(contentToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // IMPORTANT: This filename matches what the app looks for in production
            a.download = `villa-content.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert("Config file downloaded! See 'How to Publish' instructions above.");
        } catch (error) {
            console.error("Failed to export content:", error);
            alert("An error occurred while exporting the content.");
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File is not readable");
                let importedContent = JSON.parse(text) as any;
                
                // For backward compatibility, remove viewingSlots if they exist in an old backup
                if (importedContent.viewingSlots) {
                    delete importedContent.viewingSlots;
                }

                if (importedContent.photos && importedContent.textContent && importedContent.faqs) {
                    // Ensure location exists on import
                    if (!importedContent.location) {
                         importedContent.location = {
                             title: 'Location',
                             description: 'Location description placeholder',
                             imageUrl: ''
                         };
                    }

                    updateDraftContent(importedContent as VillaContent);
                    alert('Content imported successfully! Review the changes and click "Save Changes" to apply locally.');
                } else {
                    throw new Error("Invalid content file format.");
                }
            } catch (error) {
                console.error("Failed to import content:", error);
                alert("Failed to import content. Please make sure you are uploading a valid backup file.");
            } finally {
                if(event.target) {
                    event.target.value = '';
                }
            }
        };
        reader.readAsText(file);
    };

    const handleSaveChanges = () => {
        saveChanges(() => setShowSaveSuccess(true));
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'mainImages':
                return <MainImageManager />;
            case 'location':
                return <LocationManager />;
            case 'photos':
                return <PhotoManager />;
            case 'text':
                return <TextManager />;
            case 'faqs':
                return <FaqManager />;
            default:
                return null;
        }
    };
    
    const TabButton = ({ tab, children }: React.PropsWithChildren<{tab: Tab}>) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors relative whitespace-nowrap ${
                activeTab === tab 
                ? 'text-amber-700 dark:text-amber-500' 
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
        >
             <div className="flex items-center gap-2">
              {children}
            </div>
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-700 dark:bg-amber-500"></div>}
        </button>
    );

    return (
        <div className="p-4 md:p-8 bg-stone-100 dark:bg-stone-900 min-h-screen">
             <SaveSuccessToast show={showSaveSuccess} />
            <header className="flex flex-col gap-4 mb-8 pb-4 border-b border-stone-300 dark:border-stone-700">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-white mb-4 md:mb-0">Villa Luar CMS</h1>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <a href="/#/?preview=true" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-medium text-amber-700 bg-white border border-amber-700 rounded-md hover:bg-amber-50 dark:bg-stone-800 dark:text-amber-500 dark:border-amber-700 dark:hover:bg-stone-700">
                            Preview Site
                        </a>
                         <button onClick={handleExport} className="px-4 py-2 text-sm font-medium text-amber-700 bg-white border border-amber-700 rounded-md hover:bg-amber-50 dark:bg-stone-800 dark:text-amber-500 dark:border-amber-700 dark:hover:bg-stone-700 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Config
                        </button>
                        <label htmlFor="import-input" className="px-4 py-2 text-sm font-medium text-amber-700 bg-white border border-amber-700 rounded-md hover:bg-amber-50 cursor-pointer dark:bg-stone-800 dark:text-amber-500 dark:border-amber-700 dark:hover:bg-stone-700">
                            Import Config
                        </label>
                        <input id="import-input" type="file" accept=".json" className="hidden" onChange={handleImport} />
                        <button 
                            onClick={handleSaveChanges} 
                            disabled={!isDirty} 
                            className="px-6 py-2 text-sm font-medium text-white bg-amber-700 rounded-md hover:bg-amber-800 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors dark:hover:bg-amber-600 dark:disabled:bg-stone-600"
                        >
                            Save Changes
                        </button>
                        <button onClick={logout} className="px-4 py-2 text-sm font-medium text-white bg-stone-600 rounded-md hover:bg-stone-700 dark:bg-stone-700 dark:hover:bg-stone-600">
                            Logout
                        </button>
                        <ThemeToggle />
                    </div>
                </div>
                
                {/* Publishing Help Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">How to Publish to Cloud Run:</p>
                    <p className="mb-2">Since Cloud Run is "read-only", you cannot upload directly to the server. Choose one of these methods:</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-2">
                        <div className="bg-white dark:bg-stone-800 p-3 rounded border border-blue-100 dark:border-blue-900">
                            <strong className="block text-amber-700 dark:text-amber-500 mb-1">Option 1: Re-Deploy (Simplest)</strong>
                            <ol className="list-decimal list-inside space-y-1 ml-1 text-xs">
                                <li>Click <strong>Download Config</strong> above.</li>
                                <li>Place <code>villa-content.json</code> in your project's <code>public/</code> folder.</li>
                                <li>Re-build and re-deploy your Cloud Run service.</li>
                            </ol>
                        </div>
                        <div className="bg-white dark:bg-stone-800 p-3 rounded border border-blue-100 dark:border-blue-900">
                             <strong className="block text-amber-700 dark:text-amber-500 mb-1">Option 2: External Bucket (Recommended)</strong>
                            <ol className="list-decimal list-inside space-y-1 ml-1 text-xs">
                                <li>Upload the config to a <strong>public Google Cloud Storage Bucket</strong>.</li>
                                <li>Paste the bucket URL into <code>constants.ts</code> (PRODUCTION_CONFIG_URL).</li>
                                <li>Configure CORS on your bucket.</li>
                                <li>Deploy the code once. Future updates only require a file upload.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex items-center space-x-2 border-b border-stone-200 dark:border-stone-700 mb-8 overflow-x-auto">
                <TabButton tab="mainImages">Main Images</TabButton>
                <TabButton tab="location">Location</TabButton>
                <TabButton tab="photos">Photo Gallery</TabButton>
                <TabButton tab="text">Page Text</TabButton>
                <TabButton tab="faqs">Chatbot FAQs</TabButton>
            </div>

            <main className="bg-white p-6 rounded-lg shadow-md dark:bg-stone-800">
                {renderTabContent()}
            </main>
        </div>
    );
};

export default AdminPanel;
