'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { classNames } from 'primereact/utils';
import { profileValidators } from '@/lib/validators/profile';
import { UserDto } from '@/types/profile';

interface ProfileFormProps {
  user: UserDto | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
}

export function ProfileForm({
  user,
  firstName,
  lastName,
  email,
  phoneNumber,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneNumberChange,
}: ProfileFormProps) {
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
  });

  // Validate fields in real-time
  const errors = useMemo(
    () => ({
      firstName: touched.firstName ? profileValidators.firstName(firstName) : null,
      lastName: touched.lastName ? profileValidators.lastName(lastName) : null,
      email: touched.email ? profileValidators.email(email) : null,
      phoneNumber: touched.phoneNumber ? profileValidators.phoneNumber(phoneNumber) : null,
    }),
    [touched, firstName, lastName, email, phoneNumber]
  );

  const handleBlur = useCallback((field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  return (
    <div className="p-fluid grid gap-0">
      {/* First Name */}
      <div className="col-12 sm:col-6">
        <div className="field mb-1">
          <label htmlFor="firstName" className="text-xs font-semibold block mb-1">
            Nombre *
          </label>
          <InputText
            id="firstName"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            onBlur={() => handleBlur('firstName')}
            placeholder="Tu nombre"
            className={classNames('w-full text-xs', { 'p-invalid': !!errors.firstName })}
            style={{ padding: '0.75rem' }}
          />
          {errors.firstName && <small className="p-error text-xs">{errors.firstName}</small>}
        </div>
      </div>

      {/* Last Name */}
      <div className="col-12 sm:col-6">
        <div className="field mb-1">
          <label htmlFor="lastName" className="text-xs font-semibold block mb-1">
            Apellido *
          </label>
          <InputText
            id="lastName"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            onBlur={() => handleBlur('lastName')}
            placeholder="Tu apellido"
            className={classNames('w-full text-xs', { 'p-invalid': !!errors.lastName })}
            style={{ padding: '0.75rem' }}
          />
          {errors.lastName && <small className="p-error text-xs">{errors.lastName}</small>}
        </div>
      </div>

      {/* Email (Read-only) */}
      <div className="col-12">
        <div className="field mb-1">
          <label htmlFor="email" className="text-xs font-semibold block mb-1">
            Email <span className="text-xs text-color-secondary">(protegido)</span>
          </label>
          <InputText
            id="email"
            type="email"
            value={email}
            disabled
            placeholder="Tu email"
            className="w-full text-xs"
            style={{ padding: '0.75rem' }}
          />
          <small className="text-color-secondary text-xs">
            El email no se puede cambiar por seguridad. Contacta con soporte si necesitas actualizarlo.
          </small>
        </div>
      </div>

      {/* Phone Number */}
      <div className="col-12">
        <div className="field mb-1">
          <label htmlFor="phone" className="text-xs font-semibold block mb-1">
            Teléfono
          </label>
          <InputMask
            id="phone"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(String(e.value ?? ''))}
            onBlur={() => handleBlur('phoneNumber')}
            mask="999 999 9999"
            placeholder="000 000 0000"
            className={classNames('w-full text-xs', { 'p-invalid': !!errors.phoneNumber })}
            style={{ padding: '0.75rem' }}
          />
          {errors.phoneNumber && <small className="p-error text-xs">{errors.phoneNumber}</small>}
        </div>
      </div>
    </div>
  );
}
