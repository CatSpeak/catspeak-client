import React, { useEffect, useState, useMemo } from 'react';
import { LayoutGrid, ChevronDown, FolderPlus, Upload, ListFilter, TableProperties } from 'lucide-react';
import FolderItem from '../components/teaching-material/FolderItem';
import FileItem from '../components/teaching-material/FileItem';
import EmptySearchState from '../components/teaching-material/EmptySearchState';
import CreateFolderModal from '../components/teaching-material/CreateFolderModal';
import UploadMaterialModal from '../components/teaching-material/UploadMaterialModal';
import ShareMaterialModal from '../components/teaching-material/ShareMaterialModal';
import DeleteFolderModal from '../components/teaching-material/DeleteFolderModal';
import FileDetailModal from '../components/teaching-material/FileDetailModal';
import SearchInput from '@/shared/components/ui/inputs/SearchInput';
import Dropdown from '@/shared/components/ui/Dropdown';
import { IconButton, PillButton } from '@/shared/components/ui/buttons';
import { useGetPersonalMaterialsQuery, useRecordMaterialDownloadMutation } from '@/store/api/materialApi';
import dayjs from 'dayjs';
import { LoadingSpinner } from '@/shared/components/ui/indicators';

const TeachingMaterialPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [viewLayout, setViewLayout] = useState("grid");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadMaterialOpen, setIsUploadMaterialOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [isFileDetailOpen, setIsFileDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState({ id: null, name: "", count: 0, type: "folder" });

  const { data: materialsData, isLoading } = useGetPersonalMaterialsQuery({
    keyword: searchQuery,
    sortBy: sortBy,
  });

  const [recordDownload] = useRecordMaterialDownloadMutation();

  const responseData = materialsData?.data || materialsData || {};
  const folders = useMemo(() => Array.isArray(responseData.folders) ? responseData.folders : [], [responseData.folders]);
  const files = useMemo(() => Array.isArray(responseData.recentFiles) ? responseData.recentFiles : [], [responseData.recentFiles]);
  const materials = useMemo(() => [...folders, ...files], [folders, files]);

  useEffect(() => {
    if (selectedItem) {
      const updatedItem = materials.find(m => m.id === selectedItem.id);
      if (updatedItem && (updatedItem.downloadCount !== selectedItem.downloadCount || updatedItem.viewCount !== selectedItem.viewCount || updatedItem.isPublic !== selectedItem.isPublic || updatedItem.allowDownload !== selectedItem.allowDownload)) {
        setSelectedItem(updatedItem);
      }
    }
  }, [materialsData, selectedItem, materials]);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className=" bg-[#f3f3f3] min-h-screen">

      {/* Header actions */}
      <div className="flex justify-end gap-3 mb-4">
        <PillButton
          variant='outline'
          roundedClass='rounded-xl'
          borderColor='#6E0009'
          textColor="#6E0009"
          startIcon={<FolderPlus className="w-4 h-4" />}
          onClick={() => setIsCreateFolderOpen(true)}
        >
          Tạo thư mục mới
        </PillButton>
        <PillButton
          roundedClass='rounded-xl'
          bgColor={"#6E0009"}
          startIcon={<Upload className="w-4 h-4" />}
          onClick={() => setIsUploadMaterialOpen(true)}
        >
          Tải lên tài liệu
        </PillButton>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm khóa học, tài liệu, bài giảng..."
            className="w-full max-w-[448px] !h-10 !rounded-xl border-[#E3BEBA] flex-row-reverse"
            inputClassName="text-base !pl-0"
            buttonClassName="w-4 h-4"
          />
          <PillButton
            variant='outline'
            roundedClass='rounded-xl'
            borderColor='#E3BEBA'
            textColor="#5B403E"
            className='!h-10'
            startIcon={<ListFilter className="w-4 h-4" />}
          >
            Bộ lọc
          </PillButton>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#F3F3F3] border border-[#E3BEBA] rounded-xl p-1 max-h-10 cursor-pointer">
            <IconButton
              variant="iconOnly"
              size="sm"
              className={`!rounded-[8px] h-[30px] hover:bg-[#E3BEBA] transition-colors ${viewLayout === 'grid' ? 'bg-[#F9F9F9]' : ''}`}
              onClick={() => setViewLayout('grid')}
            >
              <LayoutGrid className={`w-4 h-4 ${viewLayout === 'grid' ? 'text-[#6E0009]' : 'text-[#5B403E]'}`} />
            </IconButton>
            <IconButton
              variant="iconOnly"
              size="sm"
              className={`!rounded-[8px] h-[30px] hover:bg-[#E3BEBA] transition-colors ${viewLayout === 'list' ? 'bg-[#F9F9F9]' : ''}`}
              onClick={() => setViewLayout('list')}
            >
              <TableProperties className={`w-4 h-4 ${viewLayout === 'list' ? 'text-[#6E0009]' : 'text-[#5B403E]'}`} />
            </IconButton>
          </div>

          <Dropdown
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'newest', label: 'Mới nhất' },
              { value: 'oldest', label: 'Cũ nhất' },
              { value: 'name_asc', label: 'Tên A-Z' },
              { value: 'name_desc', label: 'Tên Z-A' },
            ]}
            align="right"
            dropdownClassName="w-40"
            trigger={(isOpen, selectedOption, toggle) => (
              <PillButton
                onClick={toggle}
                variant='outline'
                roundedClass='rounded-xl'
                borderColor='#E3BEBA'
                textColor="#5B403E"
                className='!h-10'
                endIcon={<ChevronDown className={`w-4 h-4 text-[#5B403E] transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
              >
                {selectedOption ? selectedOption.label : 'Sắp xếp theo'}
              </PillButton>
            )}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <LoadingSpinner />
          <span className="text-[#5B403E]">Đang tải dữ liệu...</span>
        </div>
      ) : searchQuery && materials.length === 0 ? (
        <div className="mt-4">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1A1C1C]">Kết quả tìm kiếm</h2>
            <p className="text-base text-[#5B403E]">
              Tìm thấy 0 kết quả cho <span className="font-bold text-[#6E0009]">"{searchQuery}"</span>
            </p>
          </div>
          <EmptySearchState
            searchQuery={searchQuery}
            onClearFilters={() => setSearchQuery('')}
          />
        </div>
      ) : (
        <>
          {searchQuery && materials.length > 0 && (
            <div className="mb-8 mt-4">
              <h2 className="text-2xl font-semibold text-[#1A1C1C]">Kết quả tìm kiếm</h2>
              <p className="text-base text-[#5B403E]">
                Tìm thấy {materials.length} kết quả cho <span className="font-bold text-[#6E0009]">"{searchQuery}"</span>
              </p>
            </div>
          )}

          {/* Folders Section */}
          {folders.length > 0 && (
            <div className='space-y-4 mb-6'>
              <h2 className="text-2xl font-semibold text-[#1A1C1C]">Thư mục</h2>
              <div className={viewLayout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-3"}>
                {folders.map(folder => (
                  <FolderItem
                    key={folder.id}
                    title={folder.name}
                    totalItems={`${(folder.subFolderCount || 0) + (folder.materialCount || 0)} mục`}
                    status={folder.updatedAt ? `Cập nhật ${dayjs(folder.updatedAt).format('DD/MM/YYYY')}` : ''}
                    onDelete={() => {
                      setDeletingItem({ id: folder.id, name: folder.name, count: (folder.subFolderCount || 0) + (folder.materialCount || 0), type: 'folder' });
                      setIsDeleteFolderOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Files Section */}
          {files.length > 0 && (
            <div className='space-y-4'>
              <h2 className="text-2xl font-semibold text-[#1A1C1C]">{searchQuery ? 'Tệp' : 'Tệp gần đây'}</h2>
              <div className={viewLayout === 'grid' ? "grid grid-cols-1 lg:grid-cols-4 gap-4" : "flex flex-col gap-3"}>
                {files.map(file => (
                  <FileItem
                    key={file.id}
                    title={file.fileName || file.name}
                    size={formatSize(file.fileSize || file.size || file.sizeBytes)}
                    date={file.updatedAt ? dayjs(file.updatedAt).format('DD/MM/YYYY') : ''}
                    isPublic={file.isPublic}
                    isStarred={file.isStarred}
                    type={file.fileType || 'file'}
                    layout={viewLayout}
                    onShare={() => {
                      setSelectedItem(file);
                      setIsShareModalOpen(true);
                    }}
                    onDetails={() => {
                      setSelectedItem(file);
                      setIsFileDetailOpen(true);
                    }}
                    onClick={() => {
                      setSelectedItem(file);
                      setIsFileDetailOpen(true);
                    }}
                    onDelete={() => {
                      setDeletingItem({ id: file.id, name: file.fileName || file.name, count: 0, type: 'file' });
                      setIsDeleteFolderOpen(true);
                    }}
                    onDownload={async () => {
                      if (file.fileUrl) {
                        recordDownload(file.id);
                        try {
                          const response = await fetch(file.fileUrl);
                          if (!response.ok) throw new Error('Network response was not ok');
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = file.fileName || file.name || 'download';
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error('Download failed, falling back to new tab:', error);
                          window.open(file.fileUrl, '_blank');
                        }
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {!isLoading && materials.length === 0 && !searchQuery && (
            <div className="flex flex-col items-center justify-center py-20 text-[#5B403E] opacity-70">
              <FolderPlus className="w-12 h-12 mb-4 text-[#E3BEBA]" />
              <p>Chưa có thư mục hoặc tài liệu nào.</p>
            </div>
          )}
        </>
      )}

      <CreateFolderModal
        open={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
      />
      <UploadMaterialModal
        open={isUploadMaterialOpen}
        onClose={() => setIsUploadMaterialOpen(false)}
      />
      <ShareMaterialModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        item={selectedItem}
      />
      <DeleteFolderModal
        open={isDeleteFolderOpen}
        onClose={() => setIsDeleteFolderOpen(false)}
        item={deletingItem}
      />
      <FileDetailModal
        open={isFileDetailOpen}
        onClose={() => setIsFileDetailOpen(false)}
        item={selectedItem}
        onDelete={() => {
          setIsFileDetailOpen(false);
          setDeletingItem({ id: selectedItem.id, name: selectedItem.fileName || selectedItem.name, count: 0, type: 'file' });
          setIsDeleteFolderOpen(true);
        }}
      />
    </div>
  );
};

export default TeachingMaterialPage;