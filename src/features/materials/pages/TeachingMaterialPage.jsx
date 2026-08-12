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
import FilterMaterialModal from '../components/teaching-material/FilterMaterialModal';
import MoveMaterialModal from '../components/teaching-material/MoveMaterialModal';
import RenameMaterialModal from '../components/teaching-material/RenameMaterialModal';
import BulkActionBar from '../components/teaching-material/BulkActionBar';
import SearchInput from '@/shared/components/ui/inputs/SearchInput';
import Dropdown from '@/shared/components/ui/Dropdown';
import { IconButton, PillButton } from '@/shared/components/ui/buttons';
import { useGetPersonalMaterialsQuery, useGetBookmarkedMaterialsQuery, useRecordMaterialDownloadMutation, useGetPersonalMaterialByIdQuery, useGetFolderTreeQuery, useBookmarkFolderMutation, useBookmarkMaterialMutation } from '@/store/api/materialApi';
import dayjs from 'dayjs';
import { LoadingSpinner } from '@/shared/components/ui/indicators';
import { Breadcrumb } from '@/shared/components/ui/navigation';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'name', label: 'Tên' },
  { value: 'recent', label: 'Gần đây nhất' },
  { value: 'updated_size', label: 'Ngày cập nhật, kích thước' }
];

const TeachingMaterialPage = () => {
  const navigate = useNavigate();
  const { folderId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");
  const [viewLayout, setViewLayout] = useState("grid");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadMaterialOpen, setIsUploadMaterialOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [isFileDetailOpen, setIsFileDetailOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deletingItem, setDeletingItem] = useState({ id: null, name: "", count: 0, type: "folder" });

  // Filter States
  const [filterMode, setFilterMode] = useState(null); // 'folder' | 'fileType' | null
  const [filterFileType, setFilterFileType] = useState(null);

  const { data: regularMaterialsData, isLoading: isRegularLoading } = useGetPersonalMaterialsQuery({
    folderId,
    keyword: searchQuery,
    sortBy: sortBy,
  }, { skip: filterMode === 'bookmark' && !folderId });

  const { data: bookmarkedMaterialsData, isLoading: isBookmarkLoading } = useGetBookmarkedMaterialsQuery({
    keyword: searchQuery,
    sortBy: sortBy,
  }, { skip: filterMode !== 'bookmark' || !!folderId });

  const materialsData = (filterMode === 'bookmark' && !folderId) ? bookmarkedMaterialsData : regularMaterialsData;
  const isLoading = (filterMode === 'bookmark' && !folderId) ? isBookmarkLoading : isRegularLoading;

  const { data: folderDetailRes } = useGetPersonalMaterialByIdQuery(folderId, { skip: !folderId });
  const folderDetail = folderDetailRes?.data || folderDetailRes;

  const { data: treeData } = useGetFolderTreeQuery();
  const rawFoldersTree = useMemo(() => treeData?.data || treeData || [], [treeData]);

  const getFolderPath = (nodes, targetId, currentPath = []) => {
    for (const node of nodes) {
      const isMatch = String(node.folderId) === String(targetId) || String(node.id) === String(targetId);
      const pathWithCurrent = [...currentPath, { folderId: node.folderId || node.id, folderName: node.folderName }];

      if (isMatch) return pathWithCurrent;

      if (node.subFolders && node.subFolders.length > 0) {
        const found = getFolderPath(node.subFolders, targetId, pathWithCurrent);
        if (found) return found;
      }
      if (node.children && node.children.length > 0) {
        const found = getFolderPath(node.children, targetId, pathWithCurrent);
        if (found) return found;
      }
    }
    return null;
  };

  const folderPath = folderId ? getFolderPath(rawFoldersTree, folderId) : null;

  const [recordDownload] = useRecordMaterialDownloadMutation();
  const [bookmarkFolder] = useBookmarkFolderMutation();
  const [bookmarkMaterial] = useBookmarkMaterialMutation();

  const handleBookmark = async (item, type) => {
    try {
      if (type === 'folder') {
        await bookmarkFolder(item.folderId || item.id).unwrap();
        toast.success(item.isBookmarked ? 'Đã bỏ yêu thích thư mục' : 'Đã thêm thư mục vào yêu thích');
      } else {
        await bookmarkMaterial(item.id).unwrap();
        toast.success(item.isBookmarked ? 'Đã bỏ yêu thích tệp' : 'Đã thêm tệp vào yêu thích');
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi thực hiện yêu thích');
    }
  };

  const handleToggleSelect = (item, type) => {
    setSelectedItems(prev => {
      const id = item.id || item.folderId;
      const exists = prev.find(i => (i.id || i.folderId) === id && i._type === type);
      if (exists) {
        return prev.filter(i => !((i.id || i.folderId) === id && i._type === type));
      } else {
        return [...prev, { ...item, _type: type }];
      }
    });
  };

  const responseData = materialsData?.data || materialsData || {};
  const folders = useMemo(() => {
    if (filterMode === 'fileType') return [];

    let rawFolders = [];
    if (filterMode === 'folder') {
      const metaMap = {};
      if (Array.isArray(responseData.folders)) {
        responseData.folders.forEach(f => {
          metaMap[f.id] = f;
        });
      }

      const flattenFolders = (nodes) => {
        let flat = [];
        for (const node of nodes) {
          const id = node.folderId || node.id;
          const meta = metaMap[id];
          flat.push({
            ...node,
            id,
            name: node.folderName || node.name,
            subFolderCount: meta?.subFolderCount || node.subFolderCount,
            materialCount: meta?.materialCount || node.materialCount,
            updatedAt: meta?.updatedAt || node.updatedAt
          });
          const children = node.subFolders || node.children || [];
          if (children.length > 0) {
            flat = flat.concat(flattenFolders(children));
          }
        }
        return flat;
      };

      if (folderId) {
        const findNode = (nodes, targetId) => {
          for (const node of nodes) {
            if (String(node.folderId) === String(targetId) || String(node.id) === String(targetId)) return node;
            const children = node.subFolders || node.children || [];
            const found = findNode(children, targetId);
            if (found) return found;
          }
          return null;
        };
        const targetNode = findNode(rawFoldersTree, folderId);
        rawFolders = flattenFolders(targetNode?.subFolders || targetNode?.children || []);
      } else {
        rawFolders = flattenFolders(rawFoldersTree);
      }

      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        rawFolders = rawFolders.filter(f => (f.name || '').toLowerCase().includes(lowerQuery));
      }
    } else {
      rawFolders = Array.isArray(responseData.folders) ? responseData.folders.map(f => ({ ...f, id: f.folderId || f.id })) : [];
    }

    if (filterMode === 'bookmark' && folderId) {
      rawFolders = rawFolders.filter(f => f.isBookmarked);
    }

    rawFolders.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      const dateA = new Date(a.updatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || 0).getTime();

      switch (sortBy) {
        case 'name_asc': return nameA.localeCompare(nameB);
        case 'name_desc': return nameB.localeCompare(nameA);
        case 'newest': return dateB - dateA;
        case 'oldest': return dateA - dateB;
        case 'size_asc': return dateA - dateB;
        case 'size_desc': return dateB - dateA;
        default: return 0;
      }
    });

    return rawFolders;
  }, [responseData.folders, filterMode, sortBy, folderId, rawFoldersTree, searchQuery]);

  const files = useMemo(() => {
    let rawFiles = Array.isArray(responseData.materials) ? responseData.materials.map(file => ({ ...file, id: file.materialId || file.id })) : [];
    if (filterMode === 'folder') return [];

    if (filterMode === 'fileType' && filterFileType) {
      const typeMap = {
        word: ['doc', 'docx'],
        excel: ['xls', 'xlsx', 'csv'],
        powerpoint: ['ppt', 'pptx'],
        image: ['png', 'jpg']
      };

      rawFiles = rawFiles.filter(file => {
        const name = file.fileName || file.name || '';
        const extMatch = name.match(/\.([^.]+)$/);
        const ext = extMatch ? extMatch[1].toLowerCase() : '';
        return typeMap[filterFileType]?.includes(ext);
      });
    }

    if (filterMode === 'bookmark' && folderId) {
      rawFiles = rawFiles.filter(f => f.isBookmarked);
    }

    rawFiles.sort((a, b) => {
      const nameA = a.fileName || a.name || '';
      const nameB = b.fileName || b.name || '';
      const dateA = new Date(a.updatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || 0).getTime();
      const sizeA = a.fileSize || a.size || a.sizeBytes || 0;
      const sizeB = b.fileSize || b.size || b.sizeBytes || 0;

      switch (sortBy) {
        case 'name_asc': return nameA.localeCompare(nameB);
        case 'name_desc': return nameB.localeCompare(nameA);
        case 'newest': return dateB - dateA;
        case 'oldest': return dateA - dateB;
        case 'size_asc': return sizeA - sizeB;
        case 'size_desc': return sizeB - sizeA;
        default: return 0;
      }
    });

    return rawFiles;
  }, [responseData.materials, filterMode, filterFileType, sortBy, folderId]);
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
      <Breadcrumb
        items={[
          {
            label: "Trang chủ",
            onClick: () => navigate("/")
          },
          {
            label: 'Quản lý tài liệu',
            onClick: folderId ? () => navigate("/workspace/teaching-material") : undefined
          },
          ...(folderPath ? folderPath.map(folder => ({
            label: folder.folderName || 'Thư mục',
            onClick: () => navigate(`/workspace/teaching-material/${folder.folderId}`)
          })) : (folderId ? [{
            label: folderDetail?.folderName || folderDetail?.folderName || folderDetail?.title || 'Thư mục',
            onClick: () => navigate(`/workspace/teaching-material/${folderId}`)
          }] : []))
        ]}
      />

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
            variant={filterMode ? 'solid' : 'outline'}
            roundedClass='rounded-xl'
            borderColor={filterMode ? 'transparent' : '#E3BEBA'}
            bgColor={filterMode ? '#6E0009' : undefined}
            textColor={filterMode ? 'white' : '#5B403E'}
            className='!h-10'
            startIcon={<ListFilter className="w-4 h-4" />}
            onClick={() => setIsFilterModalOpen(true)}
          >
            Bộ lọc {filterMode ? `(1)` : ''}
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
              { value: 'name_asc', label: 'Tên (A-Z)' },
              { value: 'name_desc', label: 'Tên (Z-A)' },
              { value: 'newest', label: 'Ngày cập nhật (Gần nhất)' },
              { value: 'oldest', label: 'Ngày cập nhật (Cũ nhất)' },
              { value: 'size_asc', label: 'Kích thước (Tăng dần)' },
              { value: 'size_desc', label: 'Kích thước (Nhỏ dần)' },
            ]}
            align="right"
            dropdownClassName="w-58"
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
      ) : (searchQuery || filterMode) && materials.length === 0 ? (
        <div className="mt-4">
          {searchQuery && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-[#1A1C1C]">Kết quả tìm kiếm</h2>
              <p className="text-base text-[#5B403E]">
                Tìm thấy 0 kết quả cho <span className="font-bold text-[#6E0009]">"{searchQuery}"</span>
              </p>
            </div>
          )}
          <EmptySearchState
            searchQuery={searchQuery}
            onClearFilters={() => {
              setSearchQuery('');
              setFilterMode(null);
              setFilterFileType(null);
            }}
          />
        </div>
      ) : materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-[#5B403E]">Thư mục trống</p>
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
                    key={folder.id || folder.folderId}
                    title={folder.name || folder.folderName}
                    totalItems={`${(folder.subFolderCount || 0) + (folder.materialCount || 0)} mục`}
                    updatedAt={folder.updatedAt ? `Cập nhật ${dayjs(folder.updatedAt).format('DD/MM/YYYY')}` : ''}
                    isSelected={selectedItems.some(i => (i.id || i.folderId) === (folder.id || folder.folderId) && i._type === 'folder')}
                    onToggleSelect={() => handleToggleSelect(folder, 'folder')}
                    onClick={() => navigate(`/workspace/teaching-material/${folder.id || folder.folderId}`)}
                    onMove={() => {
                      setSelectedItem(folder);
                      setIsMoveModalOpen(true);
                    }}
                    onRename={() => {
                      setSelectedItem(folder);
                      setIsRenameModalOpen(true);
                    }}
                    onDelete={() => {
                      setDeletingItem({ id: folder.id, name: folder.name, count: (folder.subFolderCount || 0) + (folder.materialCount || 0), type: 'folder' });
                      setIsDeleteFolderOpen(true);
                    }}
                    onShare={() => {
                      setSelectedItem({ ...folder, type: 'folder' });
                      setIsShareModalOpen(true);
                    }}
                    isBookmarked={folder.isBookmarked}
                    onBookmark={() => handleBookmark(folder, 'folder')}
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
                    isBookmarked={file.isBookmarked}
                    type={file.fileType || 'file'}
                    layout={viewLayout}
                    isSelected={selectedItems.some(i => i.id === file.id && i._type === 'file')}
                    onToggleSelect={() => handleToggleSelect(file, 'file')}
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
                    onMove={() => {
                      setSelectedItem(file);
                      setIsMoveModalOpen(true);
                    }}
                    onRename={() => {
                      setSelectedItem(file);
                      setIsRenameModalOpen(true);
                    }}
                    onDelete={() => {
                      setDeletingItem({ id: file.id, name: file.fileName || file.name, count: 0, type: 'file' });
                      setIsDeleteFolderOpen(true);
                    }}
                    onBookmark={() => handleBookmark(file, 'file')}
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
        onSuccess={() => {
          setSelectedItems([]);
          setIsDeleteFolderOpen(false);
        }}
      />

      <FileDetailModal
        open={isFileDetailOpen}
        onClose={() => setIsFileDetailOpen(false)}
        file={selectedItem}
        onDelete={() => {
          setIsFileDetailOpen(false);
          setDeletingItem({ id: selectedItem.id, name: selectedItem.fileName || selectedItem.name, count: 0, type: 'file' });
          setIsDeleteFolderOpen(true);
        }}
      />

      <MoveMaterialModal
        open={isMoveModalOpen}
        onClose={() => {
          setIsMoveModalOpen(false);
          setSelectedItem(null);
        }}
        items={selectedItems.length > 0 && !selectedItem ? selectedItems : (selectedItem ? [{ ...selectedItem, _type: selectedItem.fileName ? 'file' : 'folder' }] : [])}
        currentFolderId={folderId || null}
        onSuccess={() => {
          setSelectedItems([]);
          setIsMoveModalOpen(false);
          setSelectedItem(null);
        }}
      />

      <RenameMaterialModal
        open={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        item={selectedItem}
      />

      <FilterMaterialModal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentFilters={{ filterMode, filterFileType }}
        onApply={(filters) => {
          setFilterMode(filters.filterMode);
          setFilterFileType(filters.filterFileType);
        }}
      />

      <BulkActionBar
        selectedCount={selectedItems.length}
        onClearSelection={() => setSelectedItems([])}
        onDelete={() => {
          if (selectedItems.length === 1) {
            setDeletingItem({
              id: selectedItems[0].id || selectedItems[0].folderId,
              name: selectedItems[0].fileName || selectedItems[0].folderName || selectedItems[0].name,
              count: selectedItems[0]._type === 'folder' ? ((selectedItems[0].subFolderCount || 0) + (selectedItems[0].materialCount || 0)) : 0,
              type: selectedItems[0]._type
            });
          } else {
            setDeletingItem({
              id: 'bulk',
              name: `${selectedItems.length} mục đã chọn`,
              count: 0,
              type: 'bulk',
              items: selectedItems
            });
          }
          setIsDeleteFolderOpen(true);
        }}
        onDownload={() => {
          const filesToDownload = selectedItems.filter(item => item._type === 'file' && item.fileUrl);
          if (filesToDownload.length === 0) {
            toast.error('Không có tệp nào để tải xuống');
            return;
          }

          filesToDownload.forEach(async (file) => {
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
          });

          toast.success(`Đang tải xuống ${filesToDownload.length} tệp`);
          setSelectedItems([]);
        }}
        onMove={() => {
          setSelectedItem(null);
          setIsMoveModalOpen(true);
        }}
      />
    </div>
  );
};

export default TeachingMaterialPage;