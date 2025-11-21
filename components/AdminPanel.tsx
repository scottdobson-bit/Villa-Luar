
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

const Toast = ({ show, message, isError }: { show: boolean, message?: string, isError?: boolean }) => (
    <div className={`fixed top-8 right-8 ${isError ? 'bg-red-600' : 'bg-green-600'} text-white px-6 py-3 rounded-lg shadow-lg transition-transform duration-300 ease-in-out z-50 ${show ? 'transform translate-x-0' : 'transform translate-x-[calc(100%+2rem)]'}`}
    >
      {message || 'Success!'}
    </div>
);


const AdminPanel = () => {
    const { logout } = useAuth();
    const { saveDraft, discardDraft, isDirty, draftContent, isLoading: isContentLoading } = useContent();
    const [activeTab, setActiveTab] = useState<Tab>('mainImages');
    const [toast, setToast] = useState({ show: false, message: '', isError: false });
    const [activeAction, setActiveAction] = useState<'save' | null>(null);

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', isError: false });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);
    
    const handleSaveDraft = () => {
        setActiveAction('save');
        saveDraft(() => {
            setToast({ show: true, message: 'Draft saved locally!', isError: false });
            setActiveAction(null);
        });
    };
    
    const handleDownloadContentFile = () => {
        if (!draftContent) return;
        try {
            const contentString = JSON.stringify(draftContent, null, 2);
            const blob = new Blob([contentString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'villa-content.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setToast({ show: true, message: 'Content file downloaded successfully.', isError: false });
        } catch (error) {
            console.error('Failed to export content:', error);
            setToast({ show: true, message: 'Failed to download file.', isError: true });
        }
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
             <Toast show={toast.show} message={toast.message} isError={toast.isError} />
            <header className="flex flex-col gap-4 mb-8 pb-4 border-b border-stone-300 dark:border-stone-700">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-white mb-4 md:mb-0">Villa Luar CMS</h1>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                         <a href="#/?preview=true" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-medium text-amber-700 bg-white border border-amber-700 rounded-md hover:bg-amber-50 dark:bg-stone-800 dark:text-amber-500 dark:border-amber-700 dark:hover:bg-stone-700">
                            Preview Site
                        </a>
                        <button 
                            onClick={handleSaveDraft} 
                            disabled={!isDirty || isContentLoading || activeAction !== null} 
                            className="px-6 py-2 text-sm font-medium text-white bg-stone-600 rounded-md hover:bg-stone-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors dark:bg-stone-700 dark:hover:bg-stone-600 dark:disabled:bg-stone-800"
                        >
                            {isContentLoading && activeAction === 'save' ? 'Saving...' : 'Save Draft'}
                        </button>
                         <button 
                            onClick={handleDownloadContentFile} 
                            disabled={isContentLoading}
                            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed shadow-md"
                        >
                           Download Content File
                        </button>
                         <button 
                            onClick={discardDraft} 
                            disabled={!isDirty || isContentLoading || activeAction !== null}
                            className="px-4 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-300 rounded-md hover:bg-stone-50 disabled:bg-stone-200 disabled:cursor-not-allowed dark:bg-stone-800 dark:text-stone-300 dark:border-stone-600 dark:hover:bg-stone-700"
                        >
                            Discard Draft
                        </button>
                        <div className="flex items-center gap-1 border-l pl-2 ml-2 dark:border-stone-600">
                             <button onClick={logout} className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400">
                                Logout
                            </button>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </header>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 mb-8 text-sm text-amber-800 dark:text-amber-200">
                <h3 className="font-bold mb-2">How to Update the Live Website</h3>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Use the editor tabs below to make changes. Your work is saved automatically as a local draft.</li>
                    <li>When you are ready to publish, click the <strong>Download Content File</strong> button. This will save an updated `villa-content.json` file to your computer.</li>
                    <li>In the file explorer on the left, find and <strong>delete</strong> the old `villa-content.json`.</li>
                    <li>Now, <strong>upload</strong> the `villa-content.json` file you just downloaded.</li>
                    <li>Your new content will be live on the website after the next deployment.</li>
                </ol>
            </div>

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
