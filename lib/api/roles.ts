import { apiConfig } from '@/lib/config/api';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

const API_BASE = apiConfig.baseUrl;

export interface RoleDto {
  id: string;
  name: string;
  description?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  id: string;
  name: string;
  description?: string;
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
 * List all roles
 */
export async function listRoles(): Promise<RoleDto[]> {
  try {
    const response = await fetchWithAuth(`/api/admin/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to fetch roles: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to fetch roles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get role by ID
 */
export async function getRoleById(roleId: string): Promise<RoleDto> {
  try {
    const response = await fetchWithAuth(`/api/admin/roles/${roleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to fetch role: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to fetch role: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create or update role (POST to /roles creates, PUT updates)
 */
export async function upsertRole(data: CreateRoleRequest | UpdateRoleRequest): Promise<RoleDto> {
  try {
    const response = await fetchWithAuth(`/api/admin/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to save role: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to save role: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete role
 */
export async function deleteRole(roleId: string): Promise<void> {
  try {
    const response = await fetchWithAuth(`/api/admin/roles/${roleId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to delete role: ${response.statusText}`);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to delete role: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get role permissions
 */
export async function getRolePermissions(roleId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/identity/roles/${roleId}/permissions`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to fetch role permissions: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to fetch role permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update role permissions
 */
export async function updateRolePermissions(roleId: string, permissions: string[]): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/identity/roles/${roleId}/permissions`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ permissions }),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to update role permissions: ${response.statusText}`);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to update role permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
