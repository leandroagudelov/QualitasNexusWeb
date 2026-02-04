'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { validatePasswordForm } from '@/lib/validators/profile';
import { ChangePasswordRequest } from '@/types/profile';

interface PasswordFormProps {
  onSubmit: (data: ChangePasswordRequest) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function PasswordForm({ onSubmit, isLoading, error }: PasswordFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  // Validate all fields
  const errors = useMemo(
    () =>
      validatePasswordForm({
        password: currentPassword,
        newPassword,
        confirmNewPassword,
      }),
    [currentPassword, newPassword, confirmNewPassword]
  );

  const handleBlur = useCallback((field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Mark all fields as touched to show errors
      setTouched({
        currentPassword: true,
        newPassword: true,
        confirmNewPassword: true,
      });

      // Validate all fields
      const validationErrors = validatePasswordForm({
        password: currentPassword,
        newPassword,
        confirmNewPassword,
      });

      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      try {
        await onSubmit({
          password: currentPassword,
          newPassword,
          confirmNewPassword,
        });

        // Clear form on success
        formRef.current?.reset();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTouched({
          currentPassword: false,
          newPassword: false,
          confirmNewPassword: false,
        });
      } catch {
        // Error is handled by parent component
      }
    },
    [currentPassword, newPassword, confirmNewPassword, onSubmit]
  );

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="p-fluid grid gap-0">
      {/* Current Password */}
      <div className="col-12">
        <div className="field mb-2">
          <label htmlFor="currentPassword" className="text-xs font-semibold block mb-1">
            Contraseña actual *
          </label>
          <InputText
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            onBlur={() => handleBlur('currentPassword')}
            placeholder="••••••"
            className={classNames('w-full text-xs', {
              'p-invalid': touched.currentPassword && !!errors.password,
            })}
            style={{ padding: '0.5rem' }}
            disabled={isLoading}
          />
          {touched.currentPassword && errors.password && (
            <small className="p-error text-xs">{errors.password}</small>
          )}
        </div>
      </div>

      {/* New Password */}
      <div className="col-12">
        <div className="field mb-2">
          <label htmlFor="newPassword" className="text-xs font-semibold block mb-1">
            Nueva contraseña *
          </label>
          <InputText
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onBlur={() => handleBlur('newPassword')}
            placeholder="8+ caracteres"
            className={classNames('w-full text-xs', {
              'p-invalid': touched.newPassword && !!errors.newPassword,
            })}
            style={{ padding: '0.5rem' }}
            disabled={isLoading}
          />
          {touched.newPassword && errors.newPassword && (
            <small className="p-error text-xs">{errors.newPassword}</small>
          )}
        </div>
      </div>

      {/* Confirm Password */}
      <div className="col-12">
        <div className="field mb-2">
          <label htmlFor="confirmNewPassword" className="text-xs font-semibold block mb-1">
            Confirmar contraseña *
          </label>
          <InputText
            id="confirmNewPassword"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            onBlur={() => handleBlur('confirmNewPassword')}
            placeholder="••••••"
            className={classNames('w-full text-xs', {
              'p-invalid': touched.confirmNewPassword && !!errors.confirmNewPassword,
            })}
            style={{ padding: '0.5rem' }}
            disabled={isLoading}
          />
          {touched.confirmNewPassword && errors.confirmNewPassword && (
            <small className="p-error text-xs">{errors.confirmNewPassword}</small>
          )}
        </div>
      </div>

      {/* API Error */}
      {error && !error.includes('image') && (
        <div className="col-12 mb-2 p-2 border-round border-left-4 border-red-500 bg-red-50 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="col-12">
        <button
          type="submit"
          disabled={isLoading || Object.keys(errors).length > 0}
          className={classNames(
            'p-button p-button-warning p-button-sm w-full',
            { 'p-disabled': isLoading || Object.keys(errors).length > 0 }
          )}
        >
          {isLoading ? (
            <>
              <i className="pi pi-spin pi-spinner" style={{ marginRight: '0.5rem' }} />
              Cambiando...
            </>
          ) : (
            <>
              <i className="pi pi-key" style={{ marginRight: '0.5rem' }} />
              Cambiar contraseña
            </>
          )}
        </button>
      </div>
    </form>
  );
}
