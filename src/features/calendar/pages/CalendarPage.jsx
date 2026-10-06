import React, { useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useGetEventCountsQuery } from "@/store/api/eventsApi";
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb";
import FilterModal from "../components/FilterModal";
import DaySchedule from "../components/DaySchedule";
import CalendarPageHeader from "../components/CalendarPageHeader";
import CalendarFilterChips from "../components/CalendarFilterChips";
import CalendarMonthPanel from "../components/CalendarMonthPanel.jsx";
import EventDetailModal from "../components/EventDetailModal/index";
import MapView from "../components/Mapview";
import MapFocusContext from "../context/MapFocusContext";
import { geocodeAddress } from "@/shared/utils/geocode";
import {
  buildAddressQuery,
  googleMapsSearchUrl,
  isUrl,
  openInNewTab,
} from "@/shared/utils/locationLink";
import { WorkshopCarousel } from "@/features/workshops";
import {
  CreateRoomModal,
  JoinRoomModal,
  AISessionSettingsModal,
  useRoomsPageLogic,
} from "@/features/rooms";
import { useCreateAISessionMutation } from "@/store/api/roomsApi";
import { leaveCall } from "@/store/slices/videoCallSlice";
import { selectIsAuthenticated } from "@/store/slices/authSlice";
import { useAuthModal } from "@/shared/context/AuthModalContext";
import SwitchCallModal from "@/features/video-call/components/SwitchCallModal";
import {
  pingActiveCall,
  requestLeaveActiveCall,
} from "@/features/video-call/services/callBroadcastChannel";
import { HeaderImage } from "../assets";
import WorkshopCoverflowCarousel from "@/features/workshops/components/WorkshopCoverflowCarousel";

