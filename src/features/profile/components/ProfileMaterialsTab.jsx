import React, { useState, useMemo, useEffect } from 'react';
import { Search, LayoutGrid, TableProperties } from 'lucide-react';
import FluentCard from '@/shared/components/ui/FluentCard';
import TextInput from '@/shared/components/ui/inputs/TextInput';
import { IconButton } from '@/shared/components/ui/buttons';
import Tabs from '@/shared/components/ui/navigation/Tabs';
import ProfileFolderItem from './ProfileFolderItem';
import ProfileFileItem from './ProfileFileItem';
import { EmptyState, LoadingSpinner } from '@/shared/components/ui/indicators';
import { useGetPersonalMaterialsQuery, useGetFolderTreeQuery, useRecordMaterialDownloadMutation, useGetMaterialByShareTokenQuery, useGetFolderByShareTokenQuery, useGetPublicMaterialsByUserIdQuery } from '@/store/api/materialApi';
import { useTimezone } from "@/shared/hooks/useTimezone";
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import ShareMaterialModal from '../../materials/components/teaching-material/ShareMaterialModal';
import DeleteFolderModal from '../../materials/components/teaching-material/DeleteFolderModal';
import PublicMaterialModal from '../../materials/components/teaching-material/PublicMaterialModal';
import FileDetailModal from '../../materials/components/teaching-material/FileDetailModal';
import MoveMaterialModal from '../../materials/components/teaching-material/MoveMaterialModal';
import RenameMaterialModal from '../../materials/components/teaching-material/RenameMaterialModal';
import BulkActionBar from '../../materials/components/teaching-material/BulkActionBar';
import FilePreviewModal from '@/shared/components/ui/FilePreviewModal';
import SaveSharedMaterialModal from '../../materials/components/teaching-material/SaveSharedMaterialModal';
import { useLanguage } from '@/shared/context/LanguageContext';
import { downloadFolderAsZip } from '@/features/materials/utils/zipDownloader';

