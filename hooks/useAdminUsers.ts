'use client';

import { useCallback, useState } from 'react';
import * as userApi from '@/lib/api/users';

export function useAdminUsers() {
  const [users, setUsers] = useState<userApi.UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadUsers = useCallback(async (search?: string, orderBy?: string) => {
    setLoading(true);
    setError(null);
    try {
      // Try search endpoint first if search term provided
      if (search) {
        const response = await userApi.searchUsers(search, pageNumber, pageSize, orderBy);
        setUsers(response.data || []);
        setTotal(response.totalCount || 0);
      } else {
        // Fall back to list endpoint
        const data = await userApi.listUsers();
        setUsers(data);
        setTotal(data.length);
      }
    } catch (err) {
      const message = err instanceof userApi.ApiError ? err.message : 'Failed to load users';
      setError(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize]);

  const loadUserById = useCallback(async (userId: string): Promise<userApi.UserDto | null> => {
    try {
      return await userApi.getUserById(userId);
    } catch (err) {
      const message = err instanceof userApi.ApiError ? err.message : 'Failed to load user';
      setError(message);
      return null;
    }
  }, []);

  const createUser = useCallback(async (data: userApi.CreateUserRequest): Promise<boolean> => {
    setError(null);
    try {
      await userApi.createUser(data);
      await loadUsers();
      return true;
    } catch (err) {
      const message = err instanceof userApi.ApiError ? err.message : 'Failed to create user';
      setError(message);
      return false;
    }
  }, [loadUsers]);

  const updateUser = useCallback(async (userId: string, data: userApi.UpdateUserRequest): Promise<boolean> => {
    setError(null);
    try {
      await userApi.updateUser(userId, data);
      await loadUsers();
      return true;
    } catch (err) {
      const message = err instanceof userApi.ApiError ? err.message : 'Failed to update user';
      setError(message);
      return false;
    }
  }, [loadUsers]);

  const deleteUserById = useCallback(async (userId: string): Promise<boolean> => {
    setError(null);
    try {
      await userApi.deleteUser(userId);
      await loadUsers();
      return true;
    } catch (err) {
      const message = err instanceof userApi.ApiError ? err.message : 'Failed to delete user';
      setError(message);
      return false;
    }
  }, [loadUsers]);

  const toggleStatus = useCallback(async (userId: string, isActive: boolean): Promise<boolean> => {
    setError(null);
    try {
      await userApi.toggleUserStatus(userId, !isActive);
      await loadUsers();
      return true;
    } catch (err) {
      const message = err instanceof userApi.ApiError ? err.message : 'Failed to toggle user status';
      setError(message);
      return false;
    }
  }, [loadUsers]);

  const getUserRoles = useCallback(async (userId: string): Promise<userApi.UserRolesResponse | null> => {
    try {
      return await userApi.getUserRoles(userId);
    } catch (err) {
      const message = err instanceof userApi.ApiError ? err.message : 'Failed to load user roles';
      setError(message);
      return null;
    }
  }, []);

  const assignRoles = useCallback(async (userId: string, roleIds: string[]): Promise<boolean> => {
    setError(null);
    try {
      await userApi.assignUserRoles(userId, roleIds);
      return true;
    } catch (err) {
      const message = err instanceof userApi.ApiError ? err.message : 'Failed to assign roles';
      setError(message);
      return false;
    }
  }, []);

  return {
    users,
    loading,
    error,
    total,
    pageNumber,
    pageSize,
    setPageNumber,
    setPageSize,
    loadUsers,
    loadUserById,
    createUser,
    updateUser,
    deleteUserById,
    toggleStatus,
    getUserRoles,
    assignRoles,
  };
}
