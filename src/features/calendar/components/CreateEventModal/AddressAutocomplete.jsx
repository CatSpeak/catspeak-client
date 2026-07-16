import React, { useState, useRef } from "react";
import TextInput from "@/shared/components/ui/inputs/TextInput";
import { MapPin, Loader2 } from "lucide-react";
import useClickOutside from "@/shared/hooks/useClickOutside";
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation";
import { autocompleteAddress } from "@/shared/utils/autocompleteAddress";

const AddressAutocomplete = ({
  value,
  onChange,
  placeholder,
  eventColor,
  error,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useClickOutside(containerRef, () => {
    setIsOpen(false);
  });

  const handleInputChange = (e) => {
    const text = e.target.value;
    onChange(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await autocompleteAddress(text);
        setSuggestions(results);
      } catch (err) {
        console.error("Cannot fetch autocomplete:", err);
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  const handleSelect = (feature) => {
    const addressName =
      feature.properties.address_line1 ||
      feature.properties.street ||
      feature.properties.name ||
      "";

    onChange(addressName);

    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <TextInput
        value={value || ""}
        onChange={handleInputChange}
        placeholder={placeholder}
        variant="square"
        color={eventColor}
        containerClassName="w-full"
        error={error}
        rightContent={
          isLoading && (
            <Loader2 size={16} className="animate-spin text-gray-400" />
          )
        }
      />

      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 w-full z-50 mt-2">
          <FluentAnimation
            direction="down"
            className="shadow-lg border border-[#E5E5E5] rounded-2xl bg-white max-h-60 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-sm text-center text-gray-500">
                Đang tìm kiếm...
              </div>
            ) : suggestions.length > 0 ? (
              <ul className="flex flex-col py-1">
                {suggestions.map((feature, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => handleSelect(feature)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
                    >
                      <MapPin
                        size={16}
                        className="shrink-0 mt-0.5 text-gray-400"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-black">
                          {feature.properties.address_line1 ||
                            feature.properties.name ||
                            feature.properties.city}
                        </span>
                        {feature.properties.address_line2 && (
                          <span className="text-xs text-gray-500 mt-0.5">
                            {feature.properties.address_line2}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </FluentAnimation>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
