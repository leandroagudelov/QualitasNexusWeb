'use client';

import React, { useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { validateProfileForm } from '@/lib/validators/profile';
import { UpdateProfileRequest, ChangePasswordRequest } from '@/types/profile';
import { useProfile } from '@/hooks/useProfile';
import { ProfileForm } from '../../components/ProfileForm';
import { PasswordForm } from '../../components/PasswordForm';
import { AvatarSection } from '../../components/AvatarSection';

export default function ProfilePage() {
  const toast = useRef<Toast>(null);
  const {
    user,
    profileLoading,
    profileSaving,
    profileError,
    updateProfile,
    passwordLoading,
    passwordError,
    changePassword,
    clearError,
  } = useProfile();

  // Profile form state
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [deleteCurrentImage, setDeleteCurrentImage] = React.useState(false);

  // Initialize form with user data
  React.useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    clearError();

    // Validate profile form
    const errors = validateProfileForm({
      firstName,
      lastName,
      email,
      phoneNumber,
      imageFile,
      deleteImage: deleteCurrentImage,
    });

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.current?.show({
        severity: 'warn',
        summary: 'Validación',
        detail: firstError,
        life: 3000,
      });
      return;
    }

    try {
      const payload: UpdateProfileRequest = {
        firstName,
        lastName,
        phoneNumber,
        email,
        image: imageFile || undefined,
        deleteCurrentImage,
      };

      await updateProfile(payload);

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Perfil actualizado correctamente',
        life: 3000,
      });
    } catch (error) {
      // Error is already in profileError state, shown in UI
    } finally {
      // Always clear image and delete flag after attempt
      setImageFile(null);
      setDeleteCurrentImage(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordRequest) => {
    clearError();
    try {
      await changePassword(data);
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Contraseña cambiada correctamente',
        life: 3000,
      });
    } catch (error) {
      // Error is already in passwordError state
      throw error;
    }
  };

  // Loading skeleton
  if (profileLoading) {
    return (
      <div className="p-2">
        <Card>
          <div className="grid gap-2">
            <div className="col-12 flex flex-column align-items-center">
              <Skeleton width="100px" height="100px" borderRadius="50%" className="mb-2" />
              <Skeleton width="40%" height="1.2rem" className="mb-1" />
              <Skeleton width="30%" height="0.8rem" />
            </div>
            <Divider className="my-1" />
            <div className="col-12 lg:col-12">
              <Skeleton width="100%" height="1.8rem" className="mb-1" />
              <Skeleton width="100%" height="1.8rem" className="mb-1" />
             
            </div>
            <div className="col-12 lg:col-12">
              <Skeleton width="100%" height="1.8rem" className="mb-1" />
              <Skeleton width="100%" height="1.8rem" className="mb-1" />
             
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-0" style={{ padding: '1rem' }}>
      <Toast ref={toast} />

      {/* General Error */}
      {(profileError || passwordError) && (
        <div className="mb-2 p-2 border-round border-left-4 border-red-500 bg-red-50 text-red-700 text-xs">
          {profileError || passwordError}
          <button
            onClick={clearError}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
            }}
          >
            ✕
          </button>
        </div>
      )}

      <Card style={{ padding: '1.5rem' }}>
        {/* Header: Avatar + User Info */}
        <div className="flex flex-column align-items-center gap-2 mb-3 pb-3 border-bottom-1 surface-border">
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: 'var(--surface-100)',
              border: '3px solid var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user?.imageUrl && !deleteCurrentImage ? (
              <img
                src={user.imageUrl}
                alt="avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <i className="pi pi-user" style={{ fontSize: '2rem', color: 'var(--primary-color)' }} />
            )}
          </div>
          <div className="text-center">
            <h3 className="m-0 font-semibold text-base">
              {firstName || 'Usuario'} {lastName}
            </h3>
            <p className="text-color-secondary text-xs m-0">@{user?.userName}</p>
          </div>
        </div>

        {/* Main Content: Info full width, then Avatar and Password side by side */}
        <div className="grid gap-3">
          {/* Full Width: Profile Info */}
          <div className="col-12">
            <h4 className="text-sm font-semibold mb-2 mt-0">Información Personal</h4>
            <ProfileForm
              user={user}
              firstName={firstName}
              lastName={lastName}
              email={email}
              phoneNumber={phoneNumber}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onEmailChange={setEmail}
              onPhoneNumberChange={setPhoneNumber}
            />
          </div>
        </div>

        {/* Avatar and Password - Side by Side */}
        <div className="flex gap-2 mt-3" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 calc(50% - 4px)', minWidth: '250px' }}>
            <h4 className="text-sm font-semibold mb-2 mt-0">Foto de Perfil</h4>
            <AvatarSection
              imageUrl={user?.imageUrl}
              imageFile={imageFile}
              deleteCurrentImage={deleteCurrentImage}
              onImageSelect={setImageFile}
              onDeleteToggle={setDeleteCurrentImage}
              error={profileError}
              onErrorClear={clearError}
            />
          </div>

          <div style={{ flex: '1 1 calc(50% - 4px)', minWidth: '250px' }}>
            <h4 className="text-sm font-semibold mb-2 mt-0">Cambiar Contraseña</h4>
            <PasswordForm
              onSubmit={handleChangePassword}
              isLoading={passwordLoading}
              error={passwordError}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <Divider className="my-2" />
        <div className="flex gap-2 justify-content-end">
          <Button
            label="Guardar cambios"
            icon="pi pi-check"
            severity="success"
            size="small"
            onClick={handleSaveProfile}
            disabled={profileSaving}
            loading={profileSaving}
          />
        </div>
      </Card>
    </div>
  );
}
