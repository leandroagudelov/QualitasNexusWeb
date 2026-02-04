'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const adminLinks = [
    { href: '/admin/users', label: 'Usuarios', icon: '👥' },
    { href: '/admin/roles', label: 'Roles', icon: '🔐' },
    { href: '/admin/groups', label: 'Grupos', icon: '👫' },
  ];

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '250px',
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid #ddd',
          padding: '1rem',
          overflowY: 'auto',
        }}
      >
        <h3 style={{ marginTop: 0, paddingBottom: '1rem', borderBottom: '1px solid #ddd' }}>
          Administración
        </h3>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '4px',
                textDecoration: 'none',
                color: pathname === link.href ? '#fff' : '#333',
                backgroundColor: pathname === link.href ? '#007bff' : 'transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: pathname === link.href ? 600 : 400,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (pathname !== link.href) {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== link.href) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: '2rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
