/**
 * useProfile Hook
 * Manages profile state and operations with optimistic updates
 */

import { useState, useCallback, useEffect } from 'react';
import { UserDto, UpdateProfileRequest, ChangePasswordRequest } from '@/types/profile';
import { fetchCurrentProfile, updateProfile, changePassword } from '@/lib/api/profile';

interface ProfileState {
  user: UserDto | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

interface PasswordState {
  loading: boolean;
  error: string | null;
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileState>({
    user: null,
    loading: true,
    saving: false,
    error: null,
  });

  const [passwordState, setPasswordState] = useState<PasswordState>({
    loading: false,
    error: null,
  });

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = useCallback(async () => {
    setProfile(prev => ({ ...prev, loading: true, error: null }));
    try {
      const user = await fetchCurrentProfile();
      setProfile(prev => ({ ...prev, user, loading: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar el perfil';
      setProfile(prev => ({ ...prev, error: message, loading: false }));
    }
  }, []);

  const handleUpdateProfile = useCallback(async (data: UpdateProfileRequest) => {
    setProfile(prev => ({ ...prev, saving: true, error: null }));
    try {
      await updateProfile(data);
      // Refresh profile to get updated data
      await loadProfile();
      setProfile(prev => ({ ...prev, saving: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar el perfil';
      setProfile(prev => ({ ...prev, error: message, saving: false }));
      throw error;
    }
  }, [loadProfile]);

  const handleChangePassword = useCallback(async (data: ChangePasswordRequest) => {
    setPasswordState({ loading: true, error: null });
    try {
      await changePassword(data);
      setPasswordState({ loading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cambiar la contraseña';
      setPasswordState({ loading: false, error: message });
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setProfile(prev => ({ ...prev, error: null }));
    setPasswordState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // Profile
    user: profile.user,
    profileLoading: profile.loading,
    profileSaving: profile.saving,
    profileError: profile.error,
    updateProfile: handleUpdateProfile,
    loadProfile,

    // Password
    passwordLoading: passwordState.loading,
    passwordError: passwordState.error,
    changePassword: handleChangePassword,

    // General
    clearError,
  };
}
