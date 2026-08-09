import React from "react"
import Modal from "@/shared/components/ui/Modal"
import ProUpgradeCard from "./ProUpgradeCard"

const ProUpgradeModal = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={null}
      showCloseButton={true}
      className="max-w-[480px] w-full rounded-2xl overflow-hidden bg-transparent shadow-none border-none p-0"
      bodyClassName="p-0 flex flex-col"
    >
      <ProUpgradeCard onUpgradeSuccess={onClose} />
    </Modal>
  )
}

export default ProUpgradeModal
