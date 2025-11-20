
import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { optimizeAndConvertToBase64 } from '../imageOptimizer';

const LoadingSpinner = () => (
  <div className="absolute inset-0 bg-white/70 dark:bg-stone-800/70 flex items-center justify-center z-10 rounded-md">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700 dark:border-amber-500"></div>
  </div>
);

const LocationManager = () => {
    const { draftContent, updateDraftContent } = useContent();
    const [isUploading, setIsUploading] = useState(false);

    if (!draftContent) return <div>Loading...</div>;

    const location = draftContent.location;

    const handleChange = (field: 'title' | 'description', value: string) => {
        const newLocation = { ...location, [field]: value };
        updateDraftContent({ ...draftContent, location: newLocation });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const base64Url = await optimizeAndConvertToBase64(file);
            const newLocation = { ...location, imageUrl: base64Url };
            updateDraftContent({ ...draftContent, location: newLocation });
        } catch (error) {
            console.error("Error optimizing location image:", error);
            alert("Failed to process the location image.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Location Section</h2>
            <div className="p-4 border rounded-lg dark:border-stone-700 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-1">Section Title</label>
                    <input 
                        type="text" 
                        value={location.title} 
                        onChange={e => handleChange('title', e.target.value)} 
                        className="w-full p-2 border rounded-md dark:bg-stone-700 dark:border-stone-600" 
                        placeholder="e.g., Prime Location in Lanzarote"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-1">Description</label>
                    <textarea 
                        value={location.description} 
                        onChange={e => handleChange('description', e.target.value)} 
                        className="w-full p-2 border rounded-md h-32 dark:bg-stone-700 dark:border-stone-600" 
                        placeholder="Describe the villa's location..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">Location Image</label>
                    <div className="relative">
                        <img 
                            src={location.imageUrl} 
                            alt="Location" 
                            className="w-full h-auto max-h-64 object-cover rounded-md border dark:border-stone-700" 
                        />
                        {isUploading && <LoadingSpinner />}
                    </div>
                    <label className="mt-2 inline-block px-4 py-2 bg-stone-200 text-stone-700 text-sm rounded-md cursor-pointer hover:bg-stone-300 transition-colors dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600">
                        Upload New Image
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="hidden" 
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default LocationManager;
