import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import Modal from "@/shared/components/ui/Modal";

const DayScheduleActionModal = ({ actionStatus, onClose, cal = {} }) => {
  return (
    <Modal
      open={actionStatus !== null}
      onClose={onClose}
      showCloseButton={false}
      className="!max-w-[400px]"
    >
      <div className="flex flex-col items-center justify-center p-6 gap-4 text-center">
        {actionStatus?.status === "success" ? (
          <CheckCircle2 size={64} className="text-[#00BB38]" />
        ) : (
          <XCircle size={64} className="text-[#990011]" />
        )}

        <h2 className="text-xl font-bold text-black mt-2">
          {actionStatus?.status === "success"
            ? actionStatus.type === "register"
              ? cal.registerSuccess || "Đăng ký thành công!"
              : actionStatus.type === "cancel"
              ? cal.cancelRegSuccess || "Đã hủy đăng ký!"
              : cal.deleteSuccess || "Đã xóa sự kiện!"
            : actionStatus?.type === "register"
              ? cal.registerError || "Đăng ký thất bại"
              : actionStatus?.type === "cancel"
              ? cal.cancelRegError || "Hủy đăng ký thất bại"
              : cal.deleteError || "Xóa sự kiện thất bại"}
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 px-8 py-2.5 bg-[#990011] text-white rounded-full font-semibold hover:bg-[#7a000e] transition-colors w-full"
        >
          {cal.close || "Đóng"}
        </button>
      </div>
    </Modal>
  );
};

export default DayScheduleActionModal;
