
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
import { publishContent } from '../services/contentService';

type Tab = 'mainImages' | 'location' | 'photos' | 'text' | 'faqs' | 'bookings';

// ─── Bookings Manager ─────────────────────────────────────────────────────────

interface AdminSlot {
  id: string;
  datetime: string;
  label: string;
  booked: boolean;
}

interface AdminBooking {
  id: string;
  slotId: string;
  slotLabel: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  bookedAt: string;
}

const BookingsManager = ({ apiToken }: { apiToken: string }) => {
  const [slots, setSlots] = useState<AdminSlot[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDatetime, setNewDatetime] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<'slots' | 'bookings'>('slots');

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` };

  const loadAll = async () => {
    setLoading(true);
    const [slotsRaw, bookingsRaw] = await Promise.all([
      fetch('/api/slots').then(r => r.json() as Promise<AdminSlot[]>).catch(() => [] as AdminSlot[]),
      fetch('/api/bookings', { headers }).then(r => r.json() as Promise<AdminBooking[]>).catch(() => [] as AdminBooking[]),
    ]);
    // Merge: also fetch all slots including booked ones via bookings data
    const allSlotIds = new Set(slotsRaw.map((s: AdminSlot) => s.id));
    const bookedSlots: AdminSlot[] = bookingsRaw.map((b: AdminBooking) => ({
      id: b.slotId,
      datetime: '',
      label: b.slotLabel,
      booked: true,
    })).filter((s: AdminSlot) => !allSlotIds.has(s.id));
    setSlots([...slotsRaw, ...bookedSlots].sort((a, b) => a.label.localeCompare(b.label)));
    setBookings(bookingsRaw);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const addSlot = async () => {
    if (!newDatetime) return;
    setSaving(true);
    const dt = new Date(newDatetime);
    const label = dt.toLocaleString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    });
    await fetch('/api/slots', {
      method: 'POST',
      headers,
      body: JSON.stringify({ datetime: dt.toISOString(), label }),
    });
    setNewDatetime('');
    await loadAll();
    setSaving(false);
  };

  const deleteSlot = async (id: string) => {
    if (!confirm('Delete this slot?')) return;
    await fetch(`/api/slots/${id}`, { method: 'DELETE', headers });
    await loadAll();
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Cancel this booking and restore the slot?')) return;
    await fetch(`/api/bookings/${id}`, { method: 'DELETE', headers });
    await loadAll();
  };

  if (loading) return <p className="text-stone-500 p-4">Loading…</p>;

  return (
    <div className="space-y-6">
      {/* Sub-nav */}
      <div className="flex gap-4 border-b border-stone-200 dark:border-stone-700 pb-2">
        {(['slots', 'bookings'] as const).map(v => (
          <button key={v} onClick={() => setActiveView(v)}
            className={`text-sm font-medium pb-2 transition-colors ${activeView === v ? 'text-amber-700 dark:text-amber-500 border-b-2 border-amber-700 dark:border-amber-500' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'}`}>
            {v === 'slots' ? `Slots (${slots.length})` : `Bookings (${bookings.length})`}
          </button>
        ))}
      </div>

      {activeView === 'slots' && (
        <div className="space-y-4">
          {/* Add slot */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Add new slot</label>
              <input type="datetime-local" value={newDatetime} onChange={e => setNewDatetime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <button onClick={addSlot} disabled={!newDatetime || saving}
              className="px-4 py-2 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 disabled:opacity-50 transition-colors">
              {saving ? 'Adding…' : '+ Add'}
            </button>
          </div>
          {/* Slot list */}
          {slots.length === 0 ? (
            <p className="text-sm text-stone-500">No slots yet.</p>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-700">
              {slots.map(slot => (
                <div key={slot.id} className="flex items-center justify-between py-2 gap-4">
                  <div>
                    <p className="text-sm text-stone-800 dark:text-stone-200">{slot.label}</p>
                    <span className={`text-xs font-medium ${slot.booked ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {slot.booked ? 'Booked' : 'Available'}
                    </span>
                  </div>
                  {!slot.booked && (
                    <button onClick={() => deleteSlot(slot.id)}
                      className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeView === 'bookings' && (
        bookings.length === 0 ? (
          <p className="text-sm text-stone-500">No bookings yet.</p>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {bookings.map(b => (
              <div key={b.id} className="py-4 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="font-medium text-stone-800 dark:text-stone-100">{b.name}</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">{b.slotLabel}</p>
                  <p className="text-sm text-stone-500">{b.email}{b.phone ? ` · ${b.phone}` : ''}</p>
                  {b.message && <p className="text-sm text-stone-400 italic">"{b.message}"</p>}
                  <p className="text-xs text-stone-400">{new Date(b.bookedAt).toLocaleString('en-GB')}</p>
                </div>
                <button onClick={() => deleteBooking(b.id)}
                  className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300 flex-shrink-0 transition-colors">
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

const SaveSuccessToast = ({ show, message }: { show: boolean, message?: string }) => (
    <div className={`fixed top-8 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition-transform duration-300 ease-in-out z-50 ${show ? 'transform translate-x-0' : 'transform translate-x-full'}`}
      style={{ transform: show ? 'translateX(0)' : 'translateX(calc(100% + 2rem))' }}
    >
      {message || 'Draft saved locally!'}
    </div>
);


const AdminPanel = () => {
    const { logout, apiToken } = useAuth();
    const { updateDraftContent, saveChanges, isDirty, draftContent } = useContent();
    const [activeTab, setActiveTab] = useState<Tab>('mainImages');
    const [toast, setToast] = useState({ show: false, message: '' });
    const [isPublishing, setIsPublishing] = useState(false);

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

    const handleDownload = () => {
        if (!draftContent) {
            alert("No content available to download.");
            return;
        }
        try {
            // Validate and count assets to reassure user that everything is included
            let imageCount = 0;
            if (draftContent.textContent?.heroImageUrl) imageCount++;
            if (draftContent.location?.imageUrl) imageCount++;
            if (draftContent.logoUrl) imageCount++;
            if (draftContent.faviconUrl) imageCount++;
            
            draftContent.gallerySections.forEach(section => {
                section.subSections.forEach(sub => {
                    imageCount += sub.photos.length;
                });
            });
            // Legacy photos check
            if (draftContent.photos) imageCount += draftContent.photos.length;

            const jsonString = JSON.stringify(draftContent, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const href = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = href;
            link.download = "villa-content.json";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(href);
            
            setToast({ show: true, message: `Downloaded! Includes ${imageCount} images and all text.` });
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to create download file.");
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

    const handlePublish = async () => {
        if (!draftContent) return alert('No content to publish.');
        if (!apiToken) return alert('Not authenticated. Please log in again.');
        setIsPublishing(true);
        try {
            await publishContent(draftContent, apiToken);
            setToast({ show: true, message: '🚀 Published live successfully!' });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            alert(`Publish failed: ${message}`);
        } finally {
            setIsPublishing(false);
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
            case 'bookings':
                return <BookingsManager apiToken={apiToken ?? ''} />;
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
                            onClick={handleDownload}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors dark:bg-green-700 dark:hover:bg-green-600 shadow-md"
                        >
                            Download JSON
                        </button>

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
                
                {/* Publish bar */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-amber-900 dark:text-amber-100">
                            Save your draft, then click <strong>Publish Live</strong> to push changes to the site instantly — no file downloads or deployments needed.
                        </p>
                        <div className="flex gap-3 flex-shrink-0">
                            <button
                                onClick={handleCopyForAI}
                                className="px-4 py-2 text-sm font-medium text-amber-700 bg-white border border-amber-700 rounded-md hover:bg-amber-50 dark:bg-stone-800 dark:text-amber-500 dark:border-amber-700 dark:hover:bg-stone-700"
                            >
                                Copy for AI
                            </button>
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="px-6 py-2 text-sm font-bold text-white bg-amber-700 rounded-lg shadow-lg hover:bg-amber-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                {isPublishing ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Publishing…
                                    </>
                                ) : '🚀 Publish Live'}
                            </button>
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
                <TabButton tab="bookings">Viewings</TabButton>
            </div>

            <main className="bg-white p-6 rounded-lg shadow-md dark:bg-stone-800">
                {renderTabContent()}
            </main>
        </div>
    );
};

export default AdminPanel;
