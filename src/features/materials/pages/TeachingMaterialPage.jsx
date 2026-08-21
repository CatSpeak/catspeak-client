import React, { useEffect, useState, useMemo } from 'react';
import { LayoutGrid, ChevronDown, FolderPlus, Upload, ListFilter, TableProperties, Search } from 'lucide-react';
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
import FilePreviewModal from '@/shared/components/ui/FilePreviewModal';
import TextInput from '@/shared/components/ui/inputs/TextInput';
import Dropdown from '@/shared/components/ui/Dropdown';
import { IconButton, PillButton } from '@/shared/components/ui/buttons';
import { useContextMenu } from '@/shared/hooks/useContextMenu';
import ContextMenu from '@/shared/components/ui/ContextMenu';
import { useGetPersonalMaterialsQuery, useGetBookmarkedMaterialsQuery, useRecordMaterialDownloadMutation, useGetPersonalMaterialByIdQuery, useGetFolderTreeQuery, useBookmarkFolderMutation, useBookmarkMaterialMutation } from '@/store/api/materialApi';
import { useTimezone } from "@/shared/hooks/useTimezone";
import { LoadingSpinner } from '@/shared/components/ui/indicators';
import { Breadcrumb } from '@/shared/components/ui/navigation';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/shared/context/LanguageContext';
import { downloadFolderAsZip, downloadMultipleItemsAsZip } from '@/features/materials/utils/zipDownloader';
import toast from 'react-hot-toast';
import { formatSize } from '../utils/materialUtils';

