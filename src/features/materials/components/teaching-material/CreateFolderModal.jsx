import React, { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import { Search, FolderPlus } from 'lucide-react';
import TextInput from '@/shared/components/ui/inputs/TextInput';
import FolderNode from '../teaching-material/FolderNode';
import { PillButton } from '@/shared/components/ui/buttons';

const mockFolders = [
  {
    id: "1",
    name: "My Files",
    children: [
      {
        id: "1-1",
        name: "Khóa học Mùa Thu",
        children: [
          {
            id: "1-1-1",
            name: "Bài giảng",
            children: [
              { id: "1-1-1-1", name: "Tuần 1", children: [] },
              { id: "1-1-1-2", name: "Tuần 2", children: [] }
            ]
          },
          {
            id: "1-1-2",
            name: "Tài liệu tham khảo",
            children: []
          }
        ]
      },
      {
        id: "1-2",
        name: "Dự án phụ",
        children: []
      }
    ]
  },
  {
    id: "2",
    name: "Shared with me",
    children: [
      {
        id: "2-1",
        name: "Tài liệu team",
        children: []
      }
    ]
  }
];

const CreateFolderModal = ({ open, onClose }) => {
  const [folderName, setFolderName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState(["1", "1-1"]);
  const [selectedFolder, setSelectedFolder] = useState({ id: "1-1-1", name: "Bài giảng" });

  const toggleExpand = (id) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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

          <div className="border border-[#E2E2E2] rounded-xl p-3 flex-1 overflow-y-auto mt-3">
            <div className="flex flex-col gap-1">
              {mockFolders.map(folder => (
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
          </div>

          <p className="text-sm text-[#5B403E] mt-2">
            Thư mục mới sẽ được tạo bên trong "{selectedFolder?.name}".
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default CreateFolderModal;
