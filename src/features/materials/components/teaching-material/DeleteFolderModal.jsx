import React from 'react';
import Modal from '@/shared/components/ui/Modal';
import { AlertTriangle, FolderMinus } from 'lucide-react';
import { PillButton } from '@/shared/components/ui/buttons';
import { useDeletePersonalMaterialMutation, useDeleteMaterialsBulkMutation, useDeleteFolderMutation } from '@/store/api/materialApi';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/context/LanguageContext';

const DeleteFolderModal = ({ open, onClose, onSuccess, item }) => {
  const { t } = useLanguage();
  const [deleteMaterial, { isLoading: isDeletingSingle }] = useDeletePersonalMaterialMutation();
  const [deleteFolder, { isLoading: isDeletingFolder }] = useDeleteFolderMutation();
  const [deleteMaterialsBulk, { isLoading: isDeletingBulk }] = useDeleteMaterialsBulkMutation();
  const isLoading = isDeletingSingle || isDeletingBulk || isDeletingFolder;

  if (!item) return null;

  const handleDelete = async () => {
    try {
      if (item.type === 'bulk' && item.items) {
        const folderIds = item.items.filter(i => i._type === 'folder' || (i.folderId && !i.fileName)).map(i => i.id || i.folderId);
        const materialIds = item.items.filter(i => i._type === 'file' || i.fileName).map(i => i.id);
        
        await deleteMaterialsBulk({ folderIds, materialIds }).unwrap();
        toast.success(t.materials.deletedMultipleSuccess.replace('{{count}}', item.items.length));
      } else {
        const isFolder = item.type === 'folder' || item._type === 'folder' || (item.type !== 'file' && item._type !== 'file' && !item.fileName && !item.fileUrl);
        
        if (isFolder) {
          await deleteFolder(item.id || item.folderId).unwrap();
        } else {
          await deleteMaterial(item.id).unwrap();
        }
        toast.success(isFolder ? t.materials.deletedFolderSuccess : t.materials.deletedFileSuccess);
      }
      if (onSuccess) onSuccess();
      else onClose();
    } catch (err) {
      console.error(err);
      toast.error(t.materials.deleteError);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <PillButton
        onClick={onClose}
        variant="outline"
        roundedClass='rounded-xl'
        disabled={isLoading}
      >
        {t.materials.cancel}
      </PillButton>
      <PillButton
        roundedClass='rounded-xl'
        onClick={handleDelete}
        loading={isLoading}
      >
        {t.materials.delete}
      </PillButton>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFDAD6] rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#BA1A1A]" />
          </div>
          <span className="text-[20px] font-bold text-gray-800">{t.materials.confirmDelete}</span>
        </div>
      }
      className="md:max-w-[420px] w-full"
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        <div className="text-base text-[#5B403E]">
          {t.materials.deleteConfirmMessage.split('"{{name}}"').map((part, index, array) => (
            <React.Fragment key={index}>
              {part}
              {index < array.length - 1 && <span className="font-bold text-[#1A1C1C]">"{item.name}"</span>}
            </React.Fragment>
          ))}
        </div>

        {item.count > 0 && (
          <div className="bg-[#E8E8E8] border-[#E2E2E2] rounded-xl p-4 flex items-center gap-3">
            <FolderMinus className="w-5 h-5 text-[#5B403E]" strokeWidth={1.5} />
            <span className="text-[14px] text-[#5B403E]">
              {t.materials.deleteFolderWarning.split('{{count}}').map((part, index, array) => (
                <React.Fragment key={index}>
                  {part}
                  {index < array.length - 1 && <span className="font-bold text-[#1A1C1C]">{item.count}</span>}
                </React.Fragment>
              ))}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DeleteFolderModal;
