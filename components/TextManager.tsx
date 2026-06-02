import React from 'react';
import { useContent } from '../context/ContentContext';
import { TextContent, VillaStat, StatIconKey } from '../types';

const DEFAULT_STATS: VillaStat[] = [
    { id: 'stat-1', value: '5',     label: 'Bedrooms',  iconKey: 'bed'  },
    { id: 'stat-2', value: '3',     label: 'Bathrooms', iconKey: 'bath' },
    { id: 'stat-3', value: 'Pool',  label: 'Private',   iconKey: 'pool' },
    { id: 'stat-4', value: '350m²', label: 'Living',    iconKey: 'area' },
];

const ICON_OPTIONS: { value: StatIconKey; label: string }[] = [
    { value: 'bed',  label: 'Bed' },
    { value: 'bath', label: 'Bath' },
    { value: 'pool', label: 'Pool' },
    { value: 'area', label: 'Area' },
];

const TextManager = () => {
    const { draftContent, updateDraftContent } = useContent();

    if (!draftContent) return <div>Loading...</div>;

    const localText = draftContent.textContent;
    const stats = localText.stats && localText.stats.length > 0 ? localText.stats : DEFAULT_STATS;

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

    const handleStatChange = (index: number, field: keyof VillaStat, value: string) => {
        const newStats = [...stats];
        newStats[index] = { ...newStats[index], [field]: value } as VillaStat;
        const newTextContent = { ...localText, stats: newStats };
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
                    <h3 className="text-lg font-semibold mb-2">Stat Cards (floating over About image)</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">Four compact cards. Value is the big number (e.g. "5", "350m²"). Label is the caption beneath (e.g. "Bedrooms"). Icon picks which SVG renders.</p>
                    <div className="space-y-3">
                        {stats.map((stat, index) => (
                            <div key={stat.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_140px] gap-3 items-end">
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Value</label>
                                    <input type="text" value={stat.value} onChange={e => handleStatChange(index, 'value', e.target.value)} className="w-full p-2 border rounded-md dark:bg-stone-700 dark:border-stone-600" placeholder="5" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Label</label>
                                    <input type="text" value={stat.label} onChange={e => handleStatChange(index, 'label', e.target.value)} className="w-full p-2 border rounded-md dark:bg-stone-700 dark:border-stone-600" placeholder="Bedrooms" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Icon</label>
                                    <select value={stat.iconKey} onChange={e => handleStatChange(index, 'iconKey', e.target.value as StatIconKey)} className="w-full p-2 border rounded-md dark:bg-stone-700 dark:border-stone-600">
                                        {ICON_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
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
