
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

const SaveSuccessToast = ({ show, message }: { show: boolean, message?: string }) => (
    <div className={`fixed top-8 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition-transform duration-300 ease-in-out z-50 ${show ? 'transform translate-x-0' : 'transform translate-x-full'}`}
      style={{ transform: show ? 'translateX(0)' : 'translateX(calc(100% + 2rem))' }}
    >
      {message || 'Draft saved locally!'}
    </div>
);


const AdminPanel = () => {
    const { logout } = useAuth();
    const { updateDraftContent, saveChanges, isDirty, draftContent } = useContent();
    const [activeTab, setActiveTab] = useState<Tab>('mainImages');
    const [toast, setToast] = useState({ show: false, message: '' });

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '' });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);
    
    const handleCopyForAI = async () => {
        const contentToExport = draftContent;
        if (!contentToExport) {
            alert("No content available to export.");
            return;
        }
        try {
            const jsonString = JSON.stringify(contentToExport, null, 2);
            await navigator.clipboard.writeText(jsonString);
            setToast({ show: true, message: "Data copied! Paste it to the AI developer now." });
        } catch (error) {
            console.error("Failed to copy content:", error);
            // Fallback for older browsers
            try {
                const textarea = document.createElement('textarea');
                textarea.value = JSON.stringify(contentToExport, null, 2);
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                setToast({ show: true, message: "Data copied! Paste it to the AI developer now." });
            } catch (e) {
                alert("Could not copy automatically. Please export the file instead.");
            }
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
                
                // For backward compatibility cleanup
                if (importedContent.viewingSlots) delete importedContent.viewingSlots;

                if (importedContent.photos && importedContent.textContent && importedContent.faqs) {
                    if (!importedContent.location) {
                         importedContent.location = {
                             title: 'Location',
                             description: 'Location description placeholder',
                             imageUrl: ''
                         };
                    }
                    updateDraftContent(importedContent as VillaContent);
                    alert('Content imported successfully! Review the changes and click "Save Draft".');
                } else {
                    throw new Error("Invalid content file format.");
                }
            } catch (error) {
                console.error("Failed to import content:", error);
                alert("Failed to import content. Invalid file.");
            } finally {
                if(event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleSaveChanges = () => {
        saveChanges(() => setToast({ show: true, message: 'Draft saved locally!' }));
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
             <SaveSuccessToast show={toast.show} message={toast.message} />
            <header className="flex flex-col gap-4 mb-8 pb-4 border-b border-stone-300 dark:border-stone-700">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-white mb-4 md:mb-0">Villa Luar CMS</h1>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <a href="/#/?preview=true" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-medium text-amber-700 bg-white border border-amber-700 rounded-md hover:bg-amber-50 dark:bg-stone-800 dark:text-amber-500 dark:border-amber-700 dark:hover:bg-stone-700">
                            Preview Site
                        </a>
                        
                        <label htmlFor="import-input" className="px-4 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-300 rounded-md hover:bg-stone-50 cursor-pointer dark:bg-stone-800 dark:text-stone-300 dark:border-stone-600 dark:hover:bg-stone-700">
                            Import Backup
                        </label>
                        <input id="import-input" type="file" accept=".json" className="hidden" onChange={handleImport} />
                        
                        <button 
                            onClick={handleSaveChanges} 
                            disabled={!isDirty} 
                            className="px-6 py-2 text-sm font-medium text-white bg-stone-600 rounded-md hover:bg-stone-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors dark:bg-stone-700 dark:hover:bg-stone-600 dark:disabled:bg-stone-800"
                        >
                            Save Draft
                        </button>
                        <button onClick={logout} className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400">
                            Logout
                        </button>
                        <ThemeToggle />
                    </div>
                </div>
                
                {/* AI Deployment Workflow Box */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-amber-900 dark:text-amber-100">
                            <p className="font-bold text-lg mb-1 flex items-center gap-2">
                                <span className="text-xl">🤖</span> How to Publish Changes Live
                            </p>
                            <ol className="list-decimal list-inside mt-2 space-y-1 ml-1">
                                <li>Make your edits here and click <strong>Save Draft</strong>.</li>
                                <li>Click the <strong>Copy Data for AI</strong> button on the right.</li>
                                <li>Paste the data into the chat with me (the AI) and say: <em>"Update the app with this data."</em></li>
                                <li>I will update the code, and your changes will be live on the next deploy!</li>
                            </ol>
                        </div>
                         <button 
                            onClick={handleCopyForAI} 
                            className="flex-shrink-0 px-6 py-4 bg-amber-700 text-white font-bold rounded-lg shadow-lg hover:bg-amber-800 transform hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            Copy Data for AI
                        </button>
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
