import React, { useState, useRef } from 'react';
import Modal from '@/shared/components/ui/Modal';
import { UploadCloud, Upload } from 'lucide-react';
import Switch from '@/shared/components/ui/inputs/Switch';
import Dropdown from '@/shared/components/ui/Dropdown';
import UploadItem from './UploadItem';
import { PillButton } from '@/shared/components/ui/buttons';
import toast from 'react-hot-toast';
import { useGetFolderTreeQuery, materialApi } from '@/store/api/materialApi';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useGlobalTask } from '@/shared/hooks/useGlobalTask';
import { useDispatch } from 'react-redux';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'xlsx', 'pptx', 'jpg', 'png', 'jpeg'];

const getExtension = (fileName) => {
  if (!fileName) return '';
  const parts = fileName.split('.');
  return parts[parts.length - 1].toLowerCase();
};

const getMappedType = (ext) => {
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'avi'].includes(ext)) return 'video';
  if (['pdf'].includes(ext)) return 'pdf';
  return 'file';
};

const getFileFingerprint = (file) => {
  return `${file.name}-${file.size}-${file.lastModified}`;
};

const UploadMaterialModal = ({ open, onClose, currentFolderId }) => {
  const { t } = useLanguage();
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(currentFolderId || '');

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelectedFolder(currentFolderId || '');
    }
  }

  const [uploadFiles, setUploadFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const fileInputRef = useRef(null);

  const { data: treeData } = useGetFolderTreeQuery(undefined, { skip: !open });
  const dispatch = useDispatch();
  const { startTask, tasks } = useGlobalTask();
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [uploadingFilesIds, setUploadingFilesIds] = useState([]);
  const currentTask = tasks.find(t => t.id === currentTaskId);

  // Extract flat folders for dropdown
  const folders = [];
  const traverse = (nodes, level = 0) => {
    nodes.forEach(node => {
      folders.push({ value: node.folderId, label: `${'\u00A0\u00A0'.repeat(level * 2)}${node.folderName}` });
      if (node.subFolders) traverse(node.subFolders, level + 1);
    });
  };
  const rawFolders = treeData?.data || treeData || [];
  traverse(rawFolders);

  const folderOptions = [
    { value: '', label: t.materials.rootFolderDefault },
    ...folders
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelection(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelection(Array.from(e.target.files));
    }
  };

  const handleFilesSelection = (files) => {
    const validFiles = [];
    const existingFingerprints = new Set(uploadFiles.map(f => getFileFingerprint(f.file)));
    let hasDuplicate = false;

    for (const file of files) {
      const ext = getExtension(file.name);
      const fingerprint = getFileFingerprint(file);

      if (existingFingerprints.has(fingerprint)) {
        hasDuplicate = true;
      } else if (file.size > MAX_FILE_SIZE) {
        toast.error(t.materials.fileExceedsSizeLimit.replace('{{name}}', file.name));
      } else if (!ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(t.materials.fileUnsupportedFormat.replace('{{name}}', file.name));
      } else {
        validFiles.push(file);
        existingFingerprints.add(fingerprint);
      }
    }

    if (hasDuplicate) {
      toast.error(t.materials.someFilesSkipped);
    }

    if (validFiles.length > 0) {
      const remaining = 5 - uploadFiles.length;
      if (validFiles.length > remaining) {
        toast.error(t.materials.maxFilesExceeded);
      }
      const filesToAdd = validFiles.slice(0, remaining);
      const toAdd = filesToAdd.map(file => ({
        id: getFileFingerprint(file),
        file,
        progress: 0,
        status: 'reading' // 'reading' | 'ready' | 'uploading' | 'success' | 'error'
      }));

      setUploadFiles(prev => [...prev, ...toAdd]);

      // Read each file from local disk using FileReader to track progress
      filesToAdd.forEach(file => {
        const fileId = getFileFingerprint(file);
        const reader = new FileReader();

        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: percent } : f));
          }
        };

        reader.onload = () => {
          setUploadFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'ready', progress: 100 } : f));
        };

        reader.onerror = () => {
          setUploadFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'error', progress: 0 } : f));
          toast.error(t.materials.cannotReadFile.replace('{{name}}', file.name));
        };

        reader.readAsArrayBuffer(file);
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (id) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpload = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'ready' || f.status === 'error');
    if (pendingFiles.length === 0) {
      toast.error(t.materials.noValidFilesToUpload);
      return;
    }

    setIsBusy(true);

    setIsBusy(true);

    const formData = new FormData();
    pendingFiles.forEach(fileObj => {
      formData.append('files', fileObj.file);
    });
    formData.append('isPublic', isPublic);
    if (selectedFolder) {
      formData.append('folderId', selectedFolder);
    }

    const pendingIds = pendingFiles.map(f => f.id);
    setUploadingFilesIds(pendingIds);

    const taskId = await startTask({
      title: t.materials.uploadMaterialTitle,
      url: "/personal-materials/upload",
      data: formData,
      isUploadTask: true,
      isHidden: true,
      onSuccess: () => {
        dispatch(materialApi.util.invalidateTags(["PersonalMaterials"]));
        toast.success(t.materials.uploadSuccessCount.replace('{{count}}', pendingFiles.length));
        handleClose();
      },
      onError: () => {
        setIsBusy(false);
        toast.error(t.materials.uploadError);
      }
    });

    setCurrentTaskId(taskId);
  };

  const handleClose = () => {
    setUploadFiles([]);
    setSelectedFolder('');
    setIsPublic(true);
    setIsBusy(false);
    setCurrentTaskId(null);
    setUploadingFilesIds([]);
    onClose();
  };

  const footer = (
    <div className="flex items-center justify-end gap-3 pt-4">
      <PillButton
        onClick={handleClose}
        variant='outline'
        roundedClass='rounded-xl'
      >
        {t.materials.cancel}
      </PillButton>
      <PillButton
        roundedClass='rounded-xl'
        onClick={handleUpload}
        loading={isBusy}
        disabled={uploadFiles.filter(f => f.status === 'ready' || f.status === 'error').length === 0}
        startIcon={<Upload className="w-4 h-4" />}
      >
        {t.materials.upload}
      </PillButton>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t.materials.uploadMaterialTitle}
      className="md:max-w-xl w-full"
      footer={footer}
    >
      <div className="flex flex-col gap-6">
        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-10 px-6 text-center cursor-pointer transition-colors ${dragActive ? 'border-[#8e1115] bg-[#fde9eb]' : 'border-[#E3BEBA] bg-[#F9F9F9] hover:bg-[#fff5f5]'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.xlsx,.pptx,.jpg,.png,.jpeg"
            multiple
            className="hidden"
          />
          <div className="w-14 h-14 bg-[#fde9eb] rounded-full flex items-center justify-center mb-4 text-[#8e1115]">
            <UploadCloud className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <p className="text-[15px] text-gray-800 font-bold mb-1">
            {t.materials.dragDropFileOr}<span className="text-[#8e1115] hover:underline">{t.materials.selectFile}</span>
          </p>
          <p className="text-[13px] text-gray-500 mb-1">
            {t.materials.supportedFormats}
          </p>
          <p className="text-[13px] text-gray-500">
            {t.materials.uploadLimits}
          </p>
        </div>

        {/* Uploading list */}
        {uploadFiles.length > 0 && (
          <div>
            <h4 className="text-base font-semibold text-[#1A1C1C] mb-3">{t.materials.uploadListTitle.replace('{{count}}', uploadFiles.length)}</h4>
            <div className="flex flex-col gap-4">
              {uploadFiles.map(fileObj => {
                const isUploadingThis = uploadingFilesIds.includes(fileObj.id) && currentTask;
                const progress = isUploadingThis ? currentTask.progress : fileObj.progress;
                const status = isUploadingThis
                  ? (currentTask.status === 'ERROR' ? 'error' : currentTask.status === 'SUCCESS' ? 'success' : 'uploading')
                  : fileObj.status;

                return (
                  <UploadItem
                    key={fileObj.id}
                    name={fileObj.file.name}
                    sizeBytes={fileObj.file.size}
                    uploadedBytes={progress === 100 ? fileObj.file.size : fileObj.file.size * (progress / 100)}
                    progress={progress}
                    status={status}
                    type={getMappedType(getExtension(fileObj.file.name))}
                    onCancel={() => handleRemoveFile(fileObj.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
          {/* Folder select */}
          <div>
            <label className="block text-base font-bold text-[#1A1C1C] mb-2">{t.materials.saveToFolder}</label>
            <Dropdown
              className='border-[#E3BEBA] bg-[#F9F9F9]'
              roundedClass='rounded-xl'
              dropdownClassName="w-full"
              value={selectedFolder}
              onChange={setSelectedFolder}
              options={folderOptions}
              triggerClassName="h-[42px] border-[#fde9eb] w-full"
            />
          </div>

          {/* Public toggle */}
          <div className="flex items-center gap-3">
            <Switch
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              colorClass="peer-checked:bg-[#8e1115]"
            />
            <span className="text-sm text-[#1A1C1C]">{t.materials.publicShareOnUpload}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UploadMaterialModal;
