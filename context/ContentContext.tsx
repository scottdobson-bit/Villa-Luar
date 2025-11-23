
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { VillaContent } from '../types';
import { getContent, saveContent, getDraftContent, saveDraftContent, clearDraftContent } from '../services/contentService';

interface ContentContextType {
  content: VillaContent | null;
  draftContent: VillaContent | null;
  isLoading: boolean;
  isDirty: boolean;
  updateDraftContent: (newContent: VillaContent) => void;
  saveChanges: (onSuccess?: () => void) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: React.PropsWithChildren) => {
  const [content, setContent] = useState<VillaContent | null>(null);
  const [draftContent, setDraftContent] = useState<VillaContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const location = useLocation();

  const isPreviewMode = new URLSearchParams(location.search).get('preview') === 'true';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
        const initialLiveContent = await getContent();
        const initialDraftContent = await getDraftContent();
        
        // If preview mode, we prefer draft, but fall back to live if no draft exists
        if (isPreviewMode && initialDraftContent) {
            setContent(initialDraftContent);
        } else {
            setContent(initialLiveContent);
        }

        // If we have a draft, use it for admin state
        if (initialDraftContent) {
            setDraftContent(initialDraftContent);
            // Simple dirty check
            const liveJson = JSON.stringify(initialLiveContent);
            const draftJson = JSON.stringify(initialDraftContent);
            setIsDirty(liveJson !== draftJson);
        } else {
            // If no draft, draft is a copy of live
            setDraftContent(initialLiveContent);
            setIsDirty(false);
        }
    } catch (error) {
        console.error("Error loading content:", error);
    } finally {
        setIsLoading(false);
    }
  }, [isPreviewMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateDraftContent = useCallback(async (newDraft: VillaContent) => {
    // Optimistic update for UI responsiveness
    setDraftContent(newDraft);
    setIsDirty(true);
    
    // Async save
    try {
        await saveDraftContent(newDraft);
    } catch (e) {
        console.error("Failed to save draft background", e);
    }
  }, []);

  const saveChanges = useCallback(async (onSuccess?: () => void) => {
    if (draftContent) {
      setIsLoading(true); // Show loading while saving heavy data
      try {
          await saveContent(draftContent);
          await clearDraftContent();
          
          // Update local state to reflect "live" is now "draft"
          setContent(draftContent);
          setIsDirty(false);
          
          if (onSuccess) onSuccess();
      } catch (e) {
          console.error("Failed to publish changes", e);
          alert("Failed to publish changes. Please check console.");
      } finally {
          setIsLoading(false);
      }
    }
  }, [draftContent]);
  
  const value = {
    content: isPreviewMode ? draftContent : content,
    draftContent,
    isLoading,
    isDirty,
    updateDraftContent,
    saveChanges
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};