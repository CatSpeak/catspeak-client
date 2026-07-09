import { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import {
  useCreateEventMutation,
  useUpdateEventMutation,
  useUpdateEventSeriesMutation,
  useUpdateEventOccurrenceMutation,
} from "@/store/api/eventsApi";
import { mapFormToPayload, objectToFormData } from "../utils/mapFormToPayload";
import { useLanguage } from "@/shared/context/LanguageContext";
import { TIMEZONES } from "../components/ui/TimezoneDropdown";

const DEFAULT_TIMEZONE = {
  id: "Asia/Ho_Chi_Minh",
  label: "Hồ Chí Minh",
  offset: "GMT +07:00",
};

const WEEKDAY_CODES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export const useEventForm = (
  onSuccess,
  editEvent,
  onSubmitInterceptor,
  onError,
  onValidationFail,
) => {
  const { t } = useLanguage();
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  // eslint-disable-next-line no-unused-vars
  const [updateEventSeries, { isLoading: isUpdatingSeries }] =
    useUpdateEventSeriesMutation();
  const [updateEventOccurrence, { isLoading: isUpdatingOccurrence }] =
    useUpdateEventOccurrenceMutation();
  const isLoading =
    isCreating || isUpdating || isUpdatingSeries || isUpdatingOccurrence;

  // Evaluate initial values once
  const initialTitle = editEvent?.title || "";
  const initialDescription = editEvent?.description || "";
  const initialColor = editEvent?.color || "#990011";
  const initialLocation = editEvent?.location || "";
  const initialCountryId = editEvent?.countryId || 0;
  const initialCityId = editEvent?.cityId || 0;
  const initialParticipants = editEvent?.maxParticipants || "";
  const initialVisibility = editEvent?.visibilityScope || "PUBLIC";
  const initialConditions =
    editEvent?.conditions?.map((c) => c.title).join(", ") || "";
  const initialTicketPrice = editEvent?.ticketPrice ?? null;

  const initTzId =
    editEvent?.timezone ||
    editEvent?.recurrenceRule?.timeZone ||
    DEFAULT_TIMEZONE.id;

  const initialStartTime = editEvent?.startTime
    ? dayjs(
        dayjs(editEvent.startTime).tz(initTzId).format("YYYY-MM-DDTHH:mm:ss"),
      )
    : null;
  const initialEndTime = editEvent?.endTime
    ? dayjs(dayjs(editEvent.endTime).tz(initTzId).format("YYYY-MM-DDTHH:mm:ss"))
    : null;

  let initialTimezone = DEFAULT_TIMEZONE;
  const foundTz = TIMEZONES.find((tz) => tz.id === initTzId);
  if (foundTz) {
    initialTimezone = foundTz;
  } else if (initTzId) {
    initialTimezone = { id: initTzId, label: initTzId, offset: "" };
  }

  let initialRecurOption = "NONE";
  let initialRecurInterval = 1;
  let initialSelectedDays = [1, 4]; // default Tuesday, Friday
  let initialRecurEndDate = dayjs().add(1, "month").toDate();
  let initialRecurrenceEndType = "DATE";
  let initialOccurrenceCount = 10;

  if (editEvent?.isRecurring && editEvent?.recurrenceRule) {
    const rr = editEvent.recurrenceRule;
    initialRecurOption = rr.frequency || "CUSTOM";
    initialRecurInterval = rr.interval || 1;
    if (rr.byWeekDay && rr.byWeekDay.length > 0) {
      initialSelectedDays = rr.byWeekDay
        .map((d) => WEEKDAY_CODES.indexOf(d))
        .filter((idx) => idx !== -1);
      if (rr.frequency === "WEEKLY" && initialSelectedDays.length === 0) {
        initialSelectedDays = [1, 4];
      }
    }
    initialRecurEndDate = rr.recurrenceEndDate
      ? dayjs(
          dayjs(rr.recurrenceEndDate)
            .tz(initTzId)
            .format("YYYY-MM-DDTHH:mm:ss"),
        ).toDate()
      : dayjs().add(1, "month").toDate();

    if (rr.endCondition === "OCCURRENCE_COUNT") {
      initialRecurrenceEndType = "COUNT";
      initialOccurrenceCount = rr.occurrenceCount || 10;
    }
  }

  // Basic fields
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [eventColor, setEventColor] = useState(initialColor);
  const [eventLocation, setEventLocation] = useState(initialLocation);
  const [countryId, setCountryId] = useState(initialCountryId);
  const [cityId, setCityId] = useState(initialCityId);
  const [isOnline, setIsOnline] = useState(editEvent?.isOnline ?? null);
  const [maxParticipants, setMaxParticipantsState] =
    useState(initialParticipants);

  const setMaxParticipants = (val) => {
    if (val === "") {
      setMaxParticipantsState("");
      return;
    }
    const num = Number(val);
    if (!isNaN(num)) {
      if (num > 20) setMaxParticipantsState(20);
      else if (num < 1) setMaxParticipantsState(1);
      else setMaxParticipantsState(num);
    }
  };

  const [visibility, setVisibility] = useState(initialVisibility);
  const [conditionsInput, setConditionsInput] = useState(initialConditions);
  const [ticketPrice, setTicketPrice] = useState(initialTicketPrice);

  // Date / time
  const [startTime, setStartTimeState] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);

  const setStartTime = (newStartTime) => {
    const startObj = startTime ? dayjs(startTime) : null;
    const endObj = endTime ? dayjs(endTime) : null;
    const recurEndObj = recurrenceEndDate ? dayjs(recurrenceEndDate) : null;
    const newStartObj = dayjs(newStartTime);

    setStartTimeState(newStartTime);

    if (startObj) {
      const diffMs = newStartObj.diff(startObj);
      if (diffMs !== 0) {
        if (endObj) setEndTime(endObj.add(diffMs, "ms").toDate());
        if (recurEndObj)
          setRecurrenceEndDate(recurEndObj.add(diffMs, "ms").toDate());
      }
    }
  };

  // Recurrence
  const [recurrenceOption, setRecurrenceOption] = useState(initialRecurOption);
  const [recurrenceInterval, setRecurrenceInterval] =
    useState(initialRecurInterval);
  const [selectedDays, setSelectedDays] = useState(initialSelectedDays);
  const [recurrenceEndDate, setRecurrenceEndDate] =
    useState(initialRecurEndDate);
  const [recurrenceEndType, setRecurrenceEndType] = useState(
    initialRecurrenceEndType,
  );

  const [occurrenceCount, setOccurrenceCountState] = useState(
    initialOccurrenceCount,
  );
  const setOccurrenceCount = (val) => {
    if (val === "") {
      setOccurrenceCountState("");
      return;
    }
    const num = Number(val);
    if (!isNaN(num)) {
      if (num > 24) setOccurrenceCountState(24);
      else if (num < 1) setOccurrenceCountState(1);
      else setOccurrenceCountState(num);
    }
  };

  const [selectedTimezone, setSelectedTimezone] = useState(initialTimezone);

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    console.log("Submit clicked");
    e?.preventDefault();
    console.log({
      title,
      description,
      countryId,
      cityId,
      eventLocation,
      maxParticipants,
      startTime,
      endTime,
    });
    const newErrors = {};
    if (!title.trim())
      newErrors.title =
        t.validation?.calendar?.titleRequired || "Thiếu tiêu đề";
    if (!countryId)
      newErrors.countryId =
        t.validation?.calendar?.countryRequired || "Đất nước là bắt buộc";
    if (!cityId)
      newErrors.cityId =
        t.validation?.calendar?.cityRequired || "Thành phố là bắt buộc";
    if (!eventLocation.trim())
      newErrors.eventLocation =
        t.validation?.calendar?.locationRequired || "Địa điểm là bắt buộc";
    // if (!description.trim())
    //   newErrors.description =
    //     t.validation?.calendar?.descriptionRequired || "Mô tả là bắt buộc";
    if (!maxParticipants || Number(maxParticipants) <= 0) {
      newErrors.maxParticipants =
        t.validation?.calendar?.maxParticipantsRequired ||
        "Số lượng cần lớn hơn 0";
    }

    if (!startTime) newErrors.startTime = "Vui lòng chọn thời gian bắt đầu";
    if (!endTime) newErrors.endTime = "Vui lòng chọn thời gian kết thúc";
    if (startTime && endTime) {
      if (
        dayjs(endTime).isBefore(dayjs(startTime)) ||
        dayjs(endTime).isSame(dayjs(startTime))
      ) {
        newErrors.endTime =
          t.calendar?.endTimeBeforeStartTime ||
          "Thời gian kết thúc phải sau thời gian bắt đầu";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      console.log(newErrors);

      setErrors(newErrors);
      if (onValidationFail) onValidationFail(newErrors);
      return;
    }
    setErrors({});
    const payload = mapFormToPayload({
      title,
      description,
      eventLocation,
      countryId,
      cityId,
      eventColor,
      isOnline,
      maxParticipants,
      visibility,
      startTime,
      endTime,
      recurrenceOption,
      recurrenceInterval,
      selectedDays,
      recurrenceEndDate,
      recurrenceEndType,
      occurrenceCount,
      selectedTimezone,
      conditionsInput,
      ticketPrice,
      originalStartTime: editEvent?.startTime,
      originalEndTime: editEvent?.endTime,
    });

    console.log(
      "=== CREATING/UPDATING EVENT PAYLOAD ===",
      JSON.stringify(payload, null, 2),
    );

    if (onSubmitInterceptor) {
      onSubmitInterceptor(payload, performSave);
      return;
    }

    await performSave(payload, "series");
  };

  const performSave = async (payload, choice = "series") => {
    try {
      // Prioritize eventId because editEvent.id is often the occurrence ID
      const parentId = editEvent?.eventId || editEvent?.id;

      if (parentId) {
        if (
          editEvent.isRecurring &&
          editEvent.occurrenceId &&
          choice === "occurrence"
        ) {
          await updateEventOccurrence({
            eventId: editEvent.eventId || parentId,
            occurrenceId: editEvent.occurrenceId,
            ...payload,
          }).unwrap();
        } else {
          const finalFormData = objectToFormData(payload);
          if (thumbnailFile) {
            finalFormData.append("Thumbnail", thumbnailFile);
          }
          await updateEvent({
            eventId: parentId,
            payload: finalFormData,
          }).unwrap();
        }
      } else {
        const finalFormData = objectToFormData(payload);
        if (thumbnailFile) {
          finalFormData.append("Thumbnail", thumbnailFile);
        }
        await createEvent(finalFormData).unwrap();
      }
      onSuccess();
    } catch (err) {
      console.error("Failed to save event:", err);
      if (onError) onError(err);
    }
  };

  return {
    // state
    thumbnailFile,
    setThumbnailFile,
    title,
    setTitle,
    description,
    setDescription,
    eventColor,
    setEventColor,
    eventLocation,
    setEventLocation,
    countryId,
    setCountryId,
    cityId,
    setCityId,
    isOnline,
    setIsOnline,
    maxParticipants,
    setMaxParticipants,
    visibility,
    setVisibility,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    recurrenceOption,
    setRecurrenceOption,
    recurrenceInterval,
    setRecurrenceInterval,
    selectedDays,
    setSelectedDays,
    recurrenceEndDate,
    setRecurrenceEndDate,
    recurrenceEndType,
    setRecurrenceEndType,
    occurrenceCount,
    setOccurrenceCount,
    selectedTimezone,
    setSelectedTimezone,
    conditionsInput,
    setConditionsInput,
    ticketPrice,
    setTicketPrice,
    errors,
    setErrors,
    // submission
    handleSubmit,
    isLoading,
  };
};
