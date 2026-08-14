import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { store } from '@/store';
import { materialApi } from '@/store/api/materialApi';
import toast from 'react-hot-toast';
import { flattenFolders } from './materialUtils';

export const downloadFolderAsZip = async (folder, isPublicProfile = false, targetAccountId = null, t, silent = false) => {
  const toastId = !silent ? toast.loading(t?.materials?.downloadingFolder || 'Đang chuẩn bị tải xuống...') : null;

  try {
    let allFolders = [];
    let allFiles = [];

    if (isPublicProfile) {
      const fetchPublicFolderRecursively = async (folderId) => {
        try {
          const res = await store.dispatch(
            materialApi.endpoints.getPublicMaterialsByUserId.initiate({ targetAccountId, folderId })
          ).unwrap();
          
          const rawData = res.data || res || {};
          const subFolders = (rawData.folders || rawData.subFolders || []).map(f => ({ ...f, parentId: folderId }));
          const files = (rawData.materials || []).map(f => ({ ...f, folderId: folderId }));
          
          allFiles = [...allFiles, ...files];
          allFolders = [...allFolders, ...subFolders];
          
          for (const sub of subFolders) {
            const subId = sub.id || sub.folderId;
            if (subId) await fetchPublicFolderRecursively(subId);
          }
        } catch (e) {
          console.error(`Failed to fetch public folder ${folderId}`, e);
        }
      };
      
      const targetFolderId = folder.id || folder.folderId;
      allFolders.push(folder);
      await fetchPublicFolderRecursively(targetFolderId);
    } else {
      // Fetch all folders
      const treeResult = await store.dispatch(
        materialApi.endpoints.getFolderTree.initiate()
      ).unwrap();
      const rawTree = treeResult.data || treeResult || [];

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

    // Find all folders that belong to this folder or its subfolders
    const foldersToCreate = allFolders.filter(f => {
      return isDescendant(f.folderId || f.id, targetFolderId);
    });

    if (filesToDownload.length === 0 && foldersToCreate.length === 0) {
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

    // Create empty folder structure
    foldersToCreate.forEach(f => {
      const relativePath = getRelativePath(f.folderId || f.id, targetFolderId);
      if (relativePath) {
        zip.folder(relativePath);
      }
    });

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

    if (!silent) toast.success(t?.materials?.downloadSuccess || 'Tải xuống thành công', { id: toastId });
  } catch (error) {
    console.error('Zip download failed:', error);
    toast.error(t?.materials?.actionFailed || 'Tải xuống thất bại', { id: toastId });
  }
};

export const downloadMultipleItemsAsZip = async (items, isPublicProfile = false, targetAccountId = null, t, silent = false) => {
  const toastId = !silent ? toast.loading(t?.materials?.downloadingFiles?.replace('{{count}}', items.length) || 'Đang chuẩn bị tải xuống...') : null;

  try {
    let allFolders = [];
    let allFiles = [];

    if (isPublicProfile) {
      const fetchPublicFolderRecursively = async (folderId) => {
        try {
          const res = await store.dispatch(
            materialApi.endpoints.getPublicMaterialsByUserId.initiate({ targetAccountId, folderId })
          ).unwrap();
          
          const rawData = res.data || res || {};
          const subFolders = (rawData.folders || rawData.subFolders || []).map(f => ({ ...f, parentId: folderId }));
          const files = (rawData.materials || []).map(f => ({ ...f, folderId: folderId }));
          
          allFiles = [...allFiles, ...files];
          allFolders = [...allFolders, ...subFolders];
          
          for (const sub of subFolders) {
            const subId = sub.id || sub.folderId;
            if (subId) await fetchPublicFolderRecursively(subId);
          }
        } catch (e) {
          console.error(`Failed to fetch public folder ${folderId}`, e);
        }
      };

      for (const item of items) {
        if (item.type === 'folder' || item.isFolder || item._type === 'folder') {
          allFolders.push(item);
          await fetchPublicFolderRecursively(item.id || item.folderId);
        } else {
          allFiles.push(item);
        }
      }
    } else {
      const treeResult = await store.dispatch(
        materialApi.endpoints.getFolderTree.initiate()
      ).unwrap();
      const rawTree = treeResult.data || treeResult || [];
      allFolders = flattenFolders(rawTree);
    }

    const parentMap = {};
    allFolders.forEach(f => {
      const id = f.folderId || f.id;
      parentMap[id] = f.parentId || null;
    });

    const isDescendant = (childId, targetId) => {
      let currentId = childId;
      while (currentId) {
        if (String(currentId) === String(targetId)) return true;
        currentId = parentMap[currentId];
      }
      return false;
    };

    const filesToDownloadDir = items.filter(i => i._type === 'file' && i.fileUrl);
    const foldersToDownload = items.filter(i => i._type === 'folder');

    // TỐI ƯU 1: Loại bỏ thư mục con / file lẻ nếu thư mục cha đã được chọn (Tránh lỗi trùng lặp dữ liệu trong ZIP)
    const topLevelFolders = foldersToDownload.filter(folder => {
      let parentId = parentMap[folder.id || folder.folderId];
      while (parentId) {
        if (foldersToDownload.find(f => String(f.id || f.folderId) === String(parentId))) return false;
        parentId = parentMap[parentId];
      }
      return true;
    });

    const standaloneFiles = filesToDownloadDir.filter(file => {
      let parentId = file.folderId;
      while (parentId) {
        if (topLevelFolders.find(f => String(f.id || f.folderId) === String(parentId))) return false;
        parentId = parentMap[parentId];
      }
      return true;
    });

    let foldersToFetch = [];
    topLevelFolders.forEach(folder => {
      const targetFolderId = folder.id || folder.folderId;
      const descendants = allFolders.filter(f => isDescendant(f.folderId || f.id, targetFolderId));
      if (!descendants.find(f => String(f.folderId || f.id) === String(targetFolderId))) {
        descendants.push(folder);
      }
      foldersToFetch = [...foldersToFetch, ...descendants];
    });

    foldersToFetch = Array.from(new Map(foldersToFetch.map(f => [String(f.folderId || f.id), f])).values());

    if (!isPublicProfile && foldersToFetch.length > 0) {
      const fetchPromises = foldersToFetch.map(async (f) => {
        const id = f.folderId || f.id;
        try {
          const res = await store.dispatch(
            materialApi.endpoints.getPersonalMaterials.initiate({ folderId: id })
          ).unwrap();
          const rawData = res.data || res || {};
          return Array.isArray(rawData.materials) ? rawData.materials : (Array.isArray(rawData) ? rawData : []);
        } catch {
          return [];
        }
      });
      const filesArrays = await Promise.all(fetchPromises);
      allFiles = filesArrays.flat();
    }

    const zip = new JSZip();
    const downloadTasks = [];

    // Add standalone files
    standaloneFiles.forEach(file => {
      downloadTasks.push(async () => {
        try {
          const response = await fetch(file.fileUrl);
          if (!response.ok) throw new Error('Network error');
          const blob = await response.blob();
          zip.file(file.fileName || file.name, blob);
          store.dispatch(materialApi.endpoints.recordMaterialDownload.initiate(file.materialId || file.id));
        } catch (e) {
          console.error(e);
        }
      });
    });

    // Add folders
    const getRelativePathForFolder = (folderId, targetId, targetFolderName) => {
      let currentId = folderId;
      const path = [];
      while (currentId && String(currentId) !== String(targetId)) {
        const folder = allFolders.find(f => String(f.folderId || f.id) === String(currentId));
        if (folder) {
          path.unshift(folder.name || folder.folderName || 'Untitled Folder');
        }
        currentId = parentMap[currentId];
      }
      path.unshift(targetFolderName);
      return path.join('/');
    };

    if (downloadTasks.length === 0 && topLevelFolders.length === 0) {
      toast.error(t?.materials?.folderEmpty || 'Không có tệp để tải xuống', { id: toastId });
      return;
    }

    topLevelFolders.forEach(targetFolder => {
      const targetId = targetFolder.id || targetFolder.folderId;
      const targetName = targetFolder.name || targetFolder.folderName || 'Folder';
      
      // Create empty folder structure for this top-level folder
      const descendants = allFolders.filter(f => isDescendant(f.folderId || f.id, targetId));
      zip.folder(targetName); // Ensure root of this folder is created
      descendants.forEach(f => {
        const relativePath = getRelativePathForFolder(f.folderId || f.id, targetId, targetName);
        if (relativePath) {
          zip.folder(relativePath);
        }
      });

      const filesInThisFolder = allFiles.filter(file => isDescendant(file.folderId, targetId));

      filesInThisFolder.forEach(file => {
        if (!file.fileUrl) return;
        downloadTasks.push(async () => {
          try {
            const response = await fetch(file.fileUrl);
            if (!response.ok) throw new Error('Network error');
            const blob = await response.blob();
            
            const relativePath = getRelativePathForFolder(file.folderId, targetId, targetName);
            const fullPath = relativePath ? `${relativePath}/${file.fileName || file.name}` : (file.fileName || file.name);
            
            zip.file(fullPath, blob);
            store.dispatch(materialApi.endpoints.recordMaterialDownload.initiate(file.materialId || file.id));
          } catch (e) {
            console.error(e);
          }
        });
      });
    });

    // TỐI ƯU 2: Chạy tải xuống theo từng lô (Batching) để tránh quá tải trình duyệt và lỗi 429 Too Many Requests
    const BATCH_SIZE = 5;
    for (let i = 0; i < downloadTasks.length; i += BATCH_SIZE) {
      const batch = downloadTasks.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(task => task()));
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });

    let zipName = 'materials.zip';
    if (items.length === 1 && items[0]._type === 'folder') {
      zipName = `${items[0].name || items[0].folderName || 'Folder'}.zip`;
    }

    saveAs(zipContent, zipName);

    if (!silent) toast.success(t?.materials?.downloadSuccess || 'Tải xuống thành công', { id: toastId });
  } catch (error) {
    console.error('Zip download failed:', error);
    toast.error(t?.materials?.actionFailed || 'Tải xuống thất bại', { id: toastId });
  }
};