const TeachingMaterialPage = () => {
  const { t } = useLanguage();
  const { formatDate } = useTimezone();
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
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const { isOpen: isContextOpen, position: contextPosition, handleContextMenu, closeContextMenu } = useContextMenu();

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deletingItem, setDeletingItem] = useState({ id: null, name: "", count: 0, type: "folder" });

  // Filter States
  const [filterMode, setFilterMode] = useState(null); // 'folder' | 'fileType' | null
  const [filterFileType, setFilterFileType] = useState(null);

  const [sortField, sortDir] = sortBy.split('_');
  const actualSortBy = ['name', 'size'].includes(sortField) ? sortField : 'date';
  const actualSortOrder = sortField === 'oldest' ? 'asc' : (sortDir || 'desc');

  const { data: regularMaterialsData, isLoading: isRegularLoading } = useGetPersonalMaterialsQuery({
    folderId,
    keyword: searchQuery,
    sortBy: actualSortBy,
    sortOrder: actualSortOrder,
    filterMode: filterMode,
    filterFileType: filterFileType
  }, { skip: filterMode === 'bookmark' && !folderId });

  const { data: bookmarkedMaterialsData, isLoading: isBookmarkLoading } = useGetBookmarkedMaterialsQuery({
    keyword: searchQuery,
    sortBy: actualSortBy,
    sortOrder: actualSortOrder,
    filterFileType: filterFileType
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
        toast.success(item.isBookmarked ? t.materials.unbookmarkFolderSuccess : t.materials.bookmarkFolderSuccess);
      } else {
        await bookmarkMaterial(item.id).unwrap();
        toast.success(item.isBookmarked ? t.materials.unbookmarkFileSuccess : t.materials.bookmarkFileSuccess);
      }
    } catch (error) {
      console.error(error);
      toast.error(t.materials.bookmarkError);
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
    return Array.isArray(responseData.folders) ? responseData.folders.map(f => ({ ...f, id: f.folderId || f.id })) : [];
  }, [responseData.folders]);

  const files = useMemo(() => {
    return Array.isArray(responseData.materials) ? responseData.materials.map(file => ({ ...file, id: file.materialId || file.id })) : [];
  }, [responseData.materials]);
  const materials = useMemo(() => [...folders, ...files], [folders, files]);

  useEffect(() => {
    if (selectedItem) {
      const isFolder = !selectedItem.fileName && !selectedItem.fileUrl;
      const updatedItem = materials.find(m => {
        const mIsFolder = !m.fileName && !m.fileUrl;
        return m.id === selectedItem.id && mIsFolder === isFolder;
      });
      if (updatedItem && (updatedItem.downloadCount !== selectedItem.downloadCount || updatedItem.viewCount !== selectedItem.viewCount || updatedItem.isPublic !== selectedItem.isPublic || updatedItem.allowDownload !== selectedItem.allowDownload)) {
        setSelectedItem({ ...updatedItem, type: selectedItem.type || updatedItem.type });
      }
    }
  }, [materialsData, selectedItem, materials]);


  return (
    <div
      className="min-h-screen"
      onContextMenu={(e) => {
        if (e.target.closest('button, input, a, .group, [role="button"], .cursor-pointer')) {
          return;
        }
        handleContextMenu(e);
      }}
    >
      <Breadcrumb
        className='mb-4 flex-wrap'
        items={[
          {
            label: t.materials.home,
            onClick: () => navigate("/")
          },
          {
            label: t.materials.title,
            onClick: folderId ? () => navigate("/workspace/materials") : undefined
          },
          ...(folderPath ? folderPath.map(folder => ({
            label: folder.folderName || t.materials.folder,
            onClick: () => navigate(`/workspace/materials/${folder.folderId}`)
          })) : (folderId ? [{
            label: folderDetail?.folderName || folderDetail?.title || t.materials.folder,
            onClick: () => navigate(`/workspace/materials/${folderId}`)
          }] : []))
        ]}
      />

      {/* Header actions */}

      <div className="flex justify-end gap-3 mb-4 lg:hidden">
        <PillButton
          variant='outline'
          roundedClass='rounded-xl'
          borderColor='#6E0009'
          textColor="#6E0009"
          startIcon={<FolderPlus className="w-4 h-4" />}
          onClick={() => setIsCreateFolderOpen(true)}
        >
          {t.materials.createFolder}
        </PillButton>
        <PillButton
          roundedClass='rounded-xl'
          bgColor={"#6E0009"}
          startIcon={<Upload className="w-4 h-4" />}
          onClick={() => setIsUploadMaterialOpen(true)}
        >
          {t.materials.uploadMaterial}
        </PillButton>
      </div>


      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-4 flex-col md:flex-row gap-4">
        <div className="flex items-center gap-4 flex-1">
          <TextInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.materials.searchPlaceholder}
            containerClassName="w-full max-w-[448px]"
            className="!h-10 !rounded-xl border-[#E3BEBA]"
            icon={Search}
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
            {t.materials.filter} {filterMode ? `(1)` : ''}
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
              { value: 'name_asc', label: t.materials.sortOptions.nameAsc },
              { value: 'name_desc', label: t.materials.sortOptions.nameDesc },
              { value: 'newest', label: t.materials.sortOptions.newest },
              { value: 'oldest', label: t.materials.sortOptions.oldest },
              { value: 'size_asc', label: t.materials.sortOptions.sizeAsc },
              { value: 'size_desc', label: t.materials.sortOptions.sizeDesc },
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
                {selectedOption ? selectedOption.label : t.materials.sortBy}
              </PillButton>
            )}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <LoadingSpinner />
          <span className="text-[#5B403E]">{t.materials.loading}</span>
        </div>
      ) : (searchQuery || filterMode) && materials.length === 0 ? (
        <div className="mt-4">
          {searchQuery && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-[#1A1C1C]">{t.materials.searchResults}</h2>
              <p className="text-base text-[#5B403E]">
                {t.materials.zeroResults} <span className="font-bold text-[#6E0009]">"{searchQuery}"</span>
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
        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-70">
          <FolderPlus className="w-16 h-16 text-[#E3BEBA]" />
          <p className="text-lg font-medium text-[#5B403E]">{t.materials.emptyFolder}</p>
          <p className="text-[#5B403E] text-center max-w-md">
            {t.materials.uploadPrompt}
          </p>
        </div>
      ) : (
        <>
          {searchQuery && materials.length > 0 && (
            <div className="mb-8 mt-4">
              <h2 className="text-2xl font-semibold text-[#1A1C1C]">{t.materials.searchResults}</h2>
              <p className="text-base text-[#5B403E]">
                {t.materials.foundResults.replace('{{count}}', materials.length)} <span className="font-bold text-[#6E0009]">"{searchQuery}"</span>
              </p>
            </div>
          )}

          {/* Folders Section */}
          {folders.length > 0 && (
            <div className='space-y-4 mb-6'>
              <h2 className="text-2xl font-semibold text-[#1A1C1C]">{t.materials.folders}</h2>
              <div className={viewLayout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-3"}>
                {folders.map(folder => (
                  <FolderItem
                    key={folder.id || folder.folderId}
                    title={folder.name || folder.folderName}
                    totalItems={(!searchQuery && !filterMode) ? t.materials.itemsCount.replace('{{count}}', (folder.subFolderCount || 0) + (folder.materialCount || 0)) : null}
                    updatedAt={folder.updatedAt ? t.materials.updated.replace('{{date}}', formatDate(folder.updatedAt)) : ''}
                    isSelected={selectedItems.some(i => (i.id || i.folderId) === (folder.id || folder.folderId) && i._type === 'folder')}
                    isSelectionMode={selectedItems.length > 0}
                    onToggleSelect={() => handleToggleSelect(folder, 'folder')}
                    onClick={() => navigate(`/workspace/materials/${folder.id || folder.folderId}`)}
                    onDownload={() => downloadFolderAsZip(folder, false, null, t)}
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
              <h2 className="text-2xl font-semibold text-[#1A1C1C]">{searchQuery ? t.materials.files : t.materials.recentFiles}</h2>
              <div className={viewLayout === 'grid' ? "grid grid-cols-2 lg:grid-cols-4 gap-4 xl:grid-cols-6 2xl:grid-cols-7" : "flex flex-col gap-3"}>
                {files.map(file => (
                  <FileItem
                    key={file.id}
                    title={file.fileName || file.name}
                    size={formatSize(file.fileSize || file.size || file.sizeBytes)}
                    date={file.updatedAt ? formatDate(file.updatedAt) : ''}
                    isPublic={file.isPublic}
                    isBookmarked={file.isBookmarked}
                    type={file.fileType || 'file'}
                    fileUrl={file.fileUrl}
                    layout={viewLayout}
                    isSelected={selectedItems.some(i => i.id === file.id && i._type === 'file')}
                    isSelectionMode={selectedItems.length > 0}
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
                      if (selectedItems.length > 0) {
                        handleToggleSelect(file, 'file');
                      } else {
                        setSelectedItem(file);
                        setIsFilePreviewOpen(true);
                      }
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
        </>
      )}

      <CreateFolderModal
        open={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        currentFolderId={folderId || ''}
      />

      <UploadMaterialModal
        open={isUploadMaterialOpen}
        onClose={() => setIsUploadMaterialOpen(false)}
        currentFolderId={folderId || ''}
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
        item={selectedItem}
        onDelete={() => {
          setIsFileDetailOpen(false);
          setDeletingItem({ id: selectedItem.id, name: selectedItem.fileName || selectedItem.name, count: 0, type: 'file' });
          setIsDeleteFolderOpen(true);
        }}
        onMove={() => {
          setIsFileDetailOpen(false);
          setTimeout(() => {
            setIsMoveModalOpen(true);
          }, 300);
        }}
      />

      <FilePreviewModal
        open={isFilePreviewOpen}
        onClose={() => setIsFilePreviewOpen(false)}
        item={selectedItem}
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

      <ContextMenu
        isOpen={isContextOpen}
        position={contextPosition}
        onClose={closeContextMenu}
        options={[
          { label: t.materials.createFolder, icon: <FolderPlus className="w-4 h-4" />, onClick: () => setIsCreateFolderOpen(true) },
          { label: t.materials.uploadMaterial, icon: <Upload className="w-4 h-4" />, onClick: () => setIsUploadMaterialOpen(true) },
        ]}
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
              name: t.materials.selectedItemsCount.replace('{{count}}', selectedItems.length),
              count: 0,
              type: 'bulk',
              items: selectedItems
            });
          }
          setIsDeleteFolderOpen(true);
        }}
        onDownload={() => {
          const filesToDownload = selectedItems.filter(item => item._type === 'file' && item.fileUrl);
          const foldersToDownload = selectedItems.filter(item => item._type === 'folder');

          if (filesToDownload.length === 0 && foldersToDownload.length === 0) {
            toast.error(t.materials.noFilesToDownload);
            return;
          }

          if (selectedItems.length >= 2 || foldersToDownload.length >= 1) {
            downloadMultipleItemsAsZip(selectedItems, false, null, t, false);
            setSelectedItems([]);
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

          toast.success(t.materials.downloadingFiles.replace('{{count}}', filesToDownload.length));
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