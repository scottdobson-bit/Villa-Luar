import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { optimizeAndConvertToBase64 } from '../imageOptimizer';
import { processSvg } from '../utils/svgProcessor';
import { fileToDataUrl } from '../utils/fileUtils';

const LoadingSpinner = () => (
  <div className="absolute inset-0 bg-white/70 dark:bg-stone-800/70 flex items-center justify-center z-10 rounded-md">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700 dark:border-amber-500"></div>
  </div>
);

const MainImageManager = () => {
    const { draftContent, updateDraftContent } = useContent();
    const [isUploading, setIsUploading] = useState<string | null>(null);

    if (!draftContent) return <div>Loading...</div>;

    const { textContent, logoUrl, faviconUrl } = draftContent;

    const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        setIsUploading('hero');
        try {
            const base64Url = await optimizeAndConvertToBase64(file);
            const newTextContent = { ...textContent, heroImageUrl: base64Url };
            updateDraftContent({ ...draftContent, textContent: newTextContent });
        } catch (error) {
            console.error("Error optimizing hero image:", error);
            alert("Failed to process the hero image.");
        } finally {
            setIsUploading(null);
        }
    };
    
    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'image/svg+xml') {
            alert('For best results, please upload an SVG logo.');
            return;
        }

        setIsUploading('logo');
        try {
            const processedLogoUrl = await processSvg(file);
            updateDraftContent({ ...draftContent, logoUrl: processedLogoUrl });
        } catch (error) {
            console.error("Error processing SVG logo:", error);
            alert("Failed to process the SVG logo.");
        } finally {
            setIsUploading(null);
        }
    };
    
    const handleFaviconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading('favicon');
        try {
            const dataUrl = await fileToDataUrl(file);
            updateDraftContent({ ...draftContent, faviconUrl: dataUrl });
        } catch (error) {
            console.error("Error processing favicon:", error);
            alert("Failed to process the favicon.");
        } finally {
            setIsUploading(null);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Main Images & Branding</h2>
            <div className="space-y-6">
                <div className="p-4 border rounded-lg dark:border-stone-700">
                    <h3 className="text-lg font-semibold mb-2">Website Hero Image</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">This is the main image that appears at the top of your homepage.</p>
                    
                    <div className="mt-2 relative">
                        <img src={textContent.heroImageUrl} alt="Hero" className="w-full h-auto rounded-md object-cover max-h-60 border dark:border-stone-700" />
                        {isUploading === 'hero' && <LoadingSpinner />} 
                    </div>
                    <label htmlFor="hero-image-upload" className="mt-4 inline-block px-4 py-2 bg-stone-200 text-stone-700 text-sm rounded-md cursor-pointer hover:bg-stone-300 transition-colors dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600">
                        Upload New Hero Image
                    </label>
                    <input 
                        id="hero-image-upload"
                        type="file" 
                        accept="image/*" 
                        onChange={handleHeroImageChange} 
                        className="hidden" 
                    />
                </div>
                
                <div className="p-4 border rounded-lg dark:border-stone-700">
                    <h3 className="text-lg font-semibold mb-2">Branding</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium mb-2">Website Logo</label>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">Upload an SVG for best results. The logo will be displayed with its original colors.</p>
                            <div className="mt-2 p-4 rounded-md border dark:border-stone-700 bg-stone-200 dark:bg-stone-700 relative min-h-[100px] flex items-center justify-center">
                                {isUploading === 'logo' && <LoadingSpinner />}
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo Preview" className="h-12 w-auto" />
                                ) : (
                                    <span className="text-stone-400 text-sm">No logo uploaded</span>
                                )}
                            </div>
                            <label htmlFor="logo-upload" className="mt-2 inline-block px-4 py-2 bg-stone-200 text-stone-700 text-sm rounded-md cursor-pointer hover:bg-stone-300 transition-colors dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600">
                                Upload Logo
                            </label>
                            <input id="logo-upload" type="file" accept="image/svg+xml,image/*" onChange={handleLogoChange} className="hidden" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-2">Website Favicon</label>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">The small icon for browser tabs. Use a square image.</p>
                            <div className="mt-2 p-4 rounded-md border dark:border-stone-700 bg-stone-200 dark:bg-stone-700 relative min-h-[100px] flex items-center justify-center">
                                {isUploading === 'favicon' && <LoadingSpinner />}
                                {faviconUrl ? (
                                    <img src={faviconUrl} alt="Favicon Preview" className="h-8 w-8" />
                                ) : (
                                    <span className="text-stone-500 dark:text-stone-400 text-sm">No favicon</span>
                                )}
                            </div>
                            <label htmlFor="favicon-upload" className="mt-2 inline-block px-4 py-2 bg-stone-200 text-stone-700 text-sm rounded-md cursor-pointer hover:bg-stone-300 transition-colors dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600">
                                Upload Favicon
                            </label>
                            <input id="favicon-upload" type="file" accept="image/*" onChange={handleFaviconChange} className="hidden" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MainImageManager;