
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { VillaContent } from '../types';
import { getContent, getDraftContent, saveDraftContent, clearDraftContent } from '../services/contentService';

interface ContentContextType {
  content: VillaContent | null;
  draftContent: VillaContent | null;
  isLoading: boolean;
  isDirty: boolean;
  updateDraftContent: (newContent: VillaContent) => void;
  saveDraft: (onSuccess?: () => void) => void;
  discardDraft: () => void;
  reloadContent: () => Promise<void>;
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

  const saveDraft = useCallback(async (onSuccess?: () => void) => {
    if (draftContent) {
      setIsLoading(true);
      try {
          await saveDraftContent(draftContent);
          if (onSuccess) onSuccess();
      } catch (e) {
          console.error("Failed to save draft explicitly", e);
          alert("Failed to save draft. Please check console.");
      } finally {
          setIsLoading(false);
      }
    }
  }, [draftContent]);

  const discardDraft = useCallback(async () => {
    if (window.confirm("Are you sure you want to discard all local changes and sync with the live website? This cannot be undone.")) {
        setIsLoading(true);
        try {
            await clearDraftContent();
            await loadData(); // Reload all content
        } catch (e) {
            console.error("Failed to discard draft", e);
        } finally {
            setIsLoading(false);
        }
    }
  }, [loadData]);
  
  const value = {
    content: isPreviewMode ? draftContent : content,
    draftContent,
    isLoading,
    isDirty,
    updateDraftContent,
    saveDraft,
    discardDraft,
    reloadContent: loadData,
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
  // FIX: Changed 'Content' to 'context' to return the correct value.
  return context;
};