const CalendarPage = () => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const cal = t.calendar || {};
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { openAuthModal } = useAuthModal();
  const { isInCall } = useSelector((s) => s.videoCall);
  const { state, actions } = useRoomsPageLogic();
  const [createAISession] = useCreateAISessionMutation();
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const eventIdFromUrl = searchParams.get("eventId");
  const occurrenceIdFromUrl = searchParams.get("occurrenceId");
  const tokenFromUrl = searchParams.get("token");

  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [viewType, setViewType] = useState("month");

  const [dayEvents, setDayEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mapFocusLocation, setMapFocusLocation] = useState(null);
  const mapSectionRef = useRef(null);

  const closeDetail = useCallback(() => {
    setSelectedEvent(null);
    if (
      searchParams.has("eventId") ||
      searchParams.has("occurrenceId") ||
      searchParams.has("token")
    ) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("eventId");
      newParams.delete("occurrenceId");
      newParams.delete("token");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const focusEventOnMap = useCallback(
    async (event) => {
      if (!event) return;
      const location = (event.location || "").trim();

      // A pasted URL is an external link, not something to geocode.
      if (isUrl(location)) {
        openInNewTab(location);
        return;
      }

      const address = buildAddressQuery(event);
      if (!address) return;

      let coords = null;
      try {
        coords = await geocodeAddress(address);
      } catch (error) {
        console.error("Geocode failed:", error);
      }

      if (!coords) {
        toast.error(
          cal.mapLocationNotFound ||
            "Không tìm thấy địa chỉ trên bản đồ. Đang mở Google Maps.",
        );
        openInNewTab(googleMapsSearchUrl(address));
        return;
      }

      // Close the detail popup, then pin + flyTo on the map.
      closeDetail();
      setMapFocusLocation({
        id: event.id ?? event.eventId ?? event.occurrenceId,
        lat: coords.lat,
        lng: coords.lng,
        title: event.title,
        address,
      });
      requestAnimationFrame(() => {
        mapSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    },
    [cal.mapLocationNotFound, closeDetail],
  );

  const handleEventSelect = useCallback((ev) => {
    // A normal selection takes over the map focus, so drop any address focus.
    setMapFocusLocation(null);
    setSelectedEvent(ev);
  }, []);

  const basePath = lang ? `/${lang}/cat-speak/calendar` : "/cat-speak/calendar";

  const breadcrumbItems = [
    { label: t.navigation?.home || "Trang chủ", onClick: () => navigate("/") },
    { label: "Cat Speak", onClick: () => navigate(basePath) },
    { label: cal.schedule || "Thời gian biểu" },
  ];

  const handleNextMonth = () => {
    if (viewType === "week") {
      const nextWeek = currentDate
        .date(Math.min(selectedDate, currentDate.daysInMonth()))
        .add(1, "week");
      setCurrentDate(nextWeek);
      setSelectedDate(nextWeek.date());
    } else {
      setCurrentDate((d) => d.add(1, "month"));
    }
  };

  const handlePrevMonth = () => {
    if (viewType === "week") {
      const prevWeek = currentDate
        .date(Math.min(selectedDate, currentDate.daysInMonth()))
        .subtract(1, "week");
      setCurrentDate(prevWeek);
      setSelectedDate(prevWeek.date());
    } else {
      setCurrentDate((d) => d.subtract(1, "month"));
    }
  };

  const { data: eventCountsData } = useGetEventCountsQuery({
    startDate: currentDate.startOf("month").toISOString(),
    endDate: currentDate.endOf("month").toISOString(),
    community: lang,
  });

  const eventCountsByDay = useMemo(() => {
    if (!eventCountsData?.counts) return {};

    const displayMonth = currentDate.month(); // 0-indexed (0 = January)
    const displayYear = currentDate.year();

    return eventCountsData.counts.reduce((acc, item) => {
      const d = dayjs(item.date); // parse as local "YYYY-MM-DD"
      if (d.month() !== displayMonth || d.year() !== displayYear) return acc;

      const day = d.date();
      acc[day] = (acc[day] ?? 0) + item.totalEvents;
      return acc;
    }, {});
  }, [eventCountsData, currentDate]);

  // Active filter chips
  const filterChips = [];

  if (activeFilters.eventType) {
    filterChips.push({
      key: "eventType",
      label: activeFilters.eventType === "online" ? "Online" : "Offline",
    });
  }

  if (activeFilters.startTime || activeFilters.endTime) {
    let label = "";

    if (activeFilters.startTime && activeFilters.endTime) {
      label = `${activeFilters.startTime} - ${activeFilters.endTime}`;
    } else if (activeFilters.startTime) {
      label = `${cal.from} ${activeFilters.startTime}`;
    } else {
      label = `${cal.to} ${activeFilters.endTime}`;
    }

    filterChips.push({
      key: "timeRange",
      label,
    });
  }

  if (activeFilters.priceMin != null || activeFilters.priceMax != null) {
    const min = activeFilters.priceMin ?? 0;
    const max = activeFilters.priceMax ?? 1000000;
    const fmt = (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v));
    filterChips.push({
      key: "priceRange",
      label: `${cal.filterPrice || "Giá"}: ${fmt(min)} - ${fmt(max)}`,
    });
  }

  const removeFilter = (key) => {
    setActiveFilters((prev) => {
      const next = { ...prev };

      if (key === "timeRange") {
        delete next.startTime;
        delete next.endTime;
      } else if (key === "priceRange") {
        delete next.priceMin;
        delete next.priceMax;
      } else {
        delete next[key];
      }

      return next;
    });
  };

  const monthNum = currentDate.format("M");
  const yearNum = currentDate.format("YYYY");

  let localizedMonth = `${cal.month || "THÁNG"} ${monthNum} ${yearNum}`;
  if (language === "en") {
    localizedMonth = `${currentDate.locale("en").format("MMMM")} ${yearNum}`;
  } else if (language === "zh") {
    localizedMonth = `${yearNum}年 ${monthNum}月`;
  }

  const checkAndIntercept = async (action) => {
    const remoteActive = await pingActiveCall();
    if (isInCall || remoteActive) {
      setPendingAction(() => action);
      setShowSwitchModal(true);
      return true;
    }
    return false;
  };

  const handleConfirmSwitch = async () => {
    setShowSwitchModal(false);
    requestLeaveActiveCall();
    if (isInCall) {
      dispatch(leaveCall());
    }

    if (typeof pendingAction === "function") {
      pendingAction();
    }
    setPendingAction(null);
  };

  const handleCancelSwitch = () => {
    setShowSwitchModal(false);
    setPendingAction(null);
  };

  const handleCreateEvent = () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    navigate(`${basePath}/create`, {
      state: { from: basePath, fromCommunityCalendar: true },
    });
  };

  const handleCreateAI = async (settings) => {
    actions.closeAISettingsModal();
    const action = () => {
      actions.handleCreateAISession(async () => {
        try {
          const result = await createAISession(settings).unwrap();
          navigate(`/${lang}/meet/${result.roomId}`, {
            state: { fromQueue: true, isAISession: true },
          });
        } catch (err) {
          console.error("Failed to create AI session", err);
        }
      });
    };
    if (await checkAndIntercept(action)) return;
    action();
  };

  const mapFocusValue = useMemo(
    () => ({ hasMap: true, focusEventOnMap }),
    [focusEventOnMap],
  );

  return (
    <MapFocusContext.Provider value={mapFocusValue}>
    <div className="w-full flex flex-col gap-4 overflow-hidden bg-primaryBg min-h-screen">
      <div className="px-6 pt-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="w-full px-4 sm:px-6 md:px-0 flex justify-center py-4">
        <div className="w-full ">
          <WorkshopCoverflowCarousel />
        </div>
      </div>
      {/* <div className="relative w-full overflow-hidden aspect-[16/5] bg-white">
        <img
          src={HeaderImage}
          alt="Calendar Banner"
          className="w-full h-full object-cover object-center"
        />
      </div> */}

      <div className="px-6 pt-5 pb-8">
        <CalendarPageHeader
          title={cal.schedule || "Danh sách sự kiện"}
          createLabel={cal.createEvent || "Tạo sự kiện"}
          onCreateEvent={handleCreateEvent}
          onOpenFilters={() => setIsFilterOpen(true)}
        />

        {/* Active filter chips */}
        <CalendarFilterChips chips={filterChips} onRemove={removeFilter} />

        {/* Calendar + Schedule grid */}
        <div className="flex flex-col lg:flex-row gap-6 mt-10 lg:items-stretch">
          {/* LEFT: Calendar */}
          <div className="w-full lg:w-1/2 flex-shrink-0">
            <CalendarMonthPanel
              currentDate={currentDate}
              selectedDate={selectedDate}
              eventCountsByDay={eventCountsByDay}
              localizedMonth={localizedMonth}
              todayLegend={cal.todayLegend || "Ngày hôm nay"}
              selectedDayLegend={cal.selectedDayLegend || "Ngày được chọn"}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setSelectedEvent(null);
                setMapFocusLocation(null);
              }}
              viewType={viewType}
              onChangeView={setViewType}
            />
          </div>

          {/* RIGHT: Day Schedule */}
          <div className="w-full lg:w-1/2 relative flex flex-col min-h-[400px] lg:min-h-0">
            <div className="lg:absolute lg:inset-0 w-full h-full flex flex-col">
              <DaySchedule
                selectedDate={selectedDate}
                currentDate={currentDate}
                activeFilters={activeFilters}
                selectedEvent={selectedEvent}
                onEventSelect={handleEventSelect}
                onEventsUpdate={setDayEvents}
                eventCountsByDay={eventCountsByDay}
                totalUniqueEvents={eventCountsData?.totalUniqueEvents || 0}
                totalUniqueRegisteredEvents={
                  eventCountsData?.totalUniqueRegisteredEvents || 0
                }
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setSelectedEvent(null);
                  setMapFocusLocation(null);
                }}
              />
            </div>
          </div>
        </div>

        {/* FULL WIDTH MAP */}
        <div
          ref={mapSectionRef}
          className="relative z-0 rounded-3xl overflow-hidden bg-white p-3 shadow-sm w-full  mt-6"
        >
          <MapView
            dayEvents={dayEvents}
            selectedEvent={selectedEvent}
            focusLocation={mapFocusLocation}
          />
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(filters) => setActiveFilters(filters)}
        initialFilters={activeFilters}
      />

      <SwitchCallModal
        open={showSwitchModal}
        onCancel={handleCancelSwitch}
        onConfirm={handleConfirmSwitch}
      />
      <CreateRoomModal
        open={state.isCreateRoomModalOpen}
        initialMode={state.createRoomMode}
        onCancel={actions.closeCreateRoomModal}
      />
      <JoinRoomModal
        open={state.isJoinRoomModalOpen}
        onCancel={actions.closeJoinRoomModal}
      />
      <AISessionSettingsModal
        open={state.isSettingsModalOpen}
        urlLang={lang}
        onConfirm={handleCreateAI}
        onCancel={actions.closeAISettingsModal}
      />

      {/* Event Detail Modal (from URL params) */}
      {(eventIdFromUrl || occurrenceIdFromUrl) && (
        <EventDetailModal
          event={{
            eventId: eventIdFromUrl || undefined,
            occurrenceId: occurrenceIdFromUrl || undefined,
            token: tokenFromUrl || undefined,
          }}
          onClose={closeDetail}
        />
      )}
    </div>
    </MapFocusContext.Provider>
  );
};

export default CalendarPage;
