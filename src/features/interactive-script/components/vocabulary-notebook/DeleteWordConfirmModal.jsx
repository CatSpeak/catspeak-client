import React from 'react';
import ConfirmationModal from '@/shared/components/ui/ConfirmationModal';

export const DeleteWordConfirmModal = ({ open, word, onClose, onConfirm }) => {
  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onConfirm={() => onConfirm(word.id)}
      title="Xóa từ này khỏi sổ từ"
      message={`Từ "${word?.word}" sẽ bị xóa khỏi danh sách học tập và lịch sử ôn tập của bạn.`}
      cancelText="Hủy"
      confirmText="Xóa từ"
      confirmVariant="destructive"
    />
  );
};
