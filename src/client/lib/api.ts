import { useStore } from './store.js';
import type { ApiResponse, User, Document, AuthToken } from '../../common/types.js';

class ApiClient {
  private baseURL = '/api';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = useStore.getState().token;
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    });

    // Check for token renewal
    const newToken = response.headers.get('X-New-Token');
    if (newToken) {
      const { setAuth, user } = useStore.getState();
      setAuth(user, newToken);
    }

    const data: ApiResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }
    
    return data.data!;
  }

  // Auth endpoints
  async register(username: string, password: string, email?: string): Promise<{ user: User; token: string }> {
    const result = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email })
    });
    
    useStore.getState().setAuth(result.user, result.token);
    return result;
  }

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const result = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    useStore.getState().setAuth(result.user, result.token);
    return result;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      useStore.getState().logout();
    }
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async authenticateWallet(address: string, message: string, signature: string): Promise<{ user: User; token: string }> {
    const result = await this.request<{ user: User; token: string }>('/auth/wallet', {
      method: 'POST',
      body: JSON.stringify({ address, message, signature })
    });
    
    useStore.getState().setAuth(result.user, result.token);
    return result;
  }

  // Template endpoints
  async getTemplates(): Promise<Array<{ type: string; title: string; description: string }>> {
    const templates = await this.request<Array<{ type: string; title: string; description: string }>>('/templates');
    useStore.getState().setTemplates(templates);
    return templates;
  }

  // Document endpoints
  async getDocuments(): Promise<Document[]> {
    const documents = await this.request<Document[]>('/documents');
    useStore.getState().setDocuments(documents);
    return documents;
  }

  async getDocument(id: string): Promise<Document> {
    const document = await this.request<Document>(`/documents/${id}`);
    useStore.getState().setCurrentDocument(document);
    return document;
  }

  async createDocument(type: string, title: string): Promise<Document> {
    const document = await this.request<Document>('/documents', {
      method: 'POST',
      body: JSON.stringify({ type, title })
    });
    
    const { documents, setDocuments } = useStore.getState();
    setDocuments([document, ...documents]);
    
    return document;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const document = await this.request<Document>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    
    useStore.getState().updateDocument(id, document);
    return document;
  }

  async deleteDocument(id: string): Promise<void> {
    await this.request(`/documents/${id}`, { method: 'DELETE' });
    
    const { documents, setDocuments, currentDocument, setCurrentDocument } = useStore.getState();
    setDocuments(documents.filter(d => d.id !== id));
    
    if (currentDocument?.id === id) {
      setCurrentDocument(null);
    }
  }

  async shareDocument(id: string): Promise<{ shareLink: string; fullUrl: string }> {
    return this.request<{ shareLink: string; fullUrl: string }>(`/documents/${id}/share`, {
      method: 'POST'
    });
  }

  async getDocumentPreview(id: string, settings?: any): Promise<string> {
    const params = new URLSearchParams(settings ? {
      ...Object.fromEntries(
        Object.entries(settings).map(([key, value]) => [key, String(value)])
      )
    } : {});
    
    const response = await fetch(`${this.baseURL}/documents/${id}/preview?${params}`, {
      headers: {
        Authorization: `Bearer ${useStore.getState().token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la génération de l\'aperçu');
    }
    
    return response.text();
  }

  // Signing endpoints
  async getSigningDocument(shareLink: string): Promise<any> {
    return this.request<any>(`/sign/${shareLink}`);
  }

  async submitSignature(shareLink: string, signerId: string, fieldValues: Record<string, any>, signatureData: string): Promise<any> {
    return this.request<any>(`/sign/${shareLink}`, {
      method: 'POST',
      body: JSON.stringify({ signerId, fieldValues, signatureData })
    });
  }

  async viewDocument(envelopeId: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/view/${envelopeId}`);
    
    if (!response.ok) {
      throw new Error('Document non trouvé');
    }
    
    return response.text();
  }
}

export const api = new ApiClient();