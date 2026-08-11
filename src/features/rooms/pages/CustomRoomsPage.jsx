import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { AnimatePresence } from "framer-motion";
import { FluentAnimation } from "@/shared/components/ui/animations";
import { Crown, Plus } from "lucide-react";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import PageTitle from "@/shared/components/ui/PageTitle";
import {
  EmptyState,
  PlanRequiredState,
} from "@/shared/components/ui/indicators";
import { toast } from "react-hot-toast";
import {
  useGetMyCustomRoomsQuery,
  useDeleteCustomRoomMutation,
} from "@/store/api/roomsApi";
import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures";
import CreateRoomModal from "../components/CreateRoomModal";
import EditRoomModal from "../components/EditRoomModal";
import CustomRoomCard from "../components/CustomRoomCard";

const CustomRoomsPage = () => {
  const { t } = useLanguage();
  const { lang } = useParams();
  const navigate = useNavigate();
  const ct = t.rooms?.customRooms || {};
  const { limits, isLoading: isPlanLoading } = usePlanFeatures();

  const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en";

  // API hooks
  const { data: customRoomsData, isLoading } = useGetMyCustomRoomsQuery();
  const [deleteCustomRoom, { isLoading: isDeleting }] =
    useDeleteCustomRoomMutation();

  const customRooms = customRoomsData?.customRooms || [];
  const quota = {
    used: customRoomsData?.currentCustomRoomsCount ?? 0,
    max: customRoomsData?.maxCustomRooms ?? 3,
  };
  const isQuotaFull = false; // customRoomsData?.canCreateCustomRoom === false

  // Local state
  const [copiedId, setCopiedId] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCopyLink = (roomId) => {
    const link = `${window.location.origin}/${supportedLangCode}/meet/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(roomId);
    toast.success(ct.linkCopied || "Link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleJoinRoom = (roomId) => {
    navigate(`/${supportedLangCode}/meet/${roomId}`);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
  };

  const handleDelete = async (roomId) => {
    try {
      await deleteCustomRoom(roomId).unwrap();
    } catch (err) {
      console.error("Failed to delete custom room:", err);
      toast.error(err?.data?.message || "Failed to delete room");
    }
  };

  if (!isPlanLoading && !limits.allowCustomRooms) {
    return (
      <PlanRequiredState
        pageTitle={ct.myRoomsTitle || "My Custom Rooms"}
        subtext="Custom rooms allow you to create persistent, customizable rooms for your community. Upgrade to CatSpeak Pro to unlock custom rooms!"
        featureName="Custom Rooms"
        animationKey="custom-rooms-pro-required"
      />
    );
  }

  return (
    <>
      <CreateRoomModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        initialMode="custom"
      />

      {/* Edit Room Modal */}
      <EditRoomModal
        open={!!editingRoom}
        room={editingRoom}
        onClose={() => setEditingRoom(null)}
      />

      <AnimatePresence mode="wait">
        <FluentAnimation
          animationKey="custom-rooms-page"
          direction="up"
          className="w-full"
        >
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <PageTitle>{ct.myRoomsTitle || "My Custom Rooms"}</PageTitle>

            <PillButton
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isQuotaFull}
              startIcon={<Plus size={18} />}
              className="h-12"
            >
              {ct.create || "Create Room"}
            </PillButton>
          </div>

          {/* Room Quota Counter */}
          <p className="text-sm font-medium text-[#606060] mb-2 text-center sm:text-left">
            {(ct.quota || "{{used}}/{{max}} rooms used")
              .replace("{{used}}", quota.used)
              .replace("{{max}}", quota.max)}
          </p>

          {/* Room List */}
          {isLoading ? (
            <RoomsListSkeleton />
          ) : customRooms.length === 0 ? (
            <EmptyState
              icon={Crown}
              iconClassName="w-12 h-12 mb-4 text-amber-500"
              title={ct.noRooms || "You haven't created any custom rooms yet"}
              subtext={
                ct.noRoomsSubtext ||
                "Create your first persistent room with up to 100 participants!"
              }
              fullPage
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {customRooms.map((room) => (
                <CustomRoomCard
                  key={room.id || room.roomId}
                  room={room}
                  onEdit={handleEditRoom}
                  onDelete={handleDelete}
                  onCopyLink={handleCopyLink}
                  onJoin={handleJoinRoom}
                  copiedId={copiedId}
                  isDeleting={isDeleting}
                  ct={ct}
                />
              ))}
            </div>
          )}
        </FluentAnimation>
      </AnimatePresence>
    </>
  );
};

// --- Sub Components ---

const RoomsListSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden animate-pulse flex flex-col"
      >
        <div className="aspect-video w-full bg-gray-200" />
        <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-4 bg-gray-100 rounded w-24" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default CustomRoomsPage;
