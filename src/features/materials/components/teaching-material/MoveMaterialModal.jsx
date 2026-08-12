import React, { useCallback, useMemo, useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import { ArrowRightToLine, FolderOpen } from 'lucide-react';
import FolderNode from '../teaching-material/FolderNode';
import { PillButton } from '@/shared/components/ui/buttons';

import { useGetFolderTreeQuery, useMoveMaterialMutation, useMoveFolderMutation, useMoveMaterialsBulkMutation } from '@/store/api/materialApi';
import { LoadingSpinner } from '@/shared/components/ui/indicators';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/context/LanguageContext';

const MoveMaterialModal = ({ open, onClose, onSuccess, items = [], currentFolderId }) => {
  const { t } = useLanguage();
  const [expandedIds, setExpandedIds] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);

  const { data: treeData, isLoading: isFetchingTree } = useGetFolderTreeQuery(undefined, { skip: !open });
  const [moveMaterial, { isLoading: isMovingSingle }] = useMoveMaterialMutation();
  const [moveFolder, { isLoading: isMovingFolder }] = useMoveFolderMutation();
  const [moveMaterialsBulk, { isLoading: isMovingBulk }] = useMoveMaterialsBulkMutation();

  const isMoving = isMovingSingle || isMovingBulk || isMovingFolder;

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setExpandedIds([]);
      setSelectedFolder(null);
    }
  }

  const getFolderPath = useCallback(function getFolderPath(nodes, targetId, currentPath = []) {
    if (!nodes || !targetId) return null;
    for (const node of nodes) {
      const isMatch = String(node.folderId) === String(targetId) || String(node.id) === String(targetId);
      const pathWithCurrent = [...currentPath, { folderId: node.folderId || node.id, folderName: node.folderName }];

      if (isMatch) return pathWithCurrent;

      const children = node.subFolders || node.children;
      if (children && children.length > 0) {
        const found = getFolderPath(children, targetId, pathWithCurrent);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const currentParentFolderId = useMemo(() => {
    // If currentFolderId is explicitly passed (either an ID or null for root), use it directly
    if (currentFolderId !== undefined) {
      return currentFolderId;
    }

    // Fallback for when the modal is opened from somewhere else
    const item = items[0];
    if (!item) return undefined;
    const rawTree = treeData?.data || treeData || [];
    const targetId = item.id || item.folderId;
    const ownPath = getFolderPath(rawTree, targetId);

    if (ownPath) {
      if (ownPath.length > 1) {
        return ownPath[ownPath.length - 2].folderId;
      }
      return null;
    } else {
      return item.folderId || null;
    }
  }, [treeData, items, getFolderPath, currentFolderId]);

  const currentLocation = useMemo(() => {
    const item = items[0];
    if (!item || !treeData) return t.materials.rootFolder;
    const rawTree = treeData?.data || treeData || [];
    const targetId = item.id || item.folderId;

    const ownPath = getFolderPath(rawTree, targetId);

    if (ownPath) {
      if (ownPath.length > 1) {
        const parentPath = ownPath.slice(0, -1);
        return t.materials.rootFolder + " / " + parentPath.map(p => p.folderName).join(' / ');
      }
      return t.materials.rootFolder;
    } else {
      if (!item.folderId) return t.materials.rootFolder;
      const parentPath = getFolderPath(rawTree, item.folderId);
      if (parentPath) {
        return t.materials.rootFolder + " / " + parentPath.map(p => p.folderName).join(' / ');
      }
      return t.materials.rootFolder;
    }
  }, [treeData, items, getFolderPath, t]);

  // Hide selected folders from the tree
  const folders = useMemo(() => {
    const rawFolders = treeData?.data || treeData || [];
    if (!items.length) return rawFolders;

    const selectedFolderIds = items.filter(i => i._type === 'folder' || (i.folderId && !i.fileName)).map(i => String(i.id || i.folderId));

    if (selectedFolderIds.length === 0) return rawFolders;

    const filterTree = (nodes) => {
      return nodes.reduce((acc, node) => {
        if (selectedFolderIds.includes(String(node.folderId)) || selectedFolderIds.includes(String(node.id))) return acc;

        let filteredChildren = [];
        const children = node.subFolders || node.children;
        if (children) {
          filteredChildren = filterTree(children);
        }

        acc.push({ ...node, subFolders: filteredChildren });
        return acc;
      }, []);
    };
    return filterTree(rawFolders);
  }, [treeData, items]);

  const toggleExpand = (id) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(expandedId => expandedId !== id) : [...prev, id]
    );
  };

  const handleMove = async () => {
    if (!items.length) return;
    try {
      if (items.length === 1) {
        const item = items[0];
        const isFolder = item.type === 'folder' || item._type === 'folder' || (!item.fileName && !item.fileUrl);

        if (isFolder) {
          await moveFolder({
            id: item.id || item.folderId,
            targetFolderId: selectedFolder ? selectedFolder.folderId : null,
          }).unwrap();
        } else {
          await moveMaterial({
            id: item.id,
            targetFolderId: selectedFolder ? selectedFolder.folderId : null,
          }).unwrap();
        }
      } else {
        const folderIds = items.filter(i => i._type === 'folder' || (i.folderId && !i.fileName)).map(i => i.id || i.folderId);
        const materialIds = items.filter(i => i._type === 'file' || i.fileName).map(i => i.id);

        await moveMaterialsBulk({
          folderIds,
          materialIds,
          targetFolderId: selectedFolder ? selectedFolder.folderId : null,
        }).unwrap();
      }
      toast.success(t.materials.moveSuccess);
      onSuccess ? onSuccess() : onClose();
    } catch (error) {
      console.error("Failed to move material", error);
      toast.error(t.materials.moveError);
    }
  };

  const currentName = items.length === 1
    ? (items[0].fileName || items[0].folderName || items[0].name || "")
    : (() => {
      const foldersCount = items.filter(i => i._type === 'folder' || (i.folderId && !i.fileName)).length;
      const filesCount = items.filter(i => i._type === 'file' || i.fileName).length;
      const parts = [];
      if (foldersCount > 0) parts.push(t.materials.folderCountUnit.replace('{{count}}', foldersCount));
      if (filesCount > 0) parts.push(t.materials.fileCountUnit.replace('{{count}}', filesCount));
      return parts.join(t.materials.and);
    })();

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
        startIcon={<ArrowRightToLine className="w-4 h-4" />}
        roundedClass='rounded-xl'
        bgColor="#6E0009"
        onClick={handleMove}
        loading={isMoving}
        disabled={String(selectedFolder ? selectedFolder.folderId : null) === String(currentParentFolderId)}
      >
        {t.materials.moveToHere}
      </PillButton>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.materials.moveMaterial}
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footer={footer}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-[#5B403E] text-sm">
            {t.materials.selectDestination.split('"{{name}}"').map((part, index, array) => (
              <React.Fragment key={index}>
                {part}
                {index < array.length - 1 && <span className="font-semibold text-[#1A1C1C]">"{currentName}"</span>}
              </React.Fragment>
            ))}
          </p>
          <p className="text-[#5B403E] text-sm">
            {t.materials.currentLocationLabel} <span className="font-medium text-[#1A1C1C]">{currentLocation}</span>
          </p>
        </div>

        <div className="border border-[#E2E2E2] rounded-xl p-3 overflow-y-auto min-h-[250px] max-h-[400px] flex flex-col">
          {isFetchingTree ? (
            <div className="flex flex-col items-center justify-center flex-1 text-sm text-[#5B403E] gap-2 opacity-70">
              <LoadingSpinner />
              <span>{t.materials.loadingFolderTree}</span>
            </div>
          ) : folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-sm text-[#5B403E] gap-2 opacity-70">
              <FolderOpen className="w-8 h-8" />
              <span>{t.materials.noFolders}</span>
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
                disabledIds={[currentParentFolderId]}
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
                  disabledIds={[currentParentFolderId]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MoveMaterialModal;
