import { downloadAuthenticatedFile } from "@/shared/utils/authenticatedMedia"

export const formatSize = (bytes) => {
  if (bytes === 0 || !bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const isFolder = (item) => {
  if (!item) return false;
  return !item.fileName && !item.fileUrl;
};

export const flattenFolders = (nodes, parentId = null) => {
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

export const downloadFile = async (file, recordDownloadFn = null) => {
  if (!file?.fileUrl) return

  if (recordDownloadFn && typeof recordDownloadFn === "function") {
    recordDownloadFn(file.id || file.materialId)
  }

  try {
    await downloadAuthenticatedFile(
      file.fileUrl,
      file.name || file.fileName || "download",
    )
  } catch (error) {
    console.error("Download failed:", error)
  }
}
