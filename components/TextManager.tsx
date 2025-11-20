import React from 'react';
import { useContent } from '../context/ContentContext';
import { TextContent } from '../types';

const TextManager = () => {
    const { draftContent, updateDraftContent } = useContent();

    if (!draftContent) return <div>Loading...</div>;

    const localText = draftContent.textContent;

    const handleChange = <K extends keyof TextContent>(field: K, value: TextContent[K]) => {
        const newTextContent = { ...localText, [field]: value };
        updateDraftContent({ ...draftContent, textContent: newTextContent });
    };

    const handleFeatureChange = (index: number, field: 'name' | 'detail', value: string) => {
        const newFeatures = [...localText.features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        const newTextContent = { ...localText, features: newFeatures };
        updateDraftContent({ ...draftContent, textContent: newTextContent });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Page Text Content</h2>
            <div className="space-y-6">
                <div className="p-4 border rounded-lg dark:border-stone-700">
                    <h3 className="text-lg font-semibold mb-2">Hero Section</h3>
                    <div>
                        <label className="block text-sm font-medium">Title</label>
                        <input type="text" value={localText.heroTitle} onChange={e => handleChange('heroTitle', e.target.value)} className="w-full p-2 border rounded-md mt-1 dark:bg-stone-700 dark:border-stone-600" />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium">Subtitle</label>
                        <textarea value={localText.heroSubtitle} onChange={e => handleChange('heroSubtitle', e.target.value)} className="w-full p-2 border rounded-md mt-1 h-20 dark:bg-stone-700 dark:border-stone-600" />
                    </div>
                </div>

                <div className="p-4 border rounded-lg dark:border-stone-700">
                    <h3 className="text-lg font-semibold mb-2">About Section</h3>
                    <div>
                        <label className="block text-sm font-medium">Title</label>
                        <input type="text" value={localText.aboutTitle} onChange={e => handleChange('aboutTitle', e.target.value)} className="w-full p-2 border rounded-md mt-1 dark:bg-stone-700 dark:border-stone-600" />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium">Text</label>
                        <textarea value={localText.aboutText} onChange={e => handleChange('aboutText', e.target.value)} className="w-full p-2 border rounded-md mt-1 h-32 dark:bg-stone-700 dark:border-stone-600" />
                    </div>
                </div>

                <div className="p-4 border rounded-lg dark:border-stone-700">
                    <h3 className="text-lg font-semibold mb-2">Features Section</h3>
                     <div>
                        <label className="block text-sm font-medium">Title</label>
                        <input type="text" value={localText.featuresTitle} onChange={e => handleChange('featuresTitle', e.target.value)} className="w-full p-2 border rounded-md mt-1 mb-4 dark:bg-stone-700 dark:border-stone-600" />
                    </div>
                    <div className="space-y-4">
                        {localText.features.map((feature, index) => (
                            <div key={feature.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" value={feature.name} onChange={e => handleFeatureChange(index, 'name', e.target.value)} className="w-full p-2 border rounded-md dark:bg-stone-700 dark:border-stone-600" placeholder="Feature Name" />
                                <input type="text" value={feature.detail} onChange={e => handleFeatureChange(index, 'detail', e.target.value)} className="w-full p-2 border rounded-md dark:bg-stone-700 dark:border-stone-600" placeholder="Feature Detail" />
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-amber-50 dark:bg-stone-700/50 dark:border-stone-700">
                    <h3 className="text-lg font-semibold mb-2 text-amber-900 dark:text-amber-500">Important Considerations Section</h3>
                    <div>
                        <label className="block text-sm font-medium">Title</label>
                        <input type="text" value={localText.considerationsTitle} onChange={e => handleChange('considerationsTitle', e.target.value)} className="w-full p-2 border rounded-md mt-1 dark:bg-stone-700 dark:border-stone-600" />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium">Text</label>
                        <textarea value={localText.considerationsText} onChange={e => handleChange('considerationsText', e.target.value)} className="w-full p-2 border rounded-md mt-1 h-32 dark:bg-stone-700 dark:border-stone-600" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextManager;