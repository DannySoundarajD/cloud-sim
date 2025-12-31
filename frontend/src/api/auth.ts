/**
 * Authentication API Client
 * 
 * DESIGN DECISIONS:
 * -----------------
 * 1. Token stored in localStorage - Simple but has XSS vulnerability trade-off
 *    - Alternative: httpOnly cookies (more secure but requires backend changes)
 *    - For this app, localStorage is acceptable for development
 * 
 * 2. Axios interceptors - Automatically attach token to all requests
 *    - Benefit: Don't need to manually add auth header everywhere
 *    - Handles 401 responses globally
 * 
 * 3. FormData for login - OAuth2 spec requires form-urlencoded data
 *    - Not JSON! This is a common gotcha with OAuth2 password flow
 */

import { api } from './client';

// Token storage keys
const TOKEN_KEY = 'cloudsim_access_token';
const USER_KEY = 'cloudsim_user';

// Types matching backend schemas
export interface User {
    id: number;
    email: string;
    role: string;  // Admin, Developer, DevOps Engineer, User
    is_active: boolean;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface RegisterData {
    email: string;
    password: string;
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Store JWT token in localStorage.
 * Trade-off: localStorage is vulnerable to XSS attacks.
 * For production, consider httpOnly cookies.
 */
export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Store user data for quick access without API call.
 */
export function setStoredUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): User | null {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
}

// ============================================================================
// AXIOS INTERCEPTOR - Auto-attach token to requests
// ============================================================================
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses (token expired/invalid)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            removeToken();
            // Optionally trigger logout/redirect here
        }
        return Promise.reject(error);
    }
);

// ============================================================================
// AUTH API FUNCTIONS
// ============================================================================

/**
 * Register a new user.
 * @throws Error if email already exists (409) or validation fails
 */
export async function register(data: RegisterData): Promise<User> {
    const response = await api.post<User>('/api/auth/register', data);
    return response.data;
}

/**
 * Login with email and password.
 * 
 * IMPORTANT: OAuth2 requires form-urlencoded data, not JSON!
 * The backend's OAuth2PasswordRequestForm expects:
 * - username (we send email here)
 * - password
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
    // OAuth2 spec requires form data, not JSON
    const formData = new URLSearchParams();
    formData.append('username', email);  // OAuth2 uses "username" field
    formData.append('password', password);

    const response = await api.post<LoginResponse>('/api/auth/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    // Store token immediately after successful login
    setToken(response.data.access_token);

    return response.data;
}

/**
 * Get current authenticated user's information.
 * Requires valid JWT token in Authorization header.
 */
export async function getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/api/auth/me');
    setStoredUser(response.data);
    return response.data;
}

/**
 * Logout - Clear stored tokens and user data.
 */
export function logout(): void {
    removeToken();
}

/**
 * Check if user is currently authenticated.
 */
export function isAuthenticated(): boolean {
    return getToken() !== null;
}
