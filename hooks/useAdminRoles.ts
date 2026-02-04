'use client';

import { useCallback, useState } from 'react';
import * as roleApi from '@/lib/api/roles';

export function useAdminRoles() {
  const [roles, setRoles] = useState<roleApi.RoleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roleApi.listRoles();
      setRoles(data);
    } catch (err) {
      const message = err instanceof roleApi.ApiError ? err.message : 'Failed to load roles';
      setError(message);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoleById = useCallback(async (roleId: string): Promise<roleApi.RoleDto | null> => {
    try {
      return await roleApi.getRoleById(roleId);
    } catch (err) {
      const message = err instanceof roleApi.ApiError ? err.message : 'Failed to load role';
      setError(message);
      return null;
    }
  }, []);

  const createRole = useCallback(async (data: roleApi.CreateRoleRequest): Promise<boolean> => {
    setError(null);
    try {
      await roleApi.upsertRole(data);
      await loadRoles();
      return true;
    } catch (err) {
      const message = err instanceof roleApi.ApiError ? err.message : 'Failed to create role';
      setError(message);
      return false;
    }
  }, [loadRoles]);

  const updateRole = useCallback(async (data: roleApi.UpdateRoleRequest): Promise<boolean> => {
    setError(null);
    try {
      await roleApi.upsertRole(data);
      await loadRoles();
      return true;
    } catch (err) {
      const message = err instanceof roleApi.ApiError ? err.message : 'Failed to update role';
      setError(message);
      return false;
    }
  }, [loadRoles]);

  const deleteRole = useCallback(async (roleId: string): Promise<boolean> => {
    setError(null);
    try {
      await roleApi.deleteRole(roleId);
      await loadRoles();
      return true;
    } catch (err) {
      const message = err instanceof roleApi.ApiError ? err.message : 'Failed to delete role';
      setError(message);
      return false;
    }
  }, [loadRoles]);

  const getPermissions = useCallback(async (roleId: string): Promise<any | null> => {
    try {
      return await roleApi.getRolePermissions(roleId);
    } catch (err) {
      const message = err instanceof roleApi.ApiError ? err.message : 'Failed to load permissions';
      setError(message);
      return null;
    }
  }, []);

  const updatePermissions = useCallback(
    async (roleId: string, permissions: string[]): Promise<boolean> => {
      setError(null);
      try {
        await roleApi.updateRolePermissions(roleId, permissions);
        return true;
      } catch (err) {
        const message = err instanceof roleApi.ApiError ? err.message : 'Failed to update permissions';
        setError(message);
        return false;
      }
    },
    []
  );

  return {
    roles,
    loading,
    error,
    loadRoles,
    loadRoleById,
    createRole,
    updateRole,
    deleteRole,
    getPermissions,
    updatePermissions,
  };
}
