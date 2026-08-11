import React, { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import { UploadCloud, Upload } from 'lucide-react';
import Switch from '@/shared/components/ui/inputs/Switch';
import Dropdown from '@/shared/components/ui/Dropdown';
import UploadItem from './UploadItem';

const UploadMaterialModal = ({ open, onClose }) => {
  const [isPublic, setIsPublic] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('current');

  const footer = (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
      <button
        onClick={onClose}
        className="px-6 py-2.5 bg-white text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
      >
        Hủy
      </button>
      <button
        className="flex items-center gap-2 px-6 py-2.5 bg-[#8e1115] text-white rounded-lg font-medium text-sm hover:bg-[#720e11] transition-colors"
      >
        <Upload className="w-4 h-4" />
        Upload
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={"Tải lên tài liệu"}
      className="md:max-w-xl w-full"
      footer={footer}
    >
      <div className="flex flex-col gap-6">
        {/* Drop zone */}
        <div className="border-2 border-dashed border-[#E3BEBA] bg-[#F9F9F9] rounded-xl flex flex-col items-center justify-center py-10 px-6 text-center cursor-pointer hover:bg-[#fff5f5] transition-colors">
          <div className="w-14 h-14 bg-[#fde9eb] rounded-full flex items-center justify-center mb-4 text-[#8e1115]">
            <UploadCloud className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <p className="text-[15px] text-gray-800 font-bold mb-1">
            Kéo thả file hoặc <span className="text-[#8e1115] hover:underline">Chọn tệp</span>
          </p>
          <p className="text-[13px] text-gray-500 mb-1">
            Hỗ trợ PDF, DOCX, XLSX, PPTX, JPG, PNG.
          </p>
          <p className="text-[13px] text-gray-500">
            Dung lượng tối đa: 50MB/file.
          </p>
        </div>

        {/* Uploading list */}
        <div>
          <h4 className="text-base font-semibold text-[#1A1C1C] mb-3">Đang tải lên (2)</h4>
          <div className="flex flex-col gap-4">
            <UploadItem
              name="Lesson1_DocHieu.pdf"
              sizeBytes={5.1 * 1024 * 1024}
              uploadedBytes={4.2 * 1024 * 1024}
              progress={80}
              status="uploading"
              type="pdf"
              onCancel={() => { }}
            />

            <UploadItem
              name="BieuDo_02.png"
              sizeBytes={1.2 * 1024 * 1024}
              status="waiting"
              type="image"
              onCancel={() => { }}
            />

          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
          {/* Folder select */}
          <div>
            <label className="block text-base font-bold text-[#1A1C1C] mb-2">Lưu vào thư mục</label>
            <Dropdown
              className='border-[#E3BEBA] bg-[#F9F9F9]'
              roundedClass='rounded-xl'
              dropdownClassName="w-full"
              value={selectedFolder}
              onChange={setSelectedFolder}
              options={[
                { value: 'current', label: 'Học liệu kỳ Fall 2024 (Thư mục hiện tại)' },
                { value: '1', label: 'Bài giảng' },
                { value: '2', label: 'Tài liệu tham khảo' },
              ]}
              triggerClassName="h-[42px] border-[#fde9eb] bg-[#fffafb] w-full text-[13px] hover:bg-[#fff5f5]"
            />
          </div>

          {/* Public toggle */}
          <div className="flex items-center gap-3">
            <Switch
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              colorClass="peer-checked:bg-[#8e1115]"
            />
            <span className="text-sm text-[#1A1C1C]">Chia sẻ công khai ngay sau khi upload</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UploadMaterialModal;
