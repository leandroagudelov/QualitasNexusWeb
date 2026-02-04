'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { createImagePreview, revokeImagePreview, getFileSizeMB } from '@/lib/utils/file';
import { profileValidators } from '@/lib/validators/profile';

interface AvatarSectionProps {
  imageUrl?: string;
  imageFile: File | null;
  deleteCurrentImage: boolean;
  onImageSelect: (file: File | null) => void;
  onDeleteToggle: (shouldDelete: boolean) => void;
  error?: string;
  onErrorClear: () => void;
}

export function AvatarSection({
  imageUrl,
  imageFile,
  deleteCurrentImage,
  onImageSelect,
  onDeleteToggle,
  error,
  onErrorClear,
}: AvatarSectionProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [previewDialogVisible, setPreviewDialogVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Generate preview when file is selected
  useEffect(() => {
    if (imageFile) {
      const previewUrl = createImagePreview(imageFile);
      setPreview(previewUrl);
    }

    return () => {
      if (preview) {
        revokeImagePreview(preview);
      }
    };
  }, [imageFile]);

  const handleFileSelect = useCallback((e: FileUploadSelectEvent) => {
    const file = e.files?.[0];
    if (!file) return;

    const error = profileValidators.imageFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    onImageSelect(file);
  }, [onImageSelect]);

  const handleDeleteClick = useCallback(() => {
    setDeleteConfirmVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDeleteToggle(true);
    setDeleteConfirmVisible(false);
    if (preview) {
      revokeImagePreview(preview);
      setPreview(null);
    }
  }, [preview, onDeleteToggle]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmVisible(false);
  }, []);

  const handleClearImage = useCallback(() => {
    onImageSelect(null);
    if (preview) {
      revokeImagePreview(preview);
      setPreview(null);
    }
  }, [preview, onImageSelect]);

  const hasImage = imageUrl && !deleteCurrentImage;
  const fileSizeMB = imageFile ? getFileSizeMB(imageFile) : 0;

  return (
    <div className="flex flex-column gap-2">
      {/* Current Avatar Display */}
      <div className="flex align-items-center justify-content-center mb-2">
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: 'var(--surface-100)',
            border: '2px solid var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {preview ? (
            <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : hasImage ? (
            <img src={imageUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <i className="pi pi-user" style={{ fontSize: '2rem', color: 'var(--primary-color)' }} />
          )}
        </div>
      </div>

      {/* File Size Info */}
      {imageFile && (
        <div className="text-center text-xs text-color-secondary">
          {imageFile.name} ({fileSizeMB}MB)
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="p-2 border-round border-left-4 border-orange-500 bg-orange-50 text-orange-700 text-xs">
          {validationError}
        </div>
      )}

      {/* API Error */}
      {error?.includes('image') && (
        <div className="p-2 border-round border-left-4 border-red-500 bg-red-50 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* File Upload */}
      <div className="grid gap-2 mb-2">
        <div className="col-12 sm:col-6">
          <FileUpload
            mode="basic"
            name="avatar"
            accept="image/*"
            maxFileSize={2000000}
            chooseLabel="Seleccionar"
            customUpload
            onSelect={handleFileSelect}
            auto={false}
            disabled={deleteCurrentImage}
          />
        </div>
        {imageFile && (
          <div className="col-12 sm:col-6">
            <Button
              label="Vista previa"
              icon="pi pi-eye"
              size="small"
              text
              onClick={() => setPreviewDialogVisible(true)}
            />
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog
        visible={previewDialogVisible}
        onHide={() => setPreviewDialogVisible(false)}
        header="Vista previa"
        modal
        style={{ width: '90vw', maxWidth: '500px' }}
      >
        {preview && (
          <img src={preview} alt="preview" style={{ width: '100%', borderRadius: '8px' }} />
        )}
      </Dialog>

      {/* Delete Image Actions */}
      {hasImage && (
        <div className="flex align-items-center gap-2 p-2 border-1 surface-border border-round bg-surface-50">
          <Checkbox
            inputId="deleteImg"
            checked={deleteCurrentImage}
            onChange={(e) => {
              if (e.checked) {
                handleDeleteClick();
              } else {
                onDeleteToggle(false);
              }
            }}
          />
          <label htmlFor="deleteImg" className="text-xs m-0 cursor-pointer">
            Eliminar foto actual
          </label>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={deleteConfirmVisible}
        onHide={handleCancelDelete}
        header="Confirmar eliminación"
        modal
        footer={
          <div className="flex gap-2 justify-content-end">
            <Button label="Cancelar" icon="pi pi-times" onClick={handleCancelDelete} />
            <Button
              label="Eliminar"
              icon="pi pi-trash"
              severity="danger"
              onClick={handleConfirmDelete}
            />
          </div>
        }
      >
        <p>¿Estás seguro de que deseas eliminar tu foto de perfil?</p>
      </Dialog>

      {/* Clear Image Button */}
      {imageFile && (
        <Button
          label="Descartar cambios de imagen"
          icon="pi pi-times"
          size="small"
          severity="secondary"
          text
          onClick={handleClearImage}
        />
      )}
    </div>
  );
}
