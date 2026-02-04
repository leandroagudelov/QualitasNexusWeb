'use client';

import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { useRef } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import * as userApi from '@/lib/api/users';

export default function UsersPage() {
  const { users, loading, error, loadUsers, deleteUserById, toggleStatus } = useAdminUsers();
  const [visible, setVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<userApi.UserDto | null>(null);
  const [formData, setFormData] = useState<Partial<userApi.CreateUserRequest & { confirmPassword?: string }>>({});
  const [showPassword, setShowPassword] = useState(false);
  const toast = useRef<any>(null);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const showToast = (severity: 'success' | 'error' | 'info', message: string) => {
    toast.current?.show({ severity, summary: 'Mensaje', detail: message, life: 3000 });
  };

  const openDialog = (user?: userApi.UserDto) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        userName: '',
        password: '',
        confirmPassword: '',
      });
    }
    setVisible(true);
  };

  const closeDialog = () => {
    setVisible(false);
    setEditingUser(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      showToast('error', 'Por favor completa todos los campos requeridos');
      return;
    }

    if (editingUser) {
      // Update user
      try {
        await userApi.updateUser(editingUser.id, {
          firstName: formData.firstName!,
          lastName: formData.lastName!,
          phoneNumber: formData.phoneNumber || '',
        });
        showToast('success', 'Usuario actualizado correctamente');
        closeDialog();
        loadUsers();
      } catch (error) {
        const errorMsg = error instanceof userApi.ApiError ? error.message : 'Error al actualizar usuario';
        showToast('error', errorMsg);
      }
    } else {
      // Create user
      if (!formData.userName || !formData.password || !formData.confirmPassword) {
        showToast('error', 'Por favor completa todos los campos requeridos para crear usuario');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        showToast('error', 'Las contraseñas no coinciden');
        return;
      }

      try {
        await userApi.createUser({
          firstName: formData.firstName!,
          lastName: formData.lastName!,
          email: formData.email!,
          userName: formData.userName!,
          password: formData.password!,
          confirmPassword: formData.confirmPassword!,
          phoneNumber: formData.phoneNumber || '',
        });
        showToast('success', 'Usuario creado correctamente');
        closeDialog();
        loadUsers();
      } catch (error) {
        const errorMsg = error instanceof userApi.ApiError ? error.message : 'Error al crear usuario';
        showToast('error', errorMsg);
      }
    }
  };

  const handleDelete = async (user: userApi.UserDto) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${user.firstName} ${user.lastName}?`)) {
      const success = await deleteUserById(user.id);
      if (success) {
        showToast('success', 'Usuario eliminado correctamente');
      } else {
        showToast('error', 'Error al eliminar el usuario');
      }
    }
  };

  const handleToggleStatus = async (user: userApi.UserDto) => {
    const success = await toggleStatus(user.id, user.isActive);
    if (success) {
      showToast('success', `Usuario ${!user.isActive ? 'activado' : 'desactivado'} correctamente`);
    } else {
      showToast('error', 'Error al cambiar el estado del usuario');
    }
  };

  const statusTemplate = (rowData: userApi.UserDto) => {
    return (
      <Tag
        value={rowData.isActive ? 'Activo' : 'Inactivo'}
        severity={rowData.isActive ? 'success' : 'danger'}
      />
    );
  };

  const emailConfirmedTemplate = (rowData: userApi.UserDto) => {
    return (
      <Tag
        value={rowData.emailConfirmed ? 'Confirmado' : 'Pendiente'}
        severity={rowData.emailConfirmed ? 'success' : 'warning'}
      />
    );
  };

  const actionTemplate = (rowData: userApi.UserDto) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          icon="pi pi-pencil"
          rounded
          severity="info"
          size="small"
          onClick={() => openDialog(rowData)}
          tooltip="Editar"
        />
        <Button
          icon={rowData.isActive ? 'pi pi-ban' : 'pi pi-check'}
          rounded
          severity={rowData.isActive ? 'warning' : 'success'}
          size="small"
          onClick={() => handleToggleStatus(rowData)}
          tooltip={rowData.isActive ? 'Desactivar' : 'Activar'}
        />
        <Button
          icon="pi pi-trash"
          rounded
          severity="danger"
          size="small"
          onClick={() => handleDelete(rowData)}
          tooltip="Eliminar"
        />
      </div>
    );
  };

  return (
    <div style={{ padding: '0' }}>
      <Toast ref={toast} />

      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Gestión de Usuarios</h1>
        <Button
          label="Nuevo Usuario"
          icon="pi pi-plus"
          onClick={() => openDialog()}
          style={{ marginRight: '0.5rem' }}
        />
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <DataTable
          value={users}
          paginator
          rows={10}
          loading={loading}
          dataKey="id"
          responsiveLayout="scroll"
          tableStyle={{ minWidth: '50rem' }}
        >
          <Column field="firstName" header="Nombre" />
          <Column field="lastName" header="Apellido" />
          <Column field="email" header="Email" />
          <Column field="phoneNumber" header="Teléfono" />
          <Column field="userName" header="Usuario" />
          <Column header="Estado" body={statusTemplate} />
          <Column header="Email Confirmado" body={emailConfirmedTemplate} />
          <Column header="Acciones" body={actionTemplate} style={{ width: '200px' }} />
        </DataTable>
      </div>

      <Dialog
        header={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        visible={visible}
        onHide={closeDialog}
        modal
        style={{ width: '50vw' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Nombre *
            </label>
            <InputText
              value={formData.firstName || ''}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              placeholder="Nombre"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Apellido *
            </label>
            <InputText
              value={formData.lastName || ''}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              placeholder="Apellido"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Email {editingUser ? '' : '*'}
            </label>
            <InputText
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!editingUser}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: editingUser ? '#f5f5f5' : '#fff',
              }}
              placeholder="Email"
            />
          </div>

          {!editingUser && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Usuario *
                </label>
                <InputText
                  value={formData.userName || ''}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                  placeholder="Usuario"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Contraseña *
                </label>
                <InputText
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  type={showPassword ? 'text' : 'password'}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                  placeholder="Contraseña"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Confirmar Contraseña *
                </label>
                <InputText
                  value={formData.confirmPassword || ''}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  type={showPassword ? 'text' : 'password'}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                  placeholder="Confirmar Contraseña"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <label htmlFor="showPassword" style={{ margin: 0, fontWeight: 600 }}>
                  Mostrar contraseñas
                </label>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Teléfono
            </label>
            <InputText
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              placeholder="Teléfono"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button label="Cancelar" severity="secondary" onClick={closeDialog} />
            <Button label="Guardar" onClick={handleSave} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