const formatSize = (bytes) => {
  if (bytes === 0 || !bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};



const ProfileMaterialsTab = ({ targetAccountId, isOwnProfile }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { formatDate } = useTimezone();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewLayout, setViewLayout] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('all');

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [isFileDetailOpen, setIsFileDetailOpen] = useState(false);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const [isPublicMaterialModalOpen, setIsPublicMaterialModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isSaveSharedModalOpen, setIsSaveSharedModalOpen] = useState(false);

  // Selection state
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deletingItem, setDeletingItem] = useState({ id: null, name: "", count: 0, type: "folder" });

  const sharedMaterialToken = searchParams.get("sharedMaterialToken");
  const { data: sharedMaterialData, isError: isMaterialError, error: materialError, isFetching: isMaterialFetching } = useGetMaterialByShareTokenQuery(sharedMaterialToken, {
    skip: !sharedMaterialToken
  });
  const { data: sharedFolderData, isError: isFolderError, error: folderError, isFetching: isFolderFetching } = useGetFolderByShareTokenQuery(sharedMaterialToken, {
    skip: !sharedMaterialToken
  });

  useEffect(() => {
    const isFetchingShared = isMaterialFetching || isFolderFetching;

    if (sharedMaterialToken && !isFetchingShared && isMaterialError && isFolderError) {
      const errorMsg = materialError?.data?.message || folderError?.data?.message || t.materials?.materialNotFound || "Tài liệu/Thư mục không tồn tại hoặc không được chia sẻ công khai";
      toast.error(errorMsg);
      searchParams.delete("sharedMaterialToken");
      setSearchParams(searchParams, { replace: true });
      navigate('/workspace/materials', { replace: true });
      return;
    }

    if (sharedMaterialToken && (sharedMaterialData || sharedFolderData)) {
      const data = sharedMaterialData?.data || sharedMaterialData || sharedFolderData?.data || sharedFolderData;
      setSelectedItem({
        ...data,
        fileUrl: data.fileUrl || data.previewUrl,
        fileName: data.fileName || data.name
      });
      setIsPublicMaterialModalOpen(true);

      // Clean up the URL to prevent reopening the modal on tab switch
      searchParams.delete("sharedMaterialToken");
      setSearchParams(searchParams, { replace: true });
    }
  }, [sharedMaterialToken, sharedMaterialData, sharedFolderData, isMaterialError, isFolderError, isMaterialFetching, isFolderFetching, materialError, folderError, searchParams, setSearchParams, navigate, t]);

  // Fetch API for owner
  const { data: materialsData, isLoading: isLoadingMaterials } = useGetPersonalMaterialsQuery({ keyword: searchQuery }, { skip: !isOwnProfile });
  const { data: treeData, isLoading: isLoadingTree } = useGetFolderTreeQuery(undefined, { skip: !isOwnProfile });

  // Fetch API for guest
  const { data: publicMaterialsData, isLoading: isLoadingPublicMaterials } = useGetPublicMaterialsByUserIdQuery(
    { targetAccountId, keyword: searchQuery },
    { skip: isOwnProfile || !targetAccountId }
  );

  const [recordDownload] = useRecordMaterialDownloadMutation();

  const rawFoldersTree = useMemo(() => treeData?.data || treeData || [], [treeData]);
  const responseData = isOwnProfile
    ? (materialsData?.data || materialsData || {})
    : (publicMaterialsData?.data || publicMaterialsData || {});

  const baseFolders = useMemo(() => {
    if (isOwnProfile) {
      const metaMap = {};
      if (Array.isArray(responseData.folders)) {
        responseData.folders.forEach(f => {
          metaMap[f.id] = f;
        });
      }

      const flattenFolders = (nodes) => {
        let flat = [];
        for (const node of nodes) {
          flat.push(node);
          const children = node.subFolders || node.children || [];
          if (children.length > 0) {
            flat = flat.concat(flattenFolders(children));
          }
        }
        return flat;
      };

      const nodesToProcess = searchQuery.trim() ? flattenFolders(rawFoldersTree) : rawFoldersTree;

      return nodesToProcess.map(node => {
        const id = node.folderId || node.id;
        const meta = metaMap[id] || {};
        return {
          id,
          name: node.folderName || node.name || t.materials.untitledFolder,
          itemsCount: meta.materialCount || node.materialCount || 0,
          updatedAt: formatDate(meta.updatedAt || node.updatedAt),
          isPublic: meta.isPublic !== undefined ? meta.isPublic : false,
          publicShareUrl: meta.publicShareUrl || node.publicShareUrl,
          shareToken: meta.shareToken || node.shareToken,
          isBookmarked: meta.isBookmarked || node.isBookmarked || false,
        };
      });
    } else {
      const folders = Array.isArray(responseData.folders) ? responseData.folders : [];
      return folders.map(f => ({
        id: f.id || f.folderId,
        name: f.name || f.folderName || t.materials.untitledFolder,
        itemsCount: f.materialCount || f.itemsCount || 0,
        updatedAt: formatDate(f.updatedAt),
        isPublic: f.isPublic !== undefined ? f.isPublic : false,
        publicShareUrl: f.publicShareUrl,
        shareToken: f.shareToken,
        isBookmarked: f.isBookmarked || false,
      }));
    }
  }, [responseData.folders, rawFoldersTree, isOwnProfile, t.materials.untitledFolder, formatDate, searchQuery]);

  const baseFiles = useMemo(() => {
    let rawFiles = Array.isArray(responseData.materials) ? responseData.materials.map(file => ({ ...file, id: file.materialId || file.id })) : [];

    return rawFiles.map(file => ({
      id: file.id,
      name: file.fileName || file.name || t.materials.untitledFile,
      size: formatSize(file.fileSize || file.size || file.sizeBytes),
      date: formatDate(file.updatedAt),
      isPublic: file.isPublic !== undefined ? file.isPublic : false,
      fileUrl: file.fileUrl,
      ...file
    }));
  }, [responseData.materials, t.materials.untitledFile, formatDate]);

  const materials = useMemo(() => [...baseFolders, ...baseFiles], [baseFolders, baseFiles]);

  const isFolder = (item) => !item.fileName && !item.fileUrl;

  useEffect(() => {
    if (selectedItem) {
      const selectedIsFolder = isFolder(selectedItem);
      const updatedItem = materials.find(m => m.id === selectedItem.id && isFolder(m) === selectedIsFolder);
      if (updatedItem && (updatedItem.downloadCount !== selectedItem.downloadCount || updatedItem.viewCount !== selectedItem.viewCount || updatedItem.isPublic !== selectedItem.isPublic || updatedItem.allowDownload !== selectedItem.allowDownload)) {
        setSelectedItem({ ...updatedItem, type: selectedItem.type || updatedItem.type });
      }
    }
  }, [materialsData, selectedItem, materials]);

  const filterTabs = [
    { id: 'all', label: t.materials.allTab.replace('{{count}}', baseFolders.length + baseFiles.length) },
    { id: 'public', label: t.materials.publicTab.replace('{{count}}', baseFolders.filter(f => f.isPublic).length + baseFiles.filter(f => f.isPublic).length) },
    { id: 'private', label: t.materials.privateTab.replace('{{count}}', baseFolders.filter(f => !f.isPublic).length + baseFiles.filter(f => !f.isPublic).length) },
  ];

  const filteredFolders = useMemo(() => {
    return baseFolders.filter(folder => {
      const matchSearch = folder.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!isOwnProfile) return matchSearch;
      if (activeFilterTab === 'public') return matchSearch && folder.isPublic;
      if (activeFilterTab === 'private') return matchSearch && !folder.isPublic;
      return matchSearch;
    });
  }, [baseFolders, searchQuery, activeFilterTab, isOwnProfile]);

  const filteredFiles = useMemo(() => {
    return baseFiles.filter(file => {
      const matchSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!isOwnProfile) return matchSearch;
      if (activeFilterTab === 'public') return matchSearch && file.isPublic;
      if (activeFilterTab === 'private') return matchSearch && !file.isPublic;
      return matchSearch;
    });
  }, [baseFiles, searchQuery, activeFilterTab, isOwnProfile]);

  const toggleSelection = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id && isFolder(i) === isFolder(item));
      if (isSelected) {
        return prev.filter(i => !(i.id === item.id && isFolder(i) === isFolder(item)));
      } else {
        return [...prev, item];
      }
    });
  };

  const handleDownloadFile = async (file) => {
    if (!file.fileUrl) return;
    recordDownload(file.id);
    try {
      const response = await fetch(file.fileUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name || 'download';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(file.fileUrl, '_blank');
    }
  };

  if ((isOwnProfile && (isLoadingMaterials || isLoadingTree)) || (!isOwnProfile && isLoadingPublicMaterials)) {
    return (
      <div className="w-full flex items-center justify-center min-h-[500px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 min-h-[500px]">
      <div className="p-4 sm:p-6 bg-white overflow-visible rounded-2xl border border-[#E3BEBA]">
        <div className="flex flex-col gap-4">
          {isOwnProfile && (
            <h2 className="text-xl font-bold text-[#1A1C1C]">
              {t.materials.manageAndShare}
            </h2>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {isOwnProfile ? (
              <div className="w-full md:w-auto overflow-x-auto scrollbar-hidden">
                <Tabs
                  tabs={filterTabs}
                  activeTab={activeFilterTab}
                  onChange={setActiveFilterTab}
                  fullWidth={false}
                  className="whitespace-nowrap min-w-max border-none"
                  tabClassName="!px-1 !mr-6"
                />
              </div>
            ) : (
              <h2 className="text-xl font-bold text-[#1A1C1C]">
                {t.materials.sharedMaterials.replace('{{count}}', baseFolders.length + baseFiles.length)}
              </h2>
            )}

            <div className="flex flex-row items-center gap-3 shrink-0">
              <div className="w-full sm:w-64 relative">
                <TextInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.materials.searchMaterialsPlaceholder}
                  className="!h-10 pl-10 bg-[#F9F9F9] border-none rounded-xl text-sm"
                  icon={Search}
                />
              </div>
              <div className="flex items-center bg-[#F3F3F3] border border-[#E3BEBA] rounded-xl p-1 max-h-10 cursor-pointer shrink-0 self-end sm:self-auto">
                <IconButton
                  variant="iconOnly"
                  size="sm"
                  className={`!rounded-[8px] h-[30px] hover:bg-[#E3BEBA] transition-colors ${viewLayout === 'grid' ? 'bg-[#F9F9F9] shadow-sm' : ''}`}
                  onClick={() => setViewLayout('grid')}
                >
                  <LayoutGrid className={`w-4 h-4 ${viewLayout === 'grid' ? 'text-[#6E0009]' : 'text-[#5B403E]'}`} />
                </IconButton>
                <IconButton
                  variant="iconOnly"
                  size="sm"
                  className={`!rounded-[8px] h-[30px] hover:bg-[#E3BEBA] transition-colors ${viewLayout === 'list' ? 'bg-[#F9F9F9] shadow-sm' : ''}`}
                  onClick={() => setViewLayout('list')}
                >
                  <TableProperties className={`w-4 h-4 ${viewLayout === 'list' ? 'text-[#6E0009]' : 'text-[#5B403E]'}`} />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(filteredFolders.length === 0 && filteredFiles.length === 0) ? (
        <FluentCard className="p-12 flex flex-col items-center justify-center">
          <EmptyState
            message={t.materials.noMaterialsFound}
            description={searchQuery ? t.materials.tryDifferentSearch : ""}
          />
        </FluentCard>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredFolders.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#1A1C1C]">{t.materials.folderCountLabel.replace('{{count}}', filteredFolders.length)}</h3>
              <div className={`grid gap-4 ${viewLayout === 'grid' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredFolders.map(folder => {
                  const isSelected = selectedItems.some(item => item.id === folder.id && isFolder(item));
                  return (
                    <ProfileFolderItem
                      key={folder.id}
                      title={folder.name}
                      totalItems={folder.itemsCount}
                      updatedAt={folder.updatedAt}
                      isPublic={folder.isPublic}
                      isBookmarked={folder.isBookmarked}
                      isOwnProfile={isOwnProfile}
                      isSelected={isSelected}
                      isSelectionMode={selectedItems.length > 0}
                      onToggleSelect={() => toggleSelection(folder)}
                      onClick={() => {
                        if (selectedItems.length > 0) {
                          toggleSelection(folder);
                        } else {
                          navigate(`/workspace/materials/${folder.id}`);
                        }
                      }}
                      onDownload={() => downloadFolderAsZip(folder, !isOwnProfile, targetAccountId, t)}
                      onShare={() => {
                        if (isOwnProfile) {
                          setSelectedItem(folder);
                          setIsShareModalOpen(true);
                        } else {
                          if (folder.shareToken) {
                            const link = `${window.location.origin}/shared-material/${folder.shareToken}`;
                            navigator.clipboard.writeText(link);
                            toast.success(t.materials.linkCopied || "Đã sao chép liên kết");
                          } else {
                            toast.error("Không thể lấy liên kết chia sẻ");
                          }
                        }
                      }}
                      onRename={() => {
                        setSelectedItem(folder);
                        setIsRenameModalOpen(true);
                      }}
                      onDelete={() => {
                        setDeletingItem({ id: folder.id, name: folder.name, count: folder.itemsCount, type: 'folder' });
                        setIsDeleteFolderOpen(true);
                      }}
                      onMove={() => {
                        setSelectedItem(folder);
                        setIsMoveModalOpen(true);
                      }}
                      onBookmark={() => {
                        setSelectedItem(folder);
                        setIsSaveSharedModalOpen(true);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {filteredFiles.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#1A1C1C]">{t.materials.fileCountLabel.replace('{{count}}', filteredFiles.length)}</h3>
              <div className={`grid gap-4 ${viewLayout === 'grid' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
                {filteredFiles.map(file => {
                  const isSelected = selectedItems.some(item => item.id === file.id && !isFolder(item));
                  return (
                    <ProfileFileItem
                      key={file.id}
                      title={file.name}
                      size={file.size}
                      date={file.date}
                      isPublic={file.isPublic}
                      fileUrl={file.fileUrl}
                      isOwnProfile={isOwnProfile}
                      isList={viewLayout === 'list'}
                      isSelected={isSelected}
                      isSelectionMode={selectedItems.length > 0}
                      onToggleSelect={() => toggleSelection(file)}
                      onClick={() => {
                        if (selectedItems.length > 0) {
                          toggleSelection(file);
                        } else {
                          setSelectedItem(file);
                          setIsFilePreviewOpen(true);
                        }
                      }}
                      onShare={() => {
                        if (isOwnProfile) {
                          setSelectedItem(file);
                          setIsShareModalOpen(true);
                        } else {
                          if (file.shareToken) {
                            const link = `${window.location.origin}/shared-material/${file.shareToken}`;
                            navigator.clipboard.writeText(link);
                            toast.success(t.materials.linkCopied || "Đã sao chép liên kết");
                          } else {
                            toast.error("Không thể lấy liên kết chia sẻ");
                          }
                        }
                      }}
                      onRename={() => {
                        setSelectedItem(file);
                        setIsRenameModalOpen(true);
                      }}
                      onDelete={() => {
                        setDeletingItem({ id: file.id, name: file.name, count: 0, type: 'file' });
                        setIsDeleteFolderOpen(true);
                      }}
                      onMove={() => {
                        setSelectedItem(file);
                        setIsMoveModalOpen(true);
                      }}
                      onEdit={() => {
                        setSelectedItem(file);
                        setIsFileDetailOpen(true);
                      }}
                      onDownload={() => handleDownloadFile(file)}
                      onBookmark={() => {
                        setSelectedItem(file);
                        setIsSaveSharedModalOpen(true);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {isOwnProfile && (
        <>
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
              setDeletingItem({ id: selectedItem.id, name: selectedItem.name, count: 0, type: 'file' });
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
            items={selectedItems.length > 0 && !selectedItem ? selectedItems : (selectedItem ? [selectedItem] : [])}
            currentFolderId={null}
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

          <BulkActionBar
            selectedCount={selectedItems.length}
            onClearSelection={() => setSelectedItems([])}
            onDelete={() => {
              if (selectedItems.length === 1) {
                setDeletingItem({
                  id: selectedItems[0].id,
                  name: selectedItems[0].name,
                  count: 0,
                  type: isFolder(selectedItems[0]) ? 'folder' : 'file'
                });
              } else {
                setDeletingItem({
                  id: 'bulk',
                  name: t.materials.selectedItemsCountLabel.replace('{{count}}', selectedItems.length),
                  count: 0,
                  type: 'bulk',
                  items: selectedItems
                });
              }
              setIsDeleteFolderOpen(true);
            }}
            onDownload={() => {
              const filesToDownload = selectedItems.filter(item => !isFolder(item) && item.fileUrl);
              const foldersToDownload = selectedItems.filter(item => isFolder(item));

              if (filesToDownload.length === 0 && foldersToDownload.length === 0) {
                toast.error(t.materials.noFilesToDownload);
                return;
              }

              filesToDownload.forEach(file => handleDownloadFile(file));
              foldersToDownload.forEach(folder => downloadFolderAsZip(folder, !isOwnProfile, targetAccountId, t, true));

              toast.success(t.materials.downloadingFiles.replace('{{count}}', filesToDownload.length + foldersToDownload.length));
              setSelectedItems([]);
            }}
            onMove={() => {
              setSelectedItem(null);
              setIsMoveModalOpen(true);
            }}
          />
        </>
      )}

      <SaveSharedMaterialModal
        open={isSaveSharedModalOpen}
        onClose={() => setIsSaveSharedModalOpen(false)}
        item={selectedItem}
        onSuccess={() => {
          setIsSaveSharedModalOpen(false);
        }}
      />

      <PublicMaterialModal
        open={isPublicMaterialModalOpen}
        onClose={() => setIsPublicMaterialModalOpen(false)}
        item={selectedItem}
        isOwner={Boolean(
          selectedItem &&
          isOwnProfile &&
          materials.some(m => String(m.id) === String(selectedItem.id) && isFolder(m) === isFolder(selectedItem))
        )}
      />
    </div>
  );
};

export default ProfileMaterialsTab;