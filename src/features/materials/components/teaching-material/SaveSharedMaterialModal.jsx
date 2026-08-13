import React, { useState, useMemo } from 'react';
import Modal from '@/shared/components/ui/Modal';
import { Bookmark, FolderOpen } from 'lucide-react';
import FolderNode from './FolderNode';
import { PillButton } from '@/shared/components/ui/buttons';

import { useGetFolderTreeQuery, useCopyPublicMaterialsMutation, useCopyPublicFoldersMutation } from '@/store/api/materialApi';
import { LoadingSpinner } from '@/shared/components/ui/indicators';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/context/LanguageContext';

const SaveSharedMaterialModal = ({ open, onClose, onSuccess, item }) => {
  const { t } = useLanguage();
  const [expandedIds, setExpandedIds] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);

  const { data: treeData, isLoading: isFetchingTree } = useGetFolderTreeQuery(undefined, { skip: !open });
  const [copyMaterial, { isLoading: isCopyingMaterial }] = useCopyPublicMaterialsMutation();
  const [copyFolder, { isLoading: isCopyingFolder }] = useCopyPublicFoldersMutation();

  const isSaving = isCopyingMaterial || isCopyingFolder;

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setExpandedIds([]);
      setSelectedFolder(null);
    }
  }

  const isItemFolder = item && !item.fileName && !item.fileUrl;
  const currentName = item?.fileName || item?.folderName || item?.name || "";

  const folders = useMemo(() => {
    return treeData?.data || treeData || [];
  }, [treeData]);

  const toggleExpand = (id) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(expandedId => expandedId !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!item) return;
    try {
      if (isItemFolder) {
        await copyFolder({
          folderIds: [item.id || item.folderId],
          targetFolderId: selectedFolder ? selectedFolder.folderId : 0,
        }).unwrap();
      } else {
        await copyMaterial({
          materialIds: [item.id || item.materialId],
          targetFolderId: selectedFolder ? selectedFolder.folderId : 0,
        }).unwrap();
      }
      toast.success("Lưu tài liệu thành công");
      onSuccess ? onSuccess() : onClose();
    } catch (error) {
      console.error("Failed to save shared material", error);
      toast.error("Lưu tài liệu thất bại");
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-4">
      <PillButton
        onClick={onClose}
        variant='outline'
        roundedClass='rounded-xl'
      >
        {t.materials.cancel}
      </PillButton>
      <PillButton
        startIcon={<Bookmark className="w-4 h-4" />}
        roundedClass='rounded-xl'
        bgColor="#6E0009"
        onClick={handleSave}
        loading={isSaving}
      >
        {t.materials.moveToHere}
      </PillButton>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={"Lưu tài liệu chia sẻ"}
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footer={footer}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-[#5B403E] text-sm">
            Vui lòng chọn thư mục để lưu <span className="font-semibold text-[#1A1C1C]">"{currentName}"</span>
          </p>
        </div>

        <div className="border border-[#E2E2E2] rounded-xl p-3 overflow-y-auto min-h-[250px] max-h-[400px] flex flex-col">
          {isFetchingTree ? (
            <div className="flex flex-col items-center justify-center flex-1 text-sm text-[#5B403E] gap-2 opacity-70">
              <LoadingSpinner />
              <span>{t.materials.loadingFolderTree}</span>
            </div>
          ) : folders.length === 0 ? (
            <div className="flex flex-col gap-1">
              <FolderNode
                folder={{ folderId: null, folderName: t.materials.rootFolder }}
                level={0}
                selectedId={selectedFolder?.folderId}
                onSelect={() => setSelectedFolder({ folderId: null, folderName: t.materials.rootFolder })}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <FolderNode
                folder={{ folderId: null, folderName: t.materials.rootFolder }}
                level={0}
                selectedId={selectedFolder?.folderId}
                onSelect={() => setSelectedFolder({ folderId: null, folderName: t.materials.rootFolder })}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
              />
              <div className="h-px bg-[#E2E2E2] my-1 w-full" />
              {folders.map(folder => (
                <FolderNode
                  key={folder.folderId}
                  folder={folder}
                  level={0}
                  selectedId={selectedFolder?.folderId}
                  onSelect={setSelectedFolder}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SaveSharedMaterialModal;
