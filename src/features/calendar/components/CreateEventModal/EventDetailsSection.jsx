import TextInput from "@/shared/components/ui/inputs/TextInput";
import Dropdown from "@/shared/components/ui/Dropdown";
import AddressAutocomplete from "./AddressAutocomplete";
import { useLanguage } from "@/shared/context/LanguageContext";
import {
  useGetCountriesQuery,
  useGetCitiesByCountryIdQuery,
} from "@/store/api/locationsApi";

const EventDetailsSection = ({
  title,
  onTitleChange,
  eventColor,
  countryId,
  onCountryIdChange,
  cityId,
  onCityIdChange,
  eventLocation,
  onLocationChange,
  maxParticipants,
  onMaxParticipantsChange,
  conditionsInput,
  onConditionsChange,
  ticketPrice,
  onTicketPriceChange,
  isOnline,
  errors = {},
}) => {
  const { t } = useLanguage();
  const cal = t.calendar;

  const { data: countries = [], isLoading: isCountriesLoading } =
    useGetCountriesQuery();
  const {
    data: cities = [],
    isFetching: isCitiesFetching,
    error: citiesError,
  } = useGetCitiesByCountryIdQuery(countryId, {
    skip: !countryId,
  });

  const countryOptions = countries.map((c) => ({ label: c.name, value: c.id }));
  const cityOptions = cities.map((c) => ({ label: c.name, value: c.id }));

  let cityPlaceholder = cal.selectCityProvince;
  if (!countryId) cityPlaceholder = cal.selectCountryFirst;
  else if (isCitiesFetching) cityPlaceholder = cal.loadingLocations;
  else if (citiesError) cityPlaceholder = cal.errorLoadingCities;
  else if (cityOptions.length === 0) cityPlaceholder = cal.noCitiesFound;

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex items-start max-[425px]:flex-col max-[425px]:gap-1">
        <div className="w-[150px] shrink-0 pt-[10px] max-[425px]:pt-0 max-[425px]:w-full">
          {cal.eventName}
        </div>
        <div className="flex-1 flex flex-col w-full">
          <TextInput
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={cal.eventNamePlaceholder}
            variant="square"
            color={eventColor}
            containerClassName="w-full"
            error={errors.title}
          />
        </div>
      </div>

      {/* Location (Country, City, Address) */}
      {!isOnline && (
        <div className="flex items-start max-[425px]:flex-col max-[425px]:gap-1">
          <div className="w-[150px] shrink-0 pt-[10px] max-[425px]:pt-0 max-[425px]:w-full">
            {cal.location}
          </div>
          <div className="flex-1 flex flex-col gap-6 w-full relative min-w-0">
            <div className="flex flex-col min-[426px]:flex-row items-start gap-6 w-full">
              <div className="flex-1 flex flex-col w-full min-w-0">
                <Dropdown
                  options={countryOptions}
                  value={countryId}
                  onChange={(val) => onCountryIdChange(val)}
                  placeholder={
                    isCountriesLoading
                      ? cal.loadingLocations
                      : cal.selectCountry
                  }
                  disabled={isCountriesLoading}
                  activeColor={eventColor}
                  className="w-full"
                  triggerClassName={`border ${errors.countryId ? "border-red-500" : "border-[#C6C6C6]"}`}
                  enableSearch
                />
                {errors.countryId && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.countryId}
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col w-full min-w-0">
                <Dropdown
                  options={cityOptions}
                  value={cityId}
                  onChange={(val) => onCityIdChange(val)}
                  placeholder={cityPlaceholder}
                  disabled={
                    !countryId || isCitiesFetching || cityOptions.length === 0
                  }
                  activeColor={eventColor}
                  className="w-full"
                  triggerClassName={`border ${errors.cityId ? "border-red-500" : "border-[#C6C6C6]"}`}
                  enableSearch
                />
                {errors.cityId && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.cityId}
                  </span>
                )}
              </div>
            </div>
            {/* Address */}
            <div className="flex flex-col w-full">
              <AddressAutocomplete
                value={eventLocation}
                onChange={(val) => onLocationChange(val)}
                placeholder={cal.locationPlaceholder}
                eventColor={eventColor}
                error={errors.eventLocation}
              />
              {/* {eventLocation.trim() && (
                <button
                  type="button"
                  onClick={handleOpenMaps}
                  className="text-sm mt-1.5 self-start hover:opacity-80 transition-opacity font-medium"
                  style={{ color: eventColor }}
                >
                  {cal.openMaps}
                </button>
              )} */}
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {/* <div className="flex items-start max-[425px]:flex-col max-[425px]:gap-1">
        <div className="w-[150px] shrink-0 pt-[10px] max-[425px]:pt-0 max-[425px]:w-full">
          {cal.description}
        </div>
        <div className="flex-1 flex flex-col w-full">
          <TextInput
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={cal.descriptionPlaceholder}
            variant="square"
            color={eventColor}
            containerClassName="w-full"
            error={errors.description}
          />
        </div>
      </div> */}

      {/* Max participants */}
      <div className="flex items-start max-[425px]:flex-col max-[425px]:gap-1">
        <div className="w-[150px] shrink-0 pt-[10px] max-[425px]:pt-0 max-[425px]:w-full">
          {cal.maxParticipants}
        </div>
        <div className="flex items-start w-full min-w-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <TextInput
                type="text"
                inputMode="numeric"
                value={maxParticipants}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d+$/.test(val)) {
                    onMaxParticipantsChange(val);
                    if (errors.maxParticipants)
                      onMaxParticipantsChange(val);
                  }
                }}
                onBlur={(e) => {
                  const val = e.target.value;
                  if (val !== "" && !/^\d+$/.test(val)) {
                    onMaxParticipantsChange("");
                  }
                }}
                variant="square"
                color={eventColor}
                placeholder={cal.maxParticipantsPlaceholder || "0"}
                className="text-center !px-2"
                containerClassName="w-24"
                error={errors.maxParticipants}
              />
              <span className="text-[#606060] mt-[10px]">{cal.guest}</span>
            </div>

          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="flex items-start max-[425px]:flex-col max-[425px]:gap-1">
        <div className="w-[150px] shrink-0 pt-[10px] max-[425px]:pt-0 max-[425px]:w-full">
          {cal.conditions}
        </div>
        <div className="flex-1 flex flex-col gap-1 w-full relative">
          <TextInput
            value={conditionsInput}
            onChange={(e) => onConditionsChange(e.target.value)}
            placeholder={cal.conditionsPlaceholder}
            variant="square"
            color={eventColor}
            containerClassName="w-full"
          />
          {conditionsInput.trim() && (
            <div className="flex flex-wrap gap-1 mt-1">
              {conditionsInput
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                    style={{ backgroundColor: eventColor }}
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Ticket price */}
      <div className="flex items-start max-[425px]:flex-col max-[425px]:gap-1">
        <div className="w-[150px] shrink-0 max-[425px]:w-full pt-[10px] max-[425px]:pt-0">
          {cal.ticketPrice}
        </div>
        <div className="flex flex-col w-full min-w-0">
          <div className="flex items-center gap-3">
            <TextInput
              type="text"
              inputMode="numeric"
              value={ticketPrice ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d+$/.test(val)) {
                  onTicketPriceChange(val === "" ? null : Number(val));
                }
              }}
              variant="square"
              color={eventColor}
              placeholder={"0"}
              className="text-center !px-2"
              containerClassName="w-24"
            />
            <span className="text-[#606060] text-sm">
              {ticketPrice == null || ticketPrice === 0
                ? `(${cal.free || "Miễn phí"})`
                : "k"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsSection;
