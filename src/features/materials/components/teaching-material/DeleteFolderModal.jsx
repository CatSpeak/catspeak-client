import React from "react";
import Modal from "@/shared/components/ui/Modal";
import { AlertTriangle, FolderMinus, Loader2 } from "lucide-react";
import { PillButton } from "@/shared/components/ui/buttons";
import {
  useDeletePersonalMaterialMutation,
  useDeleteMaterialsBulkMutation,
  useDeleteFolderMutation,
} from "@/store/api/materialApi";
import toast from "react-hot-toast";
import { useLanguage } from "@/shared/context/LanguageContext";

const DeleteFolderModal = ({ open, onClose, onSuccess, item }) => {
  const { t } = useLanguage();
  const [deleteMaterial, { isLoading: isDeletingSingle }] =
    useDeletePersonalMaterialMutation();
  const [deleteFolder, { isLoading: isDeletingFolder }] =
    useDeleteFolderMutation();
  const [deleteMaterialsBulk, { isLoading: isDeletingBulk }] =
    useDeleteMaterialsBulkMutation();
  const isLoading = isDeletingSingle || isDeletingBulk || isDeletingFolder;

  const handleDelete = async () => {
    try {
      if (item.type === "bulk" && item.items) {
        const folderIds = item.items
          .filter((i) => i._type === "folder" || (i.folderId && !i.fileName))
          .map((i) => i.id || i.folderId);
        const materialIds = item.items
          .filter((i) => i._type === "file" || i.fileName)
          .map((i) => i.id);

        const result = await deleteMaterialsBulk({
          folderIds,
          materialIds,
        }).unwrap();
        const resData = result?.data || result;
        if (resData?.totalFailed > 0) {
          toast(
            `Xóa ${resData.totalRequested} mục: ${resData.totalSucceeded} thành công, ${resData.totalFailed} thất bại`,
            { icon: "⚠️" },
          );
        } else {
          toast.success(
            t.materials.deletedMultipleSuccess.replace(
              "{{count}}",
              resData?.totalSucceeded ?? item.items.length,
            ),
          );
        }
      } else {
        const isFolder =
          item.type === "folder" ||
          item._type === "folder" ||
          (item.type !== "file" &&
            item._type !== "file" &&
            !item.fileName &&
            !item.fileUrl);

        if (isFolder) {
          await deleteFolder(item.id || item.folderId).unwrap();
        } else {
          await deleteMaterial(item.id).unwrap();
        }
        toast.success(
          isFolder
            ? t.materials.deletedFolderSuccess
            : t.materials.deletedFileSuccess,
        );
      }
      if (onSuccess) onSuccess();
      else onClose();
    } catch (err) {
      console.error(err);
      const errCode = err?.data?.message;
      const errMsg = errCode
        ? t.materials.errors?.[errCode] || errCode
        : err?.message || t.materials.deleteError;
      toast.error(errMsg);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <PillButton
        onClick={onClose}
        variant="outline"
        roundedClass="rounded-xl"
        disabled={isLoading}
      >
        {t.materials.cancel}
      </PillButton>
      <PillButton
        roundedClass="rounded-xl"
        onClick={handleDelete}
        loading={isLoading}
        disabled={isLoading || item.isImpactLoading}
      >
        {t.materials.delete}
      </PillButton>
    </div>
  );

  // Hiển thị chi tiết ảnh hưởng
  const renderImpactSection = () => {
    if (item.type === "bulk" || item.type === "file") return null;

    if (item.isImpactLoading) {
      return (
        <div className="bg-[#E8E8E8] border-[#E2E2E2] rounded-xl p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-[#5B403E] animate-spin" />
          <span className="text-[14px] text-[#5B403E]">
            {t.materials.loadingData || "Đang tải thông tin"}
          </span>
        </div>
      );
    }

    if (item.affectedDetail) {
      const { folders, materials } = item.affectedDetail;
      if (folders > 0 || materials > 0) {
        return (
          <div className="bg-[#E8E8E8] border-[#E2E2E2] rounded-xl p-4 flex items-center gap-3">
            <FolderMinus
              className="w-5 h-5 text-[#5B403E] shrink-0"
              strokeWidth={1.5}
            />
            <span className="text-[14px] text-[#5B403E]">
              {t.materials.deleteFolderImpactMsg
                .replace("{{name}}", item.name)
                .replace("{{folders}}", folders)
                .replace("{{materials}}", materials)}
            </span>
          </div>
        );
      }
    }

    // Fallback cho count cũ
    if (item.count > 0) {
      return (
        <div className="bg-[#E8E8E8] border-[#E2E2E2] rounded-xl p-4 flex items-center gap-3">
          <FolderMinus className="w-5 h-5 text-[#5B403E]" strokeWidth={1.5} />
          <span className="text-[14px] text-[#5B403E]">
            {t.materials.deleteFolderWarning
              .split("{{count}}")
              .map((part, index, array) => (
                <React.Fragment key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <span className="font-bold text-[#1A1C1C]">
                      {item.count}
                    </span>
                  )}
                </React.Fragment>
              ))}
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFDAD6] rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#BA1A1A]" />
          </div>
          <span className="text-[20px] font-bold text-gray-800">
            {t.materials.confirmDelete}
          </span>
        </div>
      }
      className="md:max-w-[420px] w-full"
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        <div className="text-base text-[#5B403E]">
          {t.materials.deleteConfirmMessage
            .split('"{{name}}"')
            .map((part, index, array) => (
              <React.Fragment key={index}>
                {part}
                {index < array.length - 1 && (
                  <span className="font-bold text-[#1A1C1C]">
                    "{item.name}"
                  </span>
                )}
              </React.Fragment>
            ))}
        </div>

        {renderImpactSection()}
      </div>
    </Modal>
  );
};

export default DeleteFolderModal;
