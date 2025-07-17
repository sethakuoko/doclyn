// API configuration
const API_BASE_URL = 'http://172.20.10.2:8080/api';

// API endpoints
const ENDPOINTS = {
  USER_LOGIN: '/users/login',
  USER_HEALTH: '/users/health',
};

// Types
export interface UserLoginRequest {
  id: string;
  email: string;
  fullName: string;
}

export interface UserLoginResponse {
  message: string;
  success: boolean;
  id: string;
  email: string;
  fullName: string;
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

  // User login
  static async loginUser(userData: UserLoginRequest): Promise<UserLoginResponse> {
    console.log('🔐 Attempting user login with data:', JSON.stringify(userData, null, 2));
    return this.makeRequest<UserLoginResponse>(ENDPOINTS.USER_LOGIN, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Health check
  static async healthCheck(): Promise<string> {
    console.log('🏥 Performing health check...');
    return this.makeRequest<string>(ENDPOINTS.USER_HEALTH);
  }
} 