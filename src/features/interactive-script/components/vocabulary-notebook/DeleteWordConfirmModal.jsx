import React from 'react';
import ConfirmationModal from '@/shared/components/ui/ConfirmationModal';
import { useLanguage } from '@/shared/context/LanguageContext';

export const DeleteWordConfirmModal = ({ open, word, onClose, onConfirm }) => {
  const { t } = useLanguage();
  const v = t.vocabularyNotebook?.deleteModal;

  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onConfirm={() => onConfirm(word.id)}
      title={v?.title}
      message={v?.message?.replace('{{word}}', word?.word)}
      cancelText={v?.cancel}
      confirmText={v?.confirm}
      confirmVariant="destructive"
    />
  );
};
