
import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { VillaPhoto, PhotoSection } from '../types';
import { generateDescriptionForImage } from '../services/geminiService';
import { optimizeAndConvertToBase64 } from '../imageOptimizer';

const LoadingSpinner = () => (
  <div className="absolute inset-0 bg-white/70 dark:bg-stone-800/70 flex items-center justify-center z-10 rounded-lg">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700 dark:border-amber-500"></div>
  </div>
);

type DragType = 'SECTION' | 'SUBSECTION' | 'PHOTO';

interface DragItem {
    type: DragType;
    id: string;
    parentId?: string; // For subsections (sectionId) and photos (subSectionId)
    grandParentId?: string; // For photos (sectionId)
}

const PhotoManager = () => {
    const { draftContent, updateDraftContent } = useContent();
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // Unified drag state
    const [dragItem, setDragItem] = useState<DragItem | null>(null);
    
    // State for context menu (Photo moving)
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        photoId: string;
        sourceSectionId: string;
        sourceSubSectionId: string;
    } | null>(null);

    if (!draftContent) return <LoadingSpinner />;
    const { gallerySections } = draftContent;

    // Helper to update content
    const updateSections = (newSections: PhotoSection[]) => {
        updateDraftContent({ ...draftContent, gallerySections: newSections });
    };

    // --- RENAMING LOGIC ---

    const handleRenameSection = (id: string, newTitle: string) => {
        const newSections = gallerySections.map(s => s.id === id ? { ...s, title: newTitle } : s);
        updateSections(newSections);
    };

    const handleRenameSubSection = (sectionId: string, subId: string, newTitle: string) => {
        const newSections = gallerySections.map(s => {
            if (s.id === sectionId) {
                return {
                    ...s,
                    subSections: s.subSections.map(sub => sub.id === subId ? { ...sub, title: newTitle } : sub)
                };
            }
            return s;
        });
        updateSections(newSections);
    };


    // --- PHOTO UPLOAD & EDIT LOGIC ---

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, sectionId: string, subSectionId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const newPhotoId = `new-${Date.now()}`;
        
        try {
            const base64Url = await optimizeAndConvertToBase64(file);

            const newPhoto: VillaPhoto = {
                id: newPhotoId,
                url: base64Url,
                caption: 'New Image',
                description: 'Generating description...',
            };
            
            // Add placeholder
            const updatedSections = gallerySections.map(section => {
                if (section.id === sectionId) {
                    return {
                        ...section,
                        subSections: section.subSections.map(sub => {
                            if (sub.id === subSectionId) {
                                return { ...sub, photos: [...sub.photos, newPhoto] };
                            }
                            return sub;
                        })
                    };
                }
                return section;
            });
            updateSections(updatedSections);
            
            // Generate description
            const description = await generateDescriptionForImage(file);
            
            // Update with real ID and description
            const finalSections = updatedSections.map(section => {
                if (section.id === sectionId) {
                    return {
                        ...section,
                        subSections: section.subSections.map(sub => {
                            if (sub.id === subSectionId) {
                                return {
                                    ...sub,
                                    photos: sub.photos.map(p => 
                                        p.id === newPhotoId ? { ...p, description, id: crypto.randomUUID() } : p
                                    )
                                };
                            }
                            return sub;
                        })
                    };
                }
                return section;
            });
            updateSections(finalSections);

        } catch (error) {
             console.error("Error processing new image:", error);
             alert("Failed to upload and process image.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, sectionId: string, subSectionId: string, photoId: string) => {
         const file = e.target.files?.[0];
        if (!file) return;

        setIsGenerating(photoId);

        try {
            const base64Url = await optimizeAndConvertToBase64(file);
            const description = await generateDescriptionForImage(file);

            const updatedSections = gallerySections.map(section => {
                if (section.id === sectionId) {
                    return {
                        ...section,
                        subSections: section.subSections.map(sub => {
                            if (sub.id === subSectionId) {
                                return {
                                    ...sub,
                                    photos: sub.photos.map(p => 
                                        p.id === photoId ? { ...p, url: base64Url, description } : p
                                    )
                                };
                            }
                            return sub;
                        })
                    };
                }
                return section;
            });
            updateSections(updatedSections);
        } catch (error) {
            console.error("Error updating image:", error);
            alert("Failed to update image and generate description.");
        } finally {
            setIsGenerating(null);
        }
    };

    const handlePhotoUpdate = (sectionId: string, subSectionId: string, photoId: string, field: keyof VillaPhoto, value: string) => {
        const updatedSections = gallerySections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    subSections: section.subSections.map(sub => {
                        if (sub.id === subSectionId) {
                            return {
                                ...sub,
                                photos: sub.photos.map(p => p.id === photoId ? { ...p, [field]: value } : p)
                            };
                        }
                        return sub;
                    })
                };
            }
            return section;
        });
        updateSections(updatedSections);
    };

    const handleDeletePhoto = (sectionId: string, subSectionId: string, photoId: string) => {
        if (!window.confirm('Delete this photo?')) return;
         const updatedSections = gallerySections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    subSections: section.subSections.map(sub => {
                        if (sub.id === subSectionId) {
                            return {
                                ...sub,
                                photos: sub.photos.filter(p => p.id !== photoId)
                            };
                        }
                        return sub;
                    })
                };
            }
            return section;
        });
        updateSections(updatedSections);
    };

    const handleAddSubSection = (sectionId: string) => {
        const title = prompt("Enter new sub-section name (e.g., 'Master Bedroom'):");
        if (!title) return;

        const updatedSections = gallerySections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    subSections: [...section.subSections, { id: crypto.randomUUID(), title, photos: [] }]
                };
            }
            return section;
        });
        updateSections(updatedSections);
    };
    
    const handleDeleteSubSection = (sectionId: string, subSectionId: string) => {
         if (!window.confirm('Delete this sub-section? All photos inside it will be lost.')) return;
         const updatedSections = gallerySections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    subSections: section.subSections.filter(sub => sub.id !== subSectionId)
                };
            }
            return section;
        });
        updateSections(updatedSections);
    };

    // --- DRAG AND DROP LOGIC ---

    const handleDragStart = (e: React.DragEvent, type: DragType, id: string, parentId?: string, grandParentId?: string) => {
        e.stopPropagation();
        setDragItem({ type, id, parentId, grandParentId });
        e.dataTransfer.effectAllowed = 'move';
        // Use transparent image for ghost to avoid clutter
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetType: DragType, targetId: string, targetParentId?: string, targetGrandParentId?: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!dragItem) return;

        // Reorder Sections
        if (dragItem.type === 'SECTION' && targetType === 'SECTION' && dragItem.id !== targetId) {
            const newSections = [...gallerySections];
            const dragIndex = newSections.findIndex(s => s.id === dragItem.id);
            const hoverIndex = newSections.findIndex(s => s.id === targetId);
            
            if (dragIndex > -1 && hoverIndex > -1) {
                const [movedSection] = newSections.splice(dragIndex, 1);
                newSections.splice(hoverIndex, 0, movedSection);
                updateSections(newSections);
            }
        }

        // Reorder SubSections
        if (dragItem.type === 'SUBSECTION' && targetType === 'SUBSECTION' && dragItem.id !== targetId) {
            // Only allow reorder within the SAME section
            if (dragItem.parentId === targetParentId) {
                const newSections = gallerySections.map(section => {
                    if (section.id === dragItem.parentId) {
                        const newSubs = [...section.subSections];
                        const dragIndex = newSubs.findIndex(s => s.id === dragItem.id);
                        const hoverIndex = newSubs.findIndex(s => s.id === targetId);
                        
                        if (dragIndex > -1 && hoverIndex > -1) {
                            const [movedSub] = newSubs.splice(dragIndex, 1);
                            newSubs.splice(hoverIndex, 0, movedSub);
                            return { ...section, subSections: newSubs };
                        }
                    }
                    return section;
                });
                updateSections(newSections);
            }
        }

        // Reorder Photos
        if (dragItem.type === 'PHOTO' && targetType === 'PHOTO' && dragItem.id !== targetId) {
             // Check if dropping in same sub-section
             if (dragItem.parentId === targetParentId && dragItem.grandParentId === targetGrandParentId) {
                 const newSections = gallerySections.map(section => {
                     if (section.id === dragItem.grandParentId) {
                         return {
                             ...section,
                             subSections: section.subSections.map(sub => {
                                 if (sub.id === dragItem.parentId) {
                                     const newPhotos = [...sub.photos];
                                     const dragIndex = newPhotos.findIndex(p => p.id === dragItem.id);
                                     const hoverIndex = newPhotos.findIndex(p => p.id === targetId);
                                     
                                     if (dragIndex > -1 && hoverIndex > -1) {
                                         const [movedPhoto] = newPhotos.splice(dragIndex, 1);
                                         newPhotos.splice(hoverIndex, 0, movedPhoto);
                                         return { ...sub, photos: newPhotos };
                                     }
                                 }
                                 return sub;
                             })
                         }
                     }
                     return section;
                 });
                 updateSections(newSections);
             } else {
                 // Moving photo to a different subsection/section via drop on another photo
                 // This logic handles the 'swap' or 'insert before' behavior across boundaries
                 // But simple "move" logic is usually handled by dropping on container. 
                 // For simplicity, we reuse the container drop logic below if types mismatch context
                 handleDropOnSubSection(e, targetParentId!, targetGrandParentId!);
             }
        }
        
        setDragItem(null);
    };
    
    // Handle dropping a photo onto a subsection container (for moving between groups)
    const handleDropOnSubSection = (e: React.DragEvent, targetSubSectionId: string, targetSectionId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (dragItem && dragItem.type === 'PHOTO') {
             const { id: photoId, parentId: sourceSubId, grandParentId: sourceSecId } = dragItem;
             
             // Don't do anything if dropping on source
             if (sourceSubId === targetSubSectionId) return;

             // 1. Find and remove photo from source
             const newSections = JSON.parse(JSON.stringify(gallerySections)) as PhotoSection[];
             let photoToMove: VillaPhoto | undefined;

             for (const sec of newSections) {
                 if (sec.id === sourceSecId) {
                     for (const sub of sec.subSections) {
                         if (sub.id === sourceSubId) {
                             const idx = sub.photos.findIndex(p => p.id === photoId);
                             if (idx > -1) {
                                 photoToMove = sub.photos[idx];
                                 sub.photos.splice(idx, 1);
                             }
                         }
                     }
                 }
             }

             // 2. Add to destination
             if (photoToMove) {
                 for (const sec of newSections) {
                     if (sec.id === targetSectionId) {
                         for (const sub of sec.subSections) {
                             if (sub.id === targetSubSectionId) {
                                 sub.photos.push(photoToMove);
                             }
                         }
                     }
                 }
                 updateSections(newSections);
             }
        }
        setDragItem(null);
    };


    // --- CONTEXT MENU LOGIC (Right Click Move) ---

    const handleContextMenu = (e: React.MouseEvent, photoId: string, sectionId: string, subSectionId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            photoId,
            sourceSectionId: sectionId,
            sourceSubSectionId: subSectionId
        });
    };

    const handleMovePhoto = (targetSectionId: string, targetSubSectionId: string) => {
        if (!contextMenu) return;
        const { photoId, sourceSectionId, sourceSubSectionId } = contextMenu;

        const newSections = JSON.parse(JSON.stringify(gallerySections)) as PhotoSection[];
        let photoToMove: VillaPhoto | undefined;

        for (const sec of newSections) {
            if (sec.id === sourceSectionId) {
                for (const sub of sec.subSections) {
                    if (sub.id === sourceSubSectionId) {
                        const idx = sub.photos.findIndex(p => p.id === photoId);
                        if (idx > -1) {
                            photoToMove = sub.photos[idx];
                            sub.photos.splice(idx, 1);
                        }
                    }
                }
            }
        }

        if (photoToMove) {
             for (const sec of newSections) {
                if (sec.id === targetSectionId) {
                    for (const sub of sec.subSections) {
                        if (sub.id === targetSubSectionId) {
                            sub.photos.push(photoToMove);
                        }
                    }
                }
            }
            updateSections(newSections);
        }
        setContextMenu(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-stone-800 dark:text-white">Manage Photo Gallery</h2>
                {isUploading && <p className="text-amber-600 animate-pulse">Processing image...</p>}
            </div>
            
            <div className="space-y-8">
                {gallerySections.map(section => (
                    <div 
                        key={section.id} 
                        className={`border-2 rounded-xl overflow-hidden transition-colors ${dragItem?.type === 'SECTION' && dragItem.id === section.id ? 'border-amber-500 opacity-50' : 'border-stone-200 dark:border-stone-700'}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'SECTION', section.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'SECTION', section.id)}
                    >
                        <div className="bg-stone-100 dark:bg-stone-800 p-4 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center cursor-move">
                            <div className="flex items-center gap-3 flex-1">
                                <span className="text-stone-400 select-none">⋮⋮</span>
                                <input 
                                    type="text" 
                                    value={section.title}
                                    onChange={(e) => handleRenameSection(section.id, e.target.value)}
                                    className="text-xl font-bold text-stone-800 dark:text-white bg-transparent border border-transparent hover:border-stone-300 focus:border-amber-500 focus:bg-white dark:focus:bg-stone-700 rounded px-2 py-1 w-full max-w-md focus:outline-none transition-all"
                                />
                            </div>
                            <button 
                                onClick={() => handleAddSubSection(section.id)}
                                className="px-3 py-1 text-sm bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded hover:bg-stone-50 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200"
                            >
                                + Add Sub-Section
                            </button>
                        </div>
                        
                        <div className="p-4 space-y-6 bg-white dark:bg-stone-900">
                            {section.subSections.map(sub => (
                                <div 
                                    key={sub.id} 
                                    className={`border rounded-lg p-4 transition-colors ${dragItem?.type === 'SUBSECTION' && dragItem.id === sub.id ? 'border-amber-500 opacity-50' : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50'}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, 'SUBSECTION', sub.id, section.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => {
                                        if (dragItem?.type === 'SUBSECTION') {
                                            handleDrop(e, 'SUBSECTION', sub.id, section.id);
                                        } else if (dragItem?.type === 'PHOTO') {
                                            handleDropOnSubSection(e, sub.id, section.id);
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-center mb-4 cursor-move">
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="text-stone-400 text-sm select-none">⋮⋮</span>
                                            <input 
                                                type="text" 
                                                value={sub.title}
                                                onChange={(e) => handleRenameSubSection(section.id, sub.id, e.target.value)}
                                                className="font-semibold text-lg text-amber-700 dark:text-amber-500 bg-transparent border border-transparent hover:border-stone-300 focus:border-amber-500 focus:bg-white dark:focus:bg-stone-700 rounded px-2 py-1 w-full max-w-xs focus:outline-none transition-all"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <label className="cursor-pointer px-3 py-1 text-xs bg-amber-700 text-white rounded hover:bg-amber-800">
                                                + Add Photo
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, section.id, sub.id)} />
                                            </label>
                                            <button onClick={() => handleDeleteSubSection(section.id, sub.id)} className="text-red-500 hover:text-red-700 text-xs px-2">Delete Group</button>
                                        </div>
                                    </div>
                                    
                                    {sub.photos.length === 0 && (
                                        <div className="text-center py-8 text-stone-400 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg">
                                            Drag photos here or click "Add Photo"
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {sub.photos.map((photo, idx) => (
                                            <div 
                                                key={photo.id} 
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, 'PHOTO', photo.id, sub.id, section.id)}
                                                onDrop={(e) => handleDrop(e, 'PHOTO', photo.id, sub.id, section.id)}
                                                onContextMenu={(e) => handleContextMenu(e, photo.id, section.id, sub.id)}
                                                className={`relative flex gap-4 p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-sm ${dragItem?.type === 'PHOTO' && dragItem.id === photo.id ? 'opacity-50' : 'opacity-100'} cursor-move hover:shadow-md transition-shadow`}
                                            >
                                                {isGenerating === photo.id && <LoadingSpinner />}
                                                
                                                <div className="w-24 h-24 flex-shrink-0 bg-stone-200 rounded-md overflow-hidden relative group">
                                                    <img src={photo.url} alt="thumbnail" className="w-full h-full object-cover" />
                                                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                                        <span className="text-white text-xs">Change</span>
                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, section.id, sub.id, photo.id)} />
                                                    </label>
                                                </div>
                                                
                                                <div className="flex-1 flex flex-col gap-2 min-w-0">
                                                    <input 
                                                        type="text" 
                                                        value={photo.caption} 
                                                        onChange={(e) => handlePhotoUpdate(section.id, sub.id, photo.id, 'caption', e.target.value)}
                                                        className="text-sm font-bold border-none bg-transparent p-0 focus:ring-0 text-stone-800 dark:text-white"
                                                        placeholder="Caption..."
                                                    />
                                                    <textarea 
                                                        value={photo.description} 
                                                        onChange={(e) => handlePhotoUpdate(section.id, sub.id, photo.id, 'description', e.target.value)}
                                                        className="text-xs text-stone-500 dark:text-stone-400 border-none bg-transparent p-0 focus:ring-0 resize-none h-full"
                                                        placeholder="Description..."
                                                    />
                                                </div>
                                                <button 
                                                    onClick={() => handleDeletePhoto(section.id, sub.id, photo.id)}
                                                    className="text-stone-400 hover:text-red-500 self-start"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Context Menu for Moving Photos */}
            {contextMenu && contextMenu.visible && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)}></div>
                    <div 
                        className="fixed z-50 bg-white dark:bg-stone-800 shadow-xl rounded-md border border-stone-200 dark:border-stone-600 py-1 min-w-[200px] max-h-[300px] overflow-y-auto"
                        style={{ top: Math.min(contextMenu.y, window.innerHeight - 300), left: Math.min(contextMenu.x, window.innerWidth - 200) }}
                    >
                        <div className="px-4 py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider border-b border-stone-100 dark:border-stone-700 mb-1 bg-stone-50 dark:bg-stone-900">
                            Move to...
                        </div>
                        {gallerySections.map(section => (
                            <div key={section.id}>
                                <div className="px-4 py-1 text-xs font-bold text-stone-400 dark:text-stone-500 mt-1 bg-stone-50/50 dark:bg-stone-900/50">{section.title}</div>
                                {section.subSections.map(sub => {
                                    const isCurrent = section.id === contextMenu.sourceSectionId && sub.id === contextMenu.sourceSubSectionId;
                                    if (isCurrent) return null;

                                    return (
                                        <button
                                            key={sub.id}
                                            className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-700 hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
                                            onClick={() => handleMovePhoto(section.id, sub.id)}
                                        >
                                           {sub.title}
                                        </button>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default PhotoManager;
    