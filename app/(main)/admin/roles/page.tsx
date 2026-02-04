'use client';

import { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { useAdminRoles } from '@/hooks/useAdminRoles';
import * as roleApi from '@/lib/api/roles';

export default function RolesPage() {
  const { roles, loading, error, loadRoles, createRole, updateRole, deleteRole } = useAdminRoles();
  const [visible, setVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<roleApi.RoleDto | null>(null);
  const [formData, setFormData] = useState<Partial<roleApi.RoleDto>>({});
  const toast = useRef<any>(null);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const showToast = (severity: 'success' | 'error' | 'info', message: string) => {
    toast.current?.show({ severity, summary: 'Mensaje', detail: message, life: 3000 });
  };

  const openDialog = (role?: roleApi.RoleDto) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
      });
    } else {
      setEditingRole(null);
      setFormData({});
    }
    setVisible(true);
  };

  const closeDialog = () => {
    setVisible(false);
    setEditingRole(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.name) {
      showToast('error', 'Por favor completa el nombre del rol');
      return;
    }

    let success = false;
    if (editingRole) {
      success = await updateRole({
        id: editingRole.id,
        name: formData.name!,
        description: formData.description,
      });
    } else {
      success = await createRole({
        name: formData.name!,
        description: formData.description,
      });
    }

    if (success) {
      showToast('success', editingRole ? 'Rol actualizado correctamente' : 'Rol creado correctamente');
      closeDialog();
    } else {
      showToast('error', 'Error al guardar el rol');
    }
  };

  const handleDelete = async (role: roleApi.RoleDto) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el rol ${role.name}?`)) {
      const success = await deleteRole(role.id);
      if (success) {
        showToast('success', 'Rol eliminado correctamente');
      } else {
        showToast('error', 'Error al eliminar el rol');
      }
    }
  };

  const actionTemplate = (rowData: roleApi.RoleDto) => {
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
        <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Gestión de Roles</h1>
        <Button
          label="Nuevo Rol"
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
          value={roles}
          paginator
          rows={10}
          loading={loading}
          dataKey="id"
          responsiveLayout="scroll"
          tableStyle={{ minWidth: '50rem' }}
        >
          <Column field="name" header="Nombre" />
          <Column field="description" header="Descripción" />
          <Column header="Acciones" body={actionTemplate} style={{ width: '150px' }} />
        </DataTable>
      </div>

      <Dialog
        header={editingRole ? 'Editar Rol' : 'Nuevo Rol'}
        visible={visible}
        onHide={closeDialog}
        modal
        style={{ width: '50vw' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Nombre del Rol *
            </label>
            <InputText
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              placeholder="Nombre del rol"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Descripción
            </label>
            <InputTextarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', minHeight: '100px' }}
              placeholder="Descripción del rol"
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
