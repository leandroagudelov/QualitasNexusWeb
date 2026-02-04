'use client';

import { useCallback, useState } from 'react';
import * as groupApi from '@/lib/api/groups';

export function useAdminGroups() {
  const [groups, setGroups] = useState<groupApi.GroupDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await groupApi.listGroups(search);
      setGroups(data);
    } catch (err) {
      const message = err instanceof groupApi.ApiError ? err.message : 'Failed to load groups';
      setError(message);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGroupById = useCallback(async (groupId: string): Promise<groupApi.GroupDto | null> => {
    try {
      return await groupApi.getGroupById(groupId);
    } catch (err) {
      const message = err instanceof groupApi.ApiError ? err.message : 'Failed to load group';
      setError(message);
      return null;
    }
  }, []);

  const createGroup = useCallback(async (data: groupApi.CreateGroupRequest): Promise<boolean> => {
    setError(null);
    try {
      await groupApi.createGroup(data);
      await loadGroups();
      return true;
    } catch (err) {
      const message = err instanceof groupApi.ApiError ? err.message : 'Failed to create group';
      setError(message);
      return false;
    }
  }, [loadGroups]);

  const updateGroup = useCallback(async (data: groupApi.UpdateGroupRequest): Promise<boolean> => {
    setError(null);
    try {
      await groupApi.updateGroup(data);
      await loadGroups();
      return true;
    } catch (err) {
      const message = err instanceof groupApi.ApiError ? err.message : 'Failed to update group';
      setError(message);
      return false;
    }
  }, [loadGroups]);

  const deleteGroup = useCallback(async (groupId: string): Promise<boolean> => {
    setError(null);
    try {
      await groupApi.deleteGroup(groupId);
      await loadGroups();
      return true;
    } catch (err) {
      const message = err instanceof groupApi.ApiError ? err.message : 'Failed to delete group';
      setError(message);
      return false;
    }
  }, [loadGroups]);

  const getMembers = useCallback(async (groupId: string): Promise<groupApi.GroupMemberDto[] | null> => {
    try {
      return await groupApi.getGroupMembers(groupId);
    } catch (err) {
      const message = err instanceof groupApi.ApiError ? err.message : 'Failed to load group members';
      setError(message);
      return null;
    }
  }, []);

  const addUsers = useCallback(async (groupId: string, userIds: string[]): Promise<boolean> => {
    setError(null);
    try {
      await groupApi.addUsersToGroup(groupId, userIds);
      await loadGroups();
      return true;
    } catch (err) {
      const message = err instanceof groupApi.ApiError ? err.message : 'Failed to add users to group';
      setError(message);
      return false;
    }
  }, [loadGroups]);

  const removeUser = useCallback(async (groupId: string, userId: string): Promise<boolean> => {
    setError(null);
    try {
      await groupApi.removeUserFromGroup(groupId, userId);
      await loadGroups();
      return true;
    } catch (err) {
      const message = err instanceof groupApi.ApiError ? err.message : 'Failed to remove user from group';
      setError(message);
      return false;
    }
  }, [loadGroups]);

  const getUserGroups = useCallback(async (userId: string): Promise<groupApi.GroupDto[] | null> => {
    try {
      return await groupApi.getUserGroups(userId);
    } catch (err) {
      const message = err instanceof groupApi.ApiError ? err.message : 'Failed to load user groups';
      setError(message);
      return null;
    }
  }, []);

  return {
    groups,
    loading,
    error,
    loadGroups,
    loadGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    getMembers,
    addUsers,
    removeUser,
    getUserGroups,
  };
}
