import { apiConfig } from '@/lib/config/api';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

const API_BASE = apiConfig.baseUrl;

export interface GroupDto {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  roles?: string[];
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  roleIds?: string[];
}

export interface UpdateGroupRequest {
  id: string;
  name: string;
  description?: string;
  roleIds?: string[];
}

export interface GroupMemberDto {
  userId: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
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
 * List all groups
 */
export async function listGroups(search?: string): Promise<GroupDto[]> {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);

    const response = await fetchWithAuth(`/api/admin/groups${params ? `?${params}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to fetch groups: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to fetch groups: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get group by ID
 */
export async function getGroupById(groupId: string): Promise<GroupDto> {
  try {
    const response = await fetchWithAuth(`/api/admin/groups/${groupId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to fetch group: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to fetch group: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new group
 */
export async function createGroup(data: CreateGroupRequest): Promise<GroupDto> {
  try {
    const response = await fetchWithAuth(`/api/admin/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to create group: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to create group: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update group
 */
export async function updateGroup(data: UpdateGroupRequest): Promise<void> {
  try {
    const response = await fetchWithAuth(`/api/admin/groups/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        roleIds: data.roleIds,
      }),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to update group: ${response.statusText}`);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to update group: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete group
 */
export async function deleteGroup(groupId: string): Promise<void> {
  try {
    const response = await fetchWithAuth(`/api/admin/groups/${groupId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to delete group: ${response.statusText}`);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to delete group: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get group members
 */
export async function getGroupMembers(groupId: string): Promise<GroupMemberDto[]> {
  try {
    const response = await fetchWithAuth(`/api/admin/groups/${groupId}/members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to fetch group members: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to fetch group members: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Add users to group
 */
export async function addUsersToGroup(groupId: string, userIds: string[]): Promise<any> {
  try {
    const response = await fetchWithAuth(`/api/admin/groups/${groupId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userIds }),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to add users to group: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to add users to group: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Remove user from group
 */
export async function removeUserFromGroup(groupId: string, userId: string): Promise<void> {
  try {
    const response = await fetchWithAuth(`/api/admin/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to remove user from group: ${response.statusText}`);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to remove user from group: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get user's groups
 */
export async function getUserGroups(userId: string): Promise<GroupDto[]> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/identity/users/${userId}/groups`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to fetch user groups: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to fetch user groups: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
