import React, { useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Trash2,
  Clock,
  MapPin,
  ArrowRight,
  X,
  AlertTriangle,
  BookmarkCheck,
} from "lucide-react";
import dayjs from "dayjs";
import { useLanguage } from "@/shared/context/LanguageContext";
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb";
import { useEventForm } from "../hooks/useEventForm";
import EventDateTimeSection from "../components/CreateEventModal/EventDateTimeSection";
import EventRecurrenceSection from "../components/CreateEventModal/EventRecurrenceSection";
import EventDetailsSection from "../components/CreateEventModal/EventDetailsSection";
import EditChoiceModal from "../components/EventDetailModal/EditChoiceModal";
import Modal from "@/shared/components/ui/Modal";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  useDeleteEventMutation,
  useGetEventDraftsQuery,
} from "@/store/api/eventsApi";
import MapView from "../components/Mapview";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/store/slices/authSlice";
import { useAuthModal } from "@/shared/context/AuthModalContext";

// const DEFAULT_COVER =
//   "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80"

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { lang } = useParams();
  const location = useLocation();
  const { t } = useLanguage();
  const cal = t.calendar || {};

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { openAuthModal } = useAuthModal();

  // editEvent injected from EventDetailModal via navigate state
  const editEvent = location.state?.editEvent || null;
  const isEditing = Boolean(editEvent);

  const [pendingPayload, setPendingPayload] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const performSaveRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(
    editEvent?.thumbnailUrl || null,
  );
  const fileInputRef = useRef(null);

  // Draft state
  const { data: draftsData = [] } = useGetEventDraftsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const drafts = draftsData;
  const [mobileTab, setMobileTab] = useState("create"); // "create" | "draft"
  const [draftSaved, setDraftSaved] = useState(false);
  const [showDeleteDraftConfirm, setShowDeleteDraftConfirm] = useState(null); // draft id

  const handleSaveDraft = async () => {
    try {
      await form.handleSubmit(null, true);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    } catch (e) {
      console.log(e);
    }
  };

  const handleLoadDraft = (draft) => {
    form.setTitle(draft.title || "");
    form.setStartTime(draft.startTime || null);
    form.setEndTime(draft.endTime || null);
    form.setEventLocation(draft.location || "");
    form.setCountryId(draft.countryId || 0);
    form.setCityId(draft.cityId || 0);
    form.setDescription(draft.description || "");
    form.setTicketPrice(draft.ticketPrice ?? null);
    form.setIsOnline(draft.isOnline ?? null);
    if (draft.thumbnailUrl) {
      setImagePreview(draft.thumbnailUrl);
    }
    form.setEventColor(draft.color || "#990011");
    form.setMaxParticipants(draft.maxParticipants || "");
    form.setVisibility(draft.visibilityScope || "PUBLIC");
    form.setConditionsInput(
      draft.conditions && draft.conditions.length > 0
        ? draft.conditions.map((c) => c.title).join(", ")
        : "",
    );

    if (draft.recurrenceRule) {
      form.setRecurrenceOption(draft.recurrenceRule.frequency || "NONE");
      form.setRecurrenceInterval(draft.recurrenceRule.interval || 1);
      if (
        draft.recurrenceRule.byWeekDay &&
        draft.recurrenceRule.byWeekDay.length > 0
      ) {
        const codes = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
        const days = draft.recurrenceRule.byWeekDay
          .map((d) => codes.indexOf(d))
          .filter((d) => d !== -1);
        form.setSelectedDays(days.length ? days : [1, 4]);
      }
      form.setRecurrenceEndDate(draft.recurrenceRule.recurrenceEndDate || "");

      let endType = "NONE";
      if (draft.recurrenceRule.endCondition === "UNTIL_DATE") endType = "DATE";
      else if (draft.recurrenceRule.endCondition === "OCCURRENCE_COUNT")
        endType = "COUNT";

      form.setRecurrenceEndType(endType);
      form.setOccurrenceCount(draft.recurrenceRule.occurrenceCount || 10);
    } else {
      form.setRecurrenceOption("NONE");
    }

    if (draft.timezone)
      form.setSelectedTimezone({ id: draft.timezone, name: draft.timezone });

    // IMPORTANT: Inject draft state so hook knows we are editing this draft
    navigate(location.pathname, { state: { editEvent: draft }, replace: true });

    setMobileTab("create");
  };

  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const handleDeleteDraft = async (id) => {
    try {
      await deleteEvent(id).unwrap();
      setShowDeleteDraftConfirm(null);
    } catch (e) {
      console.log(e);
    }
  };

  const basePath = lang ? `/${lang}/cat-speak/calendar` : "/cat-speak/calendar";
  const returnPath = location.state?.from || basePath;

  const breadcrumbItems = [
    {
      label: t.nav?.home || "Trang chủ",
      onClick: () => navigate("/"),
    },
    {
      label: "Cat Speak",
      onClick: () => navigate(`/${lang}/community`),
    },
    {
      label: cal.schedule || "Thời gian biểu",
      onClick: () => navigate(basePath),
    },
    {
      label: isEditing
        ? cal.editEvent || "Chỉnh sửa sự kiện"
        : cal.createEvent || "Tạo sự kiện",
    },
  ];

  const handleClose = () => {
    navigate(returnPath);
  };

  const handleSuccess = () => {
    setSubmitStatus("success");
  };

  const handleError = () => {
    setSubmitStatus("error");
  };

  const form = useEventForm(
    handleSuccess,
    editEvent,
    (payload, performSave) => {
      performSave(payload, "series");
    },
    handleError,
    () => setSubmitStatus("validation_error"),
  );
  console.log("form.eventColor =", form.eventColor);

  const handleDeleteConfirmed = async () => {
    try {
      const eventId = editEvent?.eventId || editEvent?.id;
      await deleteEvent(eventId).unwrap();
      navigate(returnPath);
    } catch (err) {
      console.error("Delete failed:", err);
      setShowDeleteConfirm(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Preview data
  const previewTitle = form.title || cal.randomEventTitle;
  const previewStart = form.startTime
    ? dayjs(form.startTime).format("HH:mm")
    : "hh/mm";
  const previewEnd = form.endTime
    ? dayjs(form.endTime).format("HH:mm")
    : "hh/mm";

  return (
    <div className="w-full min-h-screen bg-[#fdfdfd]">
      {/* Breadcrumb */}
      <div className="px-5 py-3 pt-2">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between px-5 pb-5">
        <h1 className="text-3xl font-bold text-black">
          {isEditing
            ? cal.editEvent || "Chỉnh sửa sự kiện"
            : cal.createEvent || "Tạo sự kiện"}
        </h1>
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#990011] text-[#990011] text-sm font-semibold hover:bg-[#990011]/5 transition-colors"
            >
              {cal.deleteEvent || "Xóa sự kiện"}
              <Trash2 size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            {cal.cancel || "Hủy"}
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ===== MOBILE TAB SWITCHER (hidden on lg+) ===== */}
      <div className="lg:hidden px-5 mb-0">
        <div
          className="bg-white shadow-sm overflow-hidden"
          style={{ borderRadius: "16px 16px 0 0" }}
        >
          <div className="flex">
            <button
              type="button"
              onClick={() => setMobileTab("create")}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                mobileTab === "create"
                  ? "text-[#990011] border-b-2 border-[#990011]"
                  : "text-gray-400 border-b-2 border-transparent hover:text-gray-600"
              }`}
            >
              {cal.createEventBtn || "Tạo sự kiện"}
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("draft")}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors relative ${
                mobileTab === "draft"
                  ? "text-[#990011] border-b-2 border-[#990011]"
                  : "text-gray-400 border-b-2 border-transparent hover:text-gray-600"
              }`}
            >
              {cal.draftTab || "Bản nháp"}
              {drafts.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#990011] text-white text-[10px] font-bold">
                  {drafts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ===== MOBILE DRAFT LIST (hidden on lg+) ===== */}
      {mobileTab === "draft" && (
        <div className="lg:hidden px-5 pb-10">
          <div
            className="bg-white shadow-sm overflow-hidden"
            style={{ borderRadius: "0 0 16px 16px" }}
          >
            {drafts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <BookmarkCheck size={40} className="mb-3 opacity-30" />
                <p className="text-sm">
                  {cal.noDrafts || "Chưa có bản nháp nào"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F0F0F0]">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="flex items-start gap-3 p-4 hover:bg-[#FFF5F5] transition-colors cursor-pointer"
                    onClick={() => handleLoadDraft(draft)}
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-full shrink-0 overflow-hidden flex items-center justify-center bg-[#990011]">
                      {draft.thumbnailUrl ? (
                        <img
                          src={draft.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-base font-bold">
                          {(draft.title || "E")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-black truncate">
                        {draft.title ||
                          cal.randomEventTitle ||
                          "Tên Event ngẫu nhiên"}
                      </p>
                      {(draft.startTime || draft.endTime) && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Clock size={11} />
                          <span>
                            {draft.startTime
                              ? dayjs(draft.startTime).format("HH:mm")
                              : "--:--"}
                            {" - "}
                            {draft.endTime
                              ? dayjs(draft.endTime).format("HH:mm")
                              : "--:--"}
                          </span>
                        </div>
                      )}
                      {draft.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <MapPin size={11} />
                          <span className="truncate">{draft.location}</span>
                        </div>
                      )}
                    </div>
                    {/* Price tag */}
                    <div className="shrink-0 text-right">
                      <span className="text-xs text-gray-400">
                        {cal.filterPrice || "Giá cả"}
                      </span>
                      <p className="text-sm font-bold text-[#990011]">
                        {draft.ticketPrice && Number(draft.ticketPrice) > 0
                          ? `${Number(draft.ticketPrice).toLocaleString()}đ`
                          : cal.free || "Miễn Phí"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Two-column layout — on mobile shows only when mobileTab === "create" */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isAuthenticated) {
            openAuthModal("login");
            return;
          }
          form.handleSubmit(e);
        }}
        className={`px-5 pb-10 ${
          mobileTab === "draft" ? "hidden lg:block" : ""
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT - Event Info Form */}
          <div className="bg-white rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
            <h2 className="text-lg font-bold text-black">
              {cal.eventInfo || "Thông tin sự kiện"}
            </h2>

            {/* Image Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                {cal.eventImage || "Ảnh sự kiện"}
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full aspect-video rounded-2xl border-2 border-dashed border-[#D0D0D0] bg-[#FAFAFA] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#990011]/40 hover:bg-[#990011]/3 transition-all overflow-hidden"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover absolute inset-0"
                  />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400 text-center px-4">
                      {cal.imageUploadHint ||
                        "Hỗ trợ định dạng png, jpeg và svg."}
                      <br />
                      <span className="text-xs">
                        {cal.imageUploadSize || "Kích cỡ dưới 50mb"}
                      </span>
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="flex items-start max-[425px]:flex-col max-[425px]:gap-1">
              <label className="w-[150px] shrink-0 pt-[10px] max-[425px]:pt-0 max-[425px]:w-full">
                {cal.filterEventType || "Loại sự kiện"}
              </label>
              <div className="w-full min-w-0">
                <div className="relative w-full max-w-[240px]">
                  <select
                    value={
                      form.isOnline === true
                        ? "online"
                        : form.isOnline === false
                          ? "offline"
                          : ""
                    }
                    onChange={(e) => {
                      if (e.target.value === "online") form.setIsOnline(true);
                      else if (e.target.value === "offline")
                        form.setIsOnline(false);
                      else form.setIsOnline(null);
                    }}
                    className="w-full h-11 rounded-2xl border border-[#e5e5e5] px-4 text-sm text-gray-500 appearance-none bg-white outline-none focus:border-[#990011] transition-colors pr-9"
                  >
                    <option value="">
                      {cal.eventTypePlaceholder || "Online hay offline?"}
                    </option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                {form.isOnline === true && (
                  <p className="text-red-500 text-xs mt-1">
                    Tạo sự kiện online (trực tuyến) hiện tại chưa được hỗ trợ.
                    Vui lòng chọn lại.
                  </p>
                )}
              </div>
            </div>

            {/* Form Sections */}
            <EventDateTimeSection
              eventColor={form.eventColor || "#990011"}
              startTime={form.startTime}
              onStartTimeChange={form.setStartTime}
              endTime={form.endTime}
              onEndTimeChange={form.setEndTime}
              selectedTimezone={form.selectedTimezone}
              onTimezoneChange={form.setSelectedTimezone}
              errors={form.errors}
            />

            <EventDetailsSection
              title={form.title}
              onTitleChange={(val) => {
                form.setTitle(val);
                if (form.errors?.title)
                  form.setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              eventColor={form.eventColor || "#990011"}
              countryId={form.countryId}
              onCountryIdChange={(val) => {
                form.setCountryId(val);
                form.setCityId(0);
                if (form.errors?.countryId)
                  form.setErrors((prev) => ({ ...prev, countryId: undefined }));
              }}
              cityId={form.cityId}
              onCityIdChange={(val) => {
                form.setCityId(val);
                if (form.errors?.cityId)
                  form.setErrors((prev) => ({ ...prev, cityId: undefined }));
              }}
              eventLocation={form.eventLocation}
              onLocationChange={(val) => {
                form.setEventLocation(val);
                if (form.errors?.eventLocation)
                  form.setErrors((prev) => ({
                    ...prev,
                    eventLocation: undefined,
                  }));
              }}
              // description={form.description}
              // onDescriptionChange={form.setDescription}
              maxParticipants={form.maxParticipants}
              onMaxParticipantsChange={(val) => {
                form.setMaxParticipants(val);
                if (form.errors?.maxParticipants)
                  form.setErrors((prev) => ({
                    ...prev,
                    maxParticipants: undefined,
                  }));
              }}
              conditionsInput={form.conditionsInput}
              onConditionsChange={form.setConditionsInput}
              ticketPrice={form.ticketPrice}
              onTicketPriceChange={form.setTicketPrice}
              isOnline={form.isOnline}
              errors={form.errors}
            />

            <EventRecurrenceSection
              eventColor={form.eventColor || "#990011"}
              startTime={form.startTime}
              recurrenceOption={form.recurrenceOption}
              onRecurrenceChange={form.setRecurrenceOption}
              recurrenceInterval={form.recurrenceInterval}
              onRecurrenceIntervalChange={form.setRecurrenceInterval}
              selectedDays={form.selectedDays}
              onSelectedDaysChange={form.setSelectedDays}
              recurrenceEndDate={form.recurrenceEndDate}
              onRecurrenceEndDateChange={form.setRecurrenceEndDate}
              recurrenceEndType={form.recurrenceEndType}
              onRecurrenceEndTypeChange={form.setRecurrenceEndType}
              occurrenceCount={form.occurrenceCount}
              onOccurrenceCountChange={form.setOccurrenceCount}
            />

            {/* Event type (online/offline) dropdown note */}

            {/* Description note */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {cal.eventDescOptional || "Mô tả sự kiện (tùy chọn)"}
                </label>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => form.setDescription(e.target.value)}
                placeholder={cal.descriptionPlaceholder || "Nội dung"}
                rows={3}
                className="w-full rounded-xl border border-[#C6C6C6] px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#990011] transition-colors resize-none"
              />
              <span className="text-xs text-gray-400 text-right">
                {cal.descMaxChars || "Nội dung không được quá 150 từ"}
              </span>
            </div>

            {/* Submit buttons row */}
            <div className="flex gap-3">
              {/* Save draft button */}
              {(!isEditing || editEvent?.isDraft) && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex-1 h-12 rounded-full border-2 border-[#990011] text-[#990011] font-semibold text-sm hover:bg-[#990011]/5 transition-colors flex items-center justify-center gap-2"
                >
                  {draftSaved ? (
                    <>
                      <BookmarkCheck size={16} />
                      {cal.draftSaved || "Đã lưu!"}
                    </>
                  ) : (
                    <>{cal.saveDraft || "Lưu nháp"}</>
                  )}
                </button>
              )}
              <button
                type="submit"
                disabled={form.isLoading || form.isOnline === true}
                className="flex-1 h-12 rounded-full text-white font-semibold text-base bg-[#990011] hover:bg-[#7a000e] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {form.isLoading
                  ? isEditing
                    ? cal.updatingEvent || "Đang cập nhật..."
                    : cal.creatingEvent || "Đang tạo..."
                  : isEditing
                    ? cal.updateEvent || "Cập nhật sự kiện"
                    : cal.createEventBtn || "Tạo sự kiện"}
              </button>
            </div>
          </div>

          {/* RIGHT - Preview + Desktop Drafts */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-black">
              {cal.previewInfo || "Xem trước thông tin"}
            </h2>

            {/* Preview card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E5E5]">
              <div className="flex items-start gap-3">
                {/* Preview image */}
                <div
                  className="w-14 h-14 rounded-full shrink-0 overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: form.eventColor || "#990011" }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Event"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xl font-bold">
                      {previewTitle[0]?.toUpperCase() || "E"}
                    </span>
                  )}
                </div>

                {/* Preview details */}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-base font-semibold text-black">
                    {previewTitle}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                    <Clock size={13} />
                    <span>
                      {previewStart} - {previewEnd}
                    </span>
                  </div>
                  {form.eventLocation && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                      <MapPin size={13} />
                      <span className="truncate">{form.eventLocation}</span>
                    </div>
                  )}
                  {!form.eventLocation && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-0.5 italic">
                      <MapPin size={13} />
                      <span>Địa chỉ sự kiện</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Placeholder info about preview */}
            <p className="text-sm text-gray-400 px-1">
              {cal.previewNote ||
                "Thông tin hiển thị trước giúp bạn kiểm tra trước khi tạo sự kiện."}
            </p>

            {/* Desktop Draft list */}
            {(!isEditing || editEvent?.isDraft) && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-black">
                    {cal.draftTab || "Bản nháp"}
                    {drafts.length > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#990011] text-white text-[10px] font-bold">
                        {drafts.length}
                      </span>
                    )}
                  </h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                  {drafts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <BookmarkCheck size={32} className="mb-2 opacity-30" />
                      <p className="text-sm">
                        {cal.noDrafts || "Chưa có bản nháp nào"}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F0F0F0]">
                      {drafts.map((draft) => (
                        <div
                          key={draft.id}
                          className="flex items-start gap-3 p-4 hover:bg-[#FFF5F5] transition-colors group"
                        >
                          {/* Thumbnail */}
                          <div
                            className="w-12 h-12 rounded-full shrink-0 overflow-hidden flex items-center justify-center bg-[#990011] cursor-pointer"
                            onClick={() => handleLoadDraft(draft)}
                          >
                            {draft.thumbnailUrl ? (
                              <img
                                src={draft.thumbnailUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-base font-bold">
                                {(draft.title || "E")[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          {/* Info */}
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => handleLoadDraft(draft)}
                          >
                            <p className="font-semibold text-sm text-black truncate">
                              {draft.title ||
                                cal.randomEventTitle ||
                                "Tên Event ngẫu nhiên"}
                            </p>
                            {(draft.startTime || draft.endTime) && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                <Clock size={11} />
                                <span>
                                  {draft.startTime
                                    ? dayjs(draft.startTime).format("HH:mm")
                                    : "--:--"}
                                  {" - "}
                                  {draft.endTime
                                    ? dayjs(draft.endTime).format("HH:mm")
                                    : "--:--"}
                                </span>
                              </div>
                            )}
                            {draft.location && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                <MapPin size={11} />
                                <span className="truncate">
                                  {draft.location}
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Right: price + delete */}
                          <div className="shrink-0 text-right flex flex-col items-end gap-1">
                            <span className="text-xs text-gray-400">
                              {cal.filterPrice || "Giá cả"}
                            </span>
                            <p className="text-sm font-bold text-[#990011]">
                              {draft.ticketPrice &&
                              Number(draft.ticketPrice) > 0
                                ? `${Number(draft.ticketPrice).toLocaleString()}đ`
                                : cal.free || "Miễn Phí"}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setShowDeleteDraftConfirm(draft.id)
                              }
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#990011]"
                              title="Xóa bản nháp"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Map section */}
            <div className="mt-4">
              <h2 className="text-lg font-bold text-black mb-4">Bản đồ</h2>
              <MapView
                dayEvents={
                  form.eventLocation && !form.isOnline
                    ? [
                        {
                          id: "preview",
                          title: previewTitle || "Sự kiện được đánh dấu",
                          location: form.eventLocation,
                          isOnline: false,
                        },
                      ]
                    : []
                }
                selectedEvent={
                  form.eventLocation && !form.isOnline
                    ? { id: "preview" }
                    : null
                }
              />
            </div>
          </div>
        </div>
      </form>

      {/* Delete Confirm Modal */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        showCloseButton={false}
        className="!max-w-[480px]"
        bodyClassName="px-6 pb-6 pt-2"
      >
        <div className="flex flex-col items-center text-center gap-3 pt-4">
          {/* Warning icon */}
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-1">
            <AlertTriangle size={40} className="text-yellow-500" />
          </div>

          <h2 className="text-2xl font-bold text-black">
            {cal.confirmDeleteTitle || "Xóa sự kiện?"}
          </h2>

          <p className="text-sm text-gray-500 leading-relaxed">
            {cal.deleteEventWarning ||
              "Nếu bạn xóa sự kiện thì sự kiện vừa rồi phải tạo lại và hành động này không thể hoàn tác lại được. Bạn có chắc không?"}
          </p>

          <div className="flex gap-3 w-full mt-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 h-12 rounded-full border-2 border-[#990011] text-[#990011] font-semibold text-sm hover:bg-[#990011]/5 transition-colors flex items-center justify-center gap-2"
            >
              {cal.cancelDelete || "Hủy xóa"}
              <X size={16} />
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirmed}
              disabled={isDeleting}
              className="flex-1 h-12 rounded-full bg-[#990011] text-white font-semibold text-sm hover:bg-[#7a000e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isDeleting
                ? cal.deleting || "Đang xóa..."
                : cal.confirm || "Xác nhận"}
              {!isDeleting && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Draft Confirm Modal */}
      <Modal
        open={showDeleteDraftConfirm !== null}
        onClose={() => setShowDeleteDraftConfirm(null)}
        showCloseButton={false}
        className="!max-w-[400px]"
        bodyClassName="px-6 pb-6 pt-2"
      >
        <div className="flex flex-col items-center text-center gap-3 pt-4">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-1">
            <AlertTriangle size={32} className="text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-black">
            {cal.deleteDraftTitle || "Xóa bản nháp?"}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            {cal.deleteDraftMsg || "Bản nháp này sẽ bị xóa vĩnh viễn."}
          </p>
          <div className="flex gap-3 w-full mt-2">
            <button
              type="button"
              onClick={() => setShowDeleteDraftConfirm(null)}
              className="flex-1 h-11 rounded-full border-2 border-[#990011] text-[#990011] font-semibold text-sm hover:bg-[#990011]/5 transition-colors"
            >
              {cal.cancel || "Hủy"}
            </button>
            <button
              type="button"
              onClick={() => handleDeleteDraft(showDeleteDraftConfirm)}
              className="flex-1 h-11 rounded-full bg-[#990011] text-white font-semibold text-sm hover:bg-[#7a000e] transition-colors"
            >
              {cal.confirm || "Xác nhận"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Choice Modal (for recurring) */}
      {pendingPayload && (
        <EditChoiceModal
          open={!!pendingPayload}
          onClose={() => setPendingPayload(null)}
          onSelect={(choice) => {
            if (performSaveRef.current) {
              performSaveRef.current(pendingPayload, choice);
            }
            setPendingPayload(null);
          }}
          headerColor={form.eventColor || "#990011"}
        />
      )}

      {/* Success/Error Modal */}
      <Modal
        open={submitStatus !== null}
        onClose={() => {
          if (submitStatus === "success") {
            window.location.href = returnPath;
          } else {
            setSubmitStatus(null);
          }
        }}
        showCloseButton={false}
        className="!max-w-[400px]"
      >
        <div className="flex flex-col items-center justify-center p-6 gap-4 text-center">
          {submitStatus === "success" ? (
            <CheckCircle2 size={64} className="text-[#00BB38]" />
          ) : submitStatus === "validation_error" ? (
            <AlertTriangle size={64} className="text-yellow-500" />
          ) : (
            <XCircle size={64} className="text-[#990011]" />
          )}

          <h2 className="text-xl font-bold text-black mt-2">
            {submitStatus === "success"
              ? isEditing
                ? cal.updateEventSuccess || "Cập nhật sự kiện thành công!"
                : cal.createEventSuccess || "Tạo sự kiện thành công!"
              : submitStatus === "validation_error"
                ? cal.validationErrorTitle || "Kiểm tra lại thông tin"
                : isEditing
                  ? cal.updateEventFailed || "Cập nhật sự kiện thất bại"
                  : cal.createEventFailed || "Tạo sự kiện thất bại"}
          </h2>

          <p className="text-sm text-gray-500">
            {submitStatus === "success"
              ? isEditing
                ? cal.updateEventSuccessMsg ||
                  "Sự kiện của bạn đã được cập nhật thành công."
                : cal.createEventSuccessMsg ||
                  "Sự kiện của bạn đã được tạo thành công."
              : submitStatus === "validation_error"
                ? cal.validationErrorMsg ||
                  "Vui lòng điền đầy đủ và chính xác các thông tin bắt buộc."
                : isEditing
                  ? cal.updateEventFailedMsg ||
                    "Có lỗi xảy ra khi cập nhật sự kiện, vui lòng thử lại."
                  : cal.createEventFailedMsg ||
                    "Có lỗi xảy ra khi tạo sự kiện, vui lòng thử lại."}
          </p>

          <button
            type="button"
            onClick={() => {
              if (submitStatus === "success") {
                window.location.href = returnPath;
              } else {
                setSubmitStatus(null);
              }
            }}
            className="mt-4 px-8 py-2.5 bg-[#990011] text-white rounded-full font-semibold hover:bg-[#7a000e] transition-colors w-full"
          >
            {cal.close || "Đóng"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CreateEventPage;
