import { useState, useCallback, useRef } from 'react';
import type { PersonalInfo } from '@app-types/resume';

export function usePhotoManager(
  personal: PersonalInfo,
  onUpdate: (personal: PersonalInfo) => void,
  onActivity: () => void
) {
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoClick = () => photoInputRef.current?.click();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onActivity();
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onUpdate({ ...personal, photo: { url: dataUrl, shape: 'circle' } });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePhotoRemove = () => {
    onUpdate({ ...personal, photo: undefined });
  };

  return {
    photoInputRef,
    handlePhotoClick,
    handlePhotoUpload,
    handlePhotoRemove,
  };
}
