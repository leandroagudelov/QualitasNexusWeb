/**
 * useProfile Hook
 * Manages profile state and operations with optimistic updates
 */

import { useState, useCallback, useEffect } from 'react';
import { UserDto, UpdateProfileRequest, ChangePasswordRequest } from '@/types/profile';
import { fetchCurrentProfile, updateProfile, changePassword } from '@/lib/api/profile';
import {
  detectProfileChanges,
  ProfileChanges,
  getChangesSummary,
} from '@/lib/utils/profileChanges';
import {
  logProfileUpdate,
  logPasswordChange,
} from '@/lib/utils/securityLogger';

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
      console.log('[PROFILE_HOOK] Starting profile update with data:', data);
      await updateProfile(data);
      console.log('[PROFILE_HOOK] Update successful, now refreshing profile data');
      // Refresh profile to get updated data from server
      await loadProfile();
      console.log('[PROFILE_HOOK] Profile refreshed after update');
      setProfile(prev => ({ ...prev, saving: false }));
      // Log successful profile update
      logProfileUpdate(Object.keys(data).filter(k => k !== 'deleteCurrentImage' && data[k as keyof UpdateProfileRequest]), true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar el perfil';
      console.error('[PROFILE_HOOK] Update failed:', message);
      setProfile(prev => ({ ...prev, error: message, saving: false }));
      // Log failed profile update
      logProfileUpdate([], false, message);
      throw error;
    }
  }, [loadProfile]);

  const handleChangePassword = useCallback(async (data: ChangePasswordRequest) => {
    setPasswordState({ loading: true, error: null });
    try {
      await changePassword(data);
      setPasswordState({ loading: false, error: null });
      // Log successful password change
      logPasswordChange(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cambiar la contraseña';
      setPasswordState({ loading: false, error: message });
      // Log failed password change
      logPasswordChange(false, message);
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setProfile(prev => ({ ...prev, error: null }));
    setPasswordState(prev => ({ ...prev, error: null }));
  }, []);

  const detectChanges = useCallback(
    (currentValues: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      imageFile: File | null;
      deleteCurrentImage: boolean;
    }): ProfileChanges => {
      return detectProfileChanges(profile.user, currentValues);
    },
    [profile.user]
  );

  return {
    // Profile
    user: profile.user,
    profileLoading: profile.loading,
    profileSaving: profile.saving,
    profileError: profile.error,
    updateProfile: handleUpdateProfile,
    loadProfile,
    detectChanges,

    // Password
    passwordLoading: passwordState.loading,
    passwordError: passwordState.error,
    changePassword: handleChangePassword,

    // General
    clearError,
  };
}
