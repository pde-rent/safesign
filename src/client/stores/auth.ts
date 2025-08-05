import { signal } from '@preact/signals';
import type { User, ApiResponse } from '../../common/types.js';
import { useStore } from '../lib/store.js';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const authState = signal<AuthState>({
  user: null,
  token: null,
  isLoading: false,
  error: null
});

export const authStore = {
  // Getters
  get state() {
    return authState.value;
  },
  
  get isAuthenticated() {
    return !!authState.value.user && !!authState.value.token;
  },

  // Actions
  async registerWithEmail(email: string, password: string): Promise<void> {
    authState.value = { ...authState.value, isLoading: true, error: null };
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result: ApiResponse<{ user: User; token: string }> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'inscription');
      }

      // Store token in localStorage
      localStorage.setItem('auth_token', result.data!.token);
      
      // Update both auth stores
      authState.value = {
        user: result.data!.user,
        token: result.data!.token,
        isLoading: false,
        error: null
      };
      
      // Also update the main store for API client
      useStore.getState().setAuth(result.data!.user, result.data!.token);
    } catch (error) {
      authState.value = {
        ...authState.value,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
      throw error;
    }
  },

  async loginWithEmail(email: string, password: string): Promise<void> {
    authState.value = { ...authState.value, isLoading: true, error: null };
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result: ApiResponse<{ user: User; token: string }> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la connexion');
      }

      // Store token in localStorage
      localStorage.setItem('auth_token', result.data!.token);
      
      // Update both auth stores
      authState.value = {
        user: result.data!.user,
        token: result.data!.token,
        isLoading: false,
        error: null
      };
      
      // Also update the main store for API client
      useStore.getState().setAuth(result.data!.user, result.data!.token);
    } catch (error) {
      authState.value = {
        ...authState.value,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
      throw error;
    }
  },

  async logout(): Promise<void> {
    const token = authState.value.token;
    
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear local state
    localStorage.removeItem('auth_token');
    authState.value = {
      user: null,
      token: null,
      isLoading: false,
      error: null
    };
  },

  async loadStoredAuth(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return;
    }

    authState.value = { ...authState.value, isLoading: true };
    
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result: ApiResponse<User> = await response.json();
      
      if (result.success && result.data) {
        authState.value = {
          user: result.data,
          token,
          isLoading: false,
          error: null
        };
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('auth_token');
        authState.value = {
          user: null,
          token: null,
          isLoading: false,
          error: null
        };
      }
    } catch (error) {
      localStorage.removeItem('auth_token');
      authState.value = {
        user: null,
        token: null,
        isLoading: false,
        error: null
      };
    }
  },

  clearError(): void {
    authState.value = { ...authState.value, error: null };
  }
};