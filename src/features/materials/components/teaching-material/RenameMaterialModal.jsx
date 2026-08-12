import React, { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import { Edit2 } from 'lucide-react';
import TextInput from '@/shared/components/ui/inputs/TextInput';
import { PillButton } from '@/shared/components/ui/buttons';

import { useRenameMaterialMutation, useRenameFolderMutation } from '@/store/api/materialApi';
import toast from 'react-hot-toast';

const RenameMaterialModal = ({ open, onClose, item }) => {
  const [name, setName] = useState("");
  const [renameMaterial, { isLoading: isRenamingMaterial }] = useRenameMaterialMutation();
  const [renameFolder, { isLoading: isRenamingFolder }] = useRenameFolderMutation();

  const isRenaming = isRenamingMaterial || isRenamingFolder;

  const [prevItem, setPrevItem] = useState(item);
  const [prevOpen, setPrevOpen] = useState(open);

  if (item !== prevItem || open !== prevOpen) {
    setPrevItem(item);
    setPrevOpen(open);
    if (open && item) {
      setName(item.fileName || item.folderName || item.name || "");
    }
  }




  const handleRename = async () => {
    if (!name.trim() || !item) return;
    console.log(name);
    try {
      const isFolder = item.type === 'folder' || item._type === 'folder' || (!item.fileName && !item.fileUrl);

      if (isFolder) {
        await renameFolder({
          id: item.id || item.folderId,
          name: name.trim(),
        }).unwrap();
      } else {
        await renameMaterial({
          id: item.id,
          fileName: name.trim(),
        }).unwrap();
      }
      toast.success('Đổi tên thành công');
      onClose();
    } catch (error) {
      console.error("Failed to rename", error);
      toast.error('Đổi tên thất bại');
    }
  };

  const currentName = item?.fileName || item?.folderName || item?.name || "";

  const footer = (
    <div className="flex items-center justify-end gap-4">
      <PillButton
        onClick={onClose}
        variant='outline'
        roundedClass='rounded-xl'
      >
        Hủy
      </PillButton>
      <PillButton
        startIcon={<Edit2 className="w-4 h-4" />}
        roundedClass='rounded-xl'
        onClick={handleRename}
        loading={isRenaming}
        disabled={!name.trim() || name.trim() === currentName}
      >
        Lưu thay đổi
      </PillButton>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Đổi tên"
      bodyClassName="px-4 sm:px-6"
      footer={footer}
    >
      <div className="space-y-6">
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          labelClassName="font-bold text-base"
          placeholder="Nhập tên mới..."
          className="!h-12 rounded-xl"
        />
      </div>
    </Modal>
  );
};

export default RenameMaterialModal;
