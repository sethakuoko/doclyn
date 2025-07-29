// API configuration
const API_BASE_URL = 'https://doclyndb.onrender.com/api';

// API endpoints
const ENDPOINTS = {
  USER_LOGIN: '/users/login',
  USER_HEALTH: '/users/health',
};

// Types
export interface AuthRequest {
  email: string;
  password: string;
  action: 'signIn' | 'createAccount';
}

export interface AuthResponse {
  message: string;
  success: boolean;
  userId?: string;
  email?: string;
  fullName?: string;
}

// API service class
export class ApiService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('🌐 Making API request to:', url);
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('📤 Request options:', JSON.stringify(defaultOptions, null, 2));
      
      const response = await fetch(url, defaultOptions);
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Response data:', JSON.stringify(data, null, 2));
      
      return data;
    } catch (error) {
      console.error('❌ API request failed:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        url: url
      });
      throw error;
    }
  }

  // User authentication (login or create account)
  static async authenticateUser(authData: AuthRequest): Promise<AuthResponse> {
    console.log('🔐 Attempting user authentication with data:', JSON.stringify(authData, null, 2));
    return this.makeRequest<AuthResponse>(ENDPOINTS.USER_LOGIN, {
      method: 'POST',
      body: JSON.stringify(authData),
    });
  }

  // Health check
  static async healthCheck(): Promise<string> {
    console.log('🏥 Performing health check...');
    return this.makeRequest<string>(ENDPOINTS.USER_HEALTH);
  }
} 