import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { store } from '@/store';
import { materialApi } from '@/store/api/materialApi';
import toast from 'react-hot-toast';

export const downloadFolderAsZip = async (folder, isPublicProfile = false, targetAccountId = null, t) => {
  const toastId = toast.loading(t?.materials?.downloadingFolder || 'Đang chuẩn bị tải xuống...');

  try {
    let allFolders = [];
    let allFiles = [];

    if (isPublicProfile) {
      // Fetch public materials for the user
      const result = await store.dispatch(
        materialApi.endpoints.getPublicMaterialsByUserId.initiate({ targetAccountId })
      ).unwrap();
      allFolders = result.folders || [];
      allFiles = result.materials || [];
    } else {
      // Fetch all folders
      const treeResult = await store.dispatch(
        materialApi.endpoints.getFolderTree.initiate()
      ).unwrap();
      const rawTree = treeResult.data || treeResult || [];

      const flattenFolders = (nodes, parentId = null) => {
        let flat = [];
        for (const node of nodes) {
          const id = node.folderId || node.id;
          const nodeWithParentId = { ...node, parentId: node.parentId || parentId };
          flat.push(nodeWithParentId);
          const children = node.subFolders || node.children || [];
          if (children.length > 0) {
            flat = flat.concat(flattenFolders(children, id));
          }
        }
        return flat;
      };
      allFolders = flattenFolders(rawTree);
    }

    // Map folder parent-child relationships for quick lookup
    const parentMap = {}; // Maps folderId to its parentId
    allFolders.forEach(f => {
      const id = f.folderId || f.id;
      const parentId = f.parentId || null;
      parentMap[id] = parentId;
    });

    // Helper to check if a folder is a descendant of the target folder
    const isDescendant = (childId, targetId) => {
      let currentId = childId;
      while (currentId) {
        if (String(currentId) === String(targetId)) return true;
        currentId = parentMap[currentId];
      }
      return false;
    };

    const targetFolderId = folder.id || folder.folderId;

    if (!isPublicProfile) {
      // Get all folder IDs that are descendants of the target folder
      const descendantFolders = allFolders.filter(f => isDescendant(f.folderId || f.id, targetFolderId));

      // Include the target folder itself if it's not in the descendants
      if (!descendantFolders.find(f => String(f.folderId || f.id) === String(targetFolderId))) {
        descendantFolders.push(folder);
      }

      // Fetch files for all these folders concurrently
      const fetchPromises = descendantFolders.map(async (f) => {
        const id = f.folderId || f.id;
        try {
          const res = await store.dispatch(
            materialApi.endpoints.getPersonalMaterials.initiate({ folderId: id })
          ).unwrap();
          const rawData = res.data || res || {};
          const files = Array.isArray(rawData.materials) ? rawData.materials : (Array.isArray(rawData) ? rawData : []);
          return files;
        } catch (e) {
          console.error(`Failed to fetch materials for folder ${id}`, e);
          return [];
        }
      });

      const filesArrays = await Promise.all(fetchPromises);
      allFiles = filesArrays.flat();
    }

    // Find all files that belong to this folder or its subfolders
    const filesToDownload = allFiles.filter(file => {
      const parentFolderId = file.folderId;
      return isDescendant(parentFolderId, targetFolderId);
    });

    if (filesToDownload.length === 0) {
      toast.error(t?.materials?.folderEmpty || 'Thư mục trống', { id: toastId });
      return;
    }

    // Helper to get full path of a file inside the target folder
    const getRelativePath = (folderId, targetId) => {
      let currentId = folderId;
      const path = [];
      while (currentId && String(currentId) !== String(targetId)) {
        const folder = allFolders.find(f => String(f.folderId || f.id) === String(currentId));
        if (folder) {
          path.unshift(folder.name || folder.folderName || 'Untitled Folder');
        }
        currentId = parentMap[currentId];
      }
      return path.join('/');
    };

    const zip = new JSZip();

    // Download files and add to zip
    const downloadPromises = filesToDownload.map(async (file) => {
      if (!file.fileUrl) return;
      try {
        const response = await fetch(file.fileUrl);
        if (!response.ok) throw new Error('Network error');
        const blob = await response.blob();

        const relativePath = getRelativePath(file.folderId, targetFolderId);
        const fullPath = relativePath ? `${relativePath}/${file.fileName || file.name}` : (file.fileName || file.name);

        zip.file(fullPath, blob);

        // Record download for each file
        store.dispatch(materialApi.endpoints.recordMaterialDownload.initiate(file.materialId || file.id));
      } catch (err) {
        console.error('Failed to download file:', file.fileName, err);
      }
    });

    await Promise.all(downloadPromises);

    const zipContent = await zip.generateAsync({ type: 'blob' });
    saveAs(zipContent, `${folder.name || folder.folderName || 'Folder'}.zip`);

    toast.success(t?.materials?.downloadSuccess || 'Tải xuống thành công', { id: toastId });
  } catch (error) {
    console.error('Zip download failed:', error);
    toast.error(t?.materials?.actionFailed || 'Tải xuống thất bại', { id: toastId });
  }
};
