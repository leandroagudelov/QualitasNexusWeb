import { apiConfig } from '@/lib/config/api';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

const API_BASE = apiConfig.baseUrl;

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userName: string;
  isActive: boolean;
  emailConfirmed: boolean;
  imageUrl?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  image?: FileList;
  deleteCurrentImage?: boolean;
}

export interface UserRolesResponse {
  userId: string;
  userEmail: string;
  roles: string[];
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * List all users
 */
export async function listUsers(): Promise<UserDto[]> {
  try {
    const response = await fetchWithAuth(`/api/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to fetch users: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search users with pagination and filtering
 */
export async function searchUsers(
  search?: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  orderBy?: string,
  isActive?: boolean,
  emailConfirmed?: boolean
): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (orderBy) params.append('orderBy', orderBy);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    if (emailConfirmed !== undefined) params.append('emailConfirmed', emailConfirmed.toString());

    const response = await fetchWithAuth(`/api/admin/users?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to search users: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserDto> {
  try {
    const response = await fetchWithAuth(`/api/admin/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to fetch user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserRequest): Promise<{ id: string }> {
  try {
    const response = await fetchWithAuth(`/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ApiError(response.status, `Failed to create user: ${error || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update user
 */
export async function updateUser(userId: string, data: UpdateUserRequest): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('phoneNumber', data.phoneNumber);
    if (data.deleteCurrentImage) {
      formData.append('deleteCurrentImage', 'true');
    }
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }

    const response = await fetchWithAuth(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to update user: ${response.statusText}`);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    const response = await fetchWithAuth(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to delete user: ${response.statusText}`);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Toggle user status (activate/deactivate)
 */
export async function toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
  try {
    const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to toggle user status: ${response.statusText}`);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to toggle user status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get user roles
 */
export async function getUserRoles(userId: string): Promise<UserRolesResponse> {
  try {
    const response = await fetch(`/api/admin/users/${userId}/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to fetch user roles: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to fetch user roles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Assign roles to user
 */
export async function assignUserRoles(userId: string, roleIds: string[]): Promise<void> {
  try {
    const response = await fetch(`/api/admin/users/${userId}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roleIds }),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to assign roles: ${response.statusText}`);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to assign roles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
