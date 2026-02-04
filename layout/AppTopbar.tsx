/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { OverlayPanel } from 'primereact/overlaypanel';
import { logoutAndRedirect, getCookie } from '@/lib/utils/auth';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const router = useRouter();
    const [tenant, setTenant] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const profileMenuRef = useRef<OverlayPanel>(null);

    useEffect(() => {
        setTenant(getCookie('tenant'));

        // Fetch current user profile
        (async () => {
            try {
                const res = await fetch('/api/me', { method: 'GET' });
                if (!res.ok) return;
                const user = await res.json();
                setUserName(user?.UserName || user?.userName || user?.Email || user?.email || null);
            } catch {
                // Ignore fetch errors
            }
        })();
    }, []);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'dark'}.svg`} width="47.22px" height={'35px'} alt="logo" />
                <span>SAKAI</span>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                {tenant && (
                    <span className="p-link layout-topbar-button" style={{ cursor: 'default' }}>
                        <i className="pi pi-building"></i>
                        <span>Tenant: {tenant}</span>
                    </span>
                )}
                <button
                    type="button"
                    className="p-link layout-topbar-button"
                    onClick={(e) => profileMenuRef.current?.toggle(e)}
                >
                    <i className="pi pi-user"></i>
                    <span>{userName ?? 'Profile'}</span>
                </button>
                <OverlayPanel ref={profileMenuRef} dismissable closeOnEscape>
                    <div className="flex flex-column gap-2 min-w-max">
                        <button
                            type="button"
                            className="p-link flex align-items-center gap-2"
                            onClick={() => router.push('/pages/profile')}
                        >
                            <i className="pi pi-id-card" />
                            <span>Perfil</span>
                        </button>
                        <button
                            type="button"
                            className="p-link flex align-items-center gap-2"
                            onClick={() => router.push('/documentation')}
                        >
                            <i className="pi pi-cog" />
                            <span>Configuración</span>
                        </button>
                        <button
                            type="button"
                            className="p-link flex align-items-center gap-2"
                            onClick={() => logoutAndRedirect(router)}
                        >
                            <i className="pi pi-sign-out" />
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                </OverlayPanel>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
