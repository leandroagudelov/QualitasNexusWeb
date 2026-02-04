/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useState, useRef, useMemo } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { logLoginAttempt, logLoginError } from '@/lib/utils/securityLogger';
import { setTenant as saveTenant, saveAuthTokens } from '@/lib/utils/apiConfig';

// Validación de email
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tenant, setTenant] = useState('root');
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { layoutConfig } = useContext(LayoutContext);

    // Ref para cancelar requests en vuelo
    const abortControllerRef = useRef<AbortController | null>(null);

    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    // Validación de formulario
    const isFormValid = useMemo(() => {
        return isValidEmail(email) && password.length > 0;
    }, [email, password]);

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`} alt="Sakai logo" className="mb-5 w-6rem flex-shrink-0" />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <img src="/demo/images/login/avatar.png" alt="Image" height="50" className="mb-3" />
                            <div className="text-900 text-3xl font-medium mb-3">Welcome, Isabel!</div>
                            <span className="text-600 font-medium">Sign in to continue</span>
                        </div>

                        <div>
                            <label htmlFor="loginEmail" className="block text-900 text-xl font-medium mb-2">
                                Email
                            </label>
                            <InputText
                                id="loginEmail"
                                type="email"
                                placeholder="Email address"
                                className="w-full md:w-30rem mb-5"
                                style={{ padding: '1rem' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />

                            <label htmlFor="loginPassword" className="block text-900 font-medium text-xl mb-2">
                                Password
                            </label>
                            <Password
                                inputId="loginPassword"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                toggleMask
                                feedback={false}
                                className="w-full mb-3"
                                inputClassName="w-full p-3 md:w-30rem"
                                disabled={loading}
                            ></Password>

                            {error && <div className="text-red-500 mb-3">{error}</div>}

                            <label htmlFor="loginTenant" className="block text-900 text-xl font-medium mb-2">
                                Tenant
                            </label>
                            <InputText
                                id="loginTenant"
                                type="text"
                                placeholder="Tenant (default: root)"
                                className="w-full md:w-30rem mb-5"
                                style={{ padding: '1rem' }}
                                value={tenant}
                                onChange={(e) => setTenant(e.target.value)}
                                disabled={loading}
                            />

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2"></Checkbox>
                                    <label htmlFor="rememberme1">Remember me</label>
                                </div>
                                <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                    Forgot password?
                                </a>
                            </div>
                            <Button
                                label={loading ? 'Signing In...' : 'Sign In'}
                                className="w-full p-3 text-xl"
                                disabled={loading || !isFormValid}
                                onClick={async () => {
                                    // Cancelar request anterior si existe
                                    if (abortControllerRef.current) {
                                        abortControllerRef.current.abort();
                                    }

                                    // Crear nuevo abort controller
                                    abortControllerRef.current = new AbortController();

                                    setError(null);
                                    setLoading(true);
                                    try {
                                        const res = await fetch('/api/auth/login', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'tenant': tenant,  // ← Enviar en header
                                            },
                                            body: JSON.stringify({ email, password }),  // ← Remover tenant del body
                                            signal: abortControllerRef.current.signal,
                                        });
                                        if (!res.ok) {
                                            const body = await res.json().catch(() => ({}));
                                            const errorMessage =
                                                res.status === 401
                                                    ? 'Email o contraseña incorrectos'
                                                    : res.status === 400
                                                      ? body?.message || 'Datos inválidos'
                                                      : body?.message || 'Error al iniciar sesión';
                                            setError(errorMessage);
                                            logLoginAttempt(email, false, errorMessage);
                                            return;
                                        }

                                        // Guardar tenant y tokens
                                        const data = await res.json();
                                        saveTenant(tenant);
                                        saveAuthTokens({
                                            accessToken: data.accessToken,
                                            refreshToken: data.refreshToken,
                                            accessTokenExpiresAt: data.accessTokenExpiresAt,
                                            refreshTokenExpiresAt: data.refreshTokenExpiresAt,
                                        });

                                        logLoginAttempt(email, true);
                                        router.push('/');
                                    } catch (error) {
                                        // Ignorar errores de abort
                                        if (error instanceof Error && error.name === 'AbortError') {
                                            return;
                                        }

                                        let message = 'Error al conectar con el servidor';
                                        if (error instanceof TypeError && error.message.includes('fetch')) {
                                            message = 'No se pudo conectar. Verifica tu conexión a internet';
                                        } else if (error instanceof Error) {
                                            message = error.message;
                                        }

                                        setError(message);
                                        logLoginError(email, message);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            ></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
