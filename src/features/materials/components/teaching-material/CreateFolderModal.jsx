import React, { useMemo, useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import { Search, FolderPlus, FolderOpen } from 'lucide-react';
import TextInput from '@/shared/components/ui/inputs/TextInput';
import FolderNode from '../teaching-material/FolderNode';
import { PillButton } from '@/shared/components/ui/buttons';

import { useGetFolderTreeQuery, useCreateFolderMutation } from '@/store/api/materialApi';
import { LoadingSpinner } from '@/shared/components/ui/indicators';
import toast from 'react-hot-toast';

const CreateFolderModal = ({ open, onClose }) => {
  const [folderName, setFolderName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);

  const { data: treeData, isLoading: isFetchingTree } = useGetFolderTreeQuery(undefined, { skip: !open });
  const [createFolder, { isLoading: isCreating }] = useCreateFolderMutation();

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setFolderName("");
      setSearchQuery("");
      setExpandedIds([]);
      setSelectedFolder(null);
    }
  }

  // Filter folders based on search query
  const folders = useMemo(() => {
    const rawFolders = treeData?.data || treeData || [];

    if (!searchQuery.trim()) return rawFolders;

    const lowerQuery = searchQuery.toLowerCase();
    const filterTree = (nodes) => {
      return nodes.reduce((acc, node) => {
        const isMatch = node.name.toLowerCase().includes(lowerQuery);
        let filteredChildren = [];
        if (node.children) {
          filteredChildren = filterTree(node.children);
        }

        if (isMatch || filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
        return acc;
      }, []);
    };

    return filterTree(rawFolders);
  }, [treeData, searchQuery]);

  const toggleExpand = (id) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!folderName.trim()) return;
    try {
      await createFolder({
        name: folderName.trim(),
        parentId: selectedFolder?.id,
      }).unwrap();
      toast.success('Tạo thư mục thành công');
      setFolderName("");
      onClose();
    } catch (error) {
      console.error("Failed to create folder", error);
      toast.error('Tạo thư mục thất bại');
    }
  };

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
        startIcon={<FolderPlus />}
        roundedClass='rounded-xl'
        onClick={handleCreate}
        loading={isCreating}
        disabled={!folderName.trim()}
      >
        Tạo thư mục
      </PillButton>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo thư mục mới"
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footer={footer}
    >
      <div className="space-y-6">
        <TextInput
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          label={"Tên thư mục"}
          labelClassName="font-bold text-base"
          placeholder="Nhập tên thư mục"
          className="!h-12 rounded-xl"
        />
        <div>
          <TextInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            label={"Vị trí"}
            labelClassName="font-bold text-base"
            icon={Search}
            placeholder="Tìm thư mục..."
            className='!h-12 rounded-xl'
          />

          <div className="border border-[#E2E2E2] rounded-xl p-3 flex-1 overflow-y-auto mt-3 min-h-[160px] flex flex-col">
            {isFetchingTree ? (
              <div className="flex flex-col items-center justify-center flex-1 text-sm text-[#5B403E] gap-2 opacity-70">
                <LoadingSpinner />
                <span>Đang tải danh sách thư mục...</span>
              </div>
            ) : folders.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-sm text-[#5B403E] gap-2 opacity-70">
                <FolderOpen className="w-8 h-8" />
                <span>Chưa có thư mục nào</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {folders.map(folder => (
                  <FolderNode
                    key={folder.id}
                    folder={folder}
                    level={0}
                    selectedId={selectedFolder?.id}
                    onSelect={setSelectedFolder}
                    expandedIds={expandedIds}
                    toggleExpand={toggleExpand}
                  />
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-[#5B403E] mt-2">
            {selectedFolder
              ? `Thư mục mới sẽ được tạo bên trong "${selectedFolder.name}".`
              : 'Thư mục mới sẽ được tạo ở thư mục gốc.'}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default CreateFolderModal;
