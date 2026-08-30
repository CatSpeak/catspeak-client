import React from "react";

const MobileLanguageItem = ({
  code,
  label,
  flag,
  disabled,
  onSelect,
  soonLabel,
  isActive,
}) => {
  return (
    <button
      disabled={disabled}
      onClick={disabled ? undefined : () => onSelect(code)}
      className={`flex items-center w-full px-3 h-10 text-sm rounded-[5px] text-left transition-colors ${
        disabled
          ? "cursor-default hover:bg-[#F2F2F2]"
          : isActive
            ? "bg-[#F2F2F2] text-cath-red-700 hover:bg-[#E6E6E6]"
            : "hover:bg-[#F2F2F2]"
      }`}
    >
      <div className="flex-shrink-0 min-w-[32px]">
        <img
          src={flag}
          alt={label}
          className={`w-5 h-5 rounded-full object-cover ${
            disabled ? "grayscale" : ""
          }`}
        />
      </div>

      <span className="flex-grow text-sm">{label}</span>

      {disabled && (
        <span className="text-xs px-2 py-1 border rounded-full whitespace-nowrap">
          {soonLabel}
        </span>
      )}
    </button>
  );
};

export default MobileLanguageItem;
