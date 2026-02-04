'use client';

import { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';
import { useAdminGroups } from '@/hooks/useAdminGroups';
import { useAdminRoles } from '@/hooks/useAdminRoles';
import * as groupApi from '@/lib/api/groups';
import * as roleApi from '@/lib/api/roles';

export default function GroupsPage() {
  const { groups, loading, error, loadGroups, createGroup, updateGroup, deleteGroup, getMembers } =
    useAdminGroups();
  const { roles, loadRoles } = useAdminRoles();
  const [visible, setVisible] = useState(false);
  const [membersVisible, setMembersVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<groupApi.GroupDto | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<roleApi.RoleDto[]>([]);
  const [formData, setFormData] = useState<Partial<groupApi.GroupDto>>({});
  const [groupMembers, setGroupMembers] = useState<groupApi.GroupMemberDto[]>([]);
  const toast = useRef<any>(null);

  useEffect(() => {
    loadGroups();
    loadRoles();
  }, [loadGroups, loadRoles]);

  const showToast = (severity: 'success' | 'error' | 'info', message: string) => {
    toast.current?.show({ severity, summary: 'Mensaje', detail: message, life: 3000 });
  };

  const openDialog = (group?: groupApi.GroupDto) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        description: group.description,
      });
      const groupRoles = roles.filter((r) => group.roles?.includes(r.name));
      setSelectedRoles(groupRoles);
    } else {
      setEditingGroup(null);
      setFormData({});
      setSelectedRoles([]);
    }
    setVisible(true);
  };

  const closeDialog = () => {
    setVisible(false);
    setEditingGroup(null);
    setFormData({});
    setSelectedRoles([]);
  };

  const handleSave = async () => {
    if (!formData.name) {
      showToast('error', 'Por favor completa el nombre del grupo');
      return;
    }

    const roleIds = selectedRoles.map((r) => r.id);

    let success = false;
    if (editingGroup) {
      success = await updateGroup({
        id: editingGroup.id,
        name: formData.name!,
        description: formData.description,
        roleIds,
      });
    } else {
      success = await createGroup({
        name: formData.name!,
        description: formData.description,
        roleIds,
      });
    }

    if (success) {
      showToast('success', editingGroup ? 'Grupo actualizado correctamente' : 'Grupo creado correctamente');
      closeDialog();
    } else {
      showToast('error', 'Error al guardar el grupo');
    }
  };

  const handleDelete = async (group: groupApi.GroupDto) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el grupo ${group.name}?`)) {
      const success = await deleteGroup(group.id);
      if (success) {
        showToast('success', 'Grupo eliminado correctamente');
      } else {
        showToast('error', 'Error al eliminar el grupo');
      }
    }
  };

  const handleViewMembers = async (group: groupApi.GroupDto) => {
    const members = await getMembers(group.id);
    if (members) {
      setGroupMembers(members);
      setEditingGroup(group);
      setMembersVisible(true);
    } else {
      showToast('error', 'Error al cargar los miembros del grupo');
    }
  };

  const actionTemplate = (rowData: groupApi.GroupDto) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button
          icon="pi pi-pencil"
          rounded
          severity="info"
          size="small"
          onClick={() => openDialog(rowData)}
          tooltip="Editar"
        />
        <Button
          icon="pi pi-users"
          rounded
          severity="success"
          size="small"
          onClick={() => handleViewMembers(rowData)}
          tooltip="Ver miembros"
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
        <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Gestión de Grupos</h1>
        <Button
          label="Nuevo Grupo"
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
          value={groups}
          paginator
          rows={10}
          loading={loading}
          dataKey="id"
          responsiveLayout="scroll"
          tableStyle={{ minWidth: '50rem' }}
        >
          <Column field="name" header="Nombre" />
          <Column field="description" header="Descripción" />
          <Column field="memberCount" header="Miembros" />
          <Column header="Acciones" body={actionTemplate} style={{ width: '200px' }} />
        </DataTable>
      </div>

      <Dialog
        header={editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}
        visible={visible}
        onHide={closeDialog}
        modal
        style={{ width: '50vw' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Nombre del Grupo *
            </label>
            <InputText
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              placeholder="Nombre del grupo"
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
              placeholder="Descripción del grupo"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Roles
            </label>
            <MultiSelect
              value={selectedRoles}
              onChange={(e) => setSelectedRoles(e.value)}
              options={roles}
              optionLabel="name"
              placeholder="Selecciona roles"
              style={{ width: '100%' }}
              maxSelectedLabels={3}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button label="Cancelar" severity="secondary" onClick={closeDialog} />
            <Button label="Guardar" onClick={handleSave} />
          </div>
        </div>
      </Dialog>

      <Dialog
        header={`Miembros del Grupo: ${editingGroup?.name}`}
        visible={membersVisible}
        onHide={() => setMembersVisible(false)}
        modal
        style={{ width: '60vw' }}
      >
        <div style={{ backgroundColor: '#fff', borderRadius: '4px' }}>
          <DataTable
            value={groupMembers}
            paginator
            rows={10}
            dataKey="userId"
            responsiveLayout="scroll"
            tableStyle={{ minWidth: '100%' }}
          >
            <Column field="firstName" header="Nombre" />
            <Column field="lastName" header="Apellido" />
            <Column field="email" header="Email" />
            <Column field="userName" header="Usuario" />
          </DataTable>
        </div>
      </Dialog>
    </div>
  );
}
