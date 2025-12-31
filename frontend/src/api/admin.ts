/**
 * Admin API Client for User Management
 * 
 * All endpoints require Admin role.
 */

import { api } from './client';

export interface AdminUser {
    id: number;
    email: string;
    role: string;
    is_active: boolean;
}

export interface CreateUserData {
    email: string;
    password: string;
    role: string;
}

export interface UpdateUserData {
    role?: string;
    is_active?: boolean;
}

/**
 * Get all users. Admin only.
 */
export async function listUsers(): Promise<AdminUser[]> {
    const response = await api.get<AdminUser[]>('/api/admin/users');
    return response.data;
}

/**
 * Create a new user with specified role. Admin only.
 */
export async function createUser(data: CreateUserData): Promise<AdminUser> {
    const response = await api.post<AdminUser>('/api/admin/users', data);
    return response.data;
}

/**
 * Update user role or status. Admin only.
 */
export async function updateUser(userId: number, data: UpdateUserData): Promise<AdminUser> {
    const response = await api.put<AdminUser>(`/api/admin/users/${userId}`, data);
    return response.data;
}

/**
 * Delete a user. Admin only.
 */
export async function deleteUser(userId: number): Promise<void> {
    await api.delete(`/api/admin/users/${userId}`);
}
