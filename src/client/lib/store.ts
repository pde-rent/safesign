import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Document, DocumentType } from '../../common/types.js';

interface AppState {
  // Auth state
  user: User | null;
  token: string | null;
  
  // Documents state
  documents: Document[];
  currentDocument: Document | null;
  templates: Array<{ type: string; title: string; description: string }>;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAuth: (user: User | null, token: string | null) => void;
  setDocuments: (documents: Document[]) => void;
  setCurrentDocument: (document: Document | null) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  setTemplates: (templates: Array<{ type: string; title: string; description: string }>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      documents: [],
      currentDocument: null,
      templates: [],
      isLoading: false,
      error: null,
      
      // Actions
      setAuth: (user, token) => set({ user, token, error: null }),
      
      setDocuments: (documents) => set({ documents }),
      
      setCurrentDocument: (currentDocument) => set({ currentDocument }),
      
      updateDocument: (id, updates) => set((state) => ({
        documents: state.documents.map(doc => 
          doc.id === id ? { ...doc, ...updates } : doc
        ),
        currentDocument: state.currentDocument?.id === id 
          ? { ...state.currentDocument, ...updates } 
          : state.currentDocument
      })),
      
      setTemplates: (templates) => set({ templates }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      logout: () => set({
        user: null,
        token: null,
        documents: [],
        currentDocument: null,
        error: null
      })
    }),
    {
      name: 'safesign-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token
      })
    }
  )
);

// Selector hooks for common use cases
export const useUser = () => useStore((state) => state.user);
export const useToken = () => useStore((state) => state.token);
export const useIsAuthenticated = () => useStore((state) => !!state.token);
export const useDocuments = () => useStore((state) => state.documents);
export const useCurrentDocument = () => useStore((state) => state.currentDocument);
export const useTemplates = () => useStore((state) => state.templates);
export const useIsLoading = () => useStore((state) => state.isLoading);
export const useError = () => useStore((state) => state.error);