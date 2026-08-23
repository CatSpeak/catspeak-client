import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, UserPlus, Users, Check } from "lucide-react";
import { X } from "lucide-react";
import { TextInput } from "@/shared/components/ui/inputs";
import { toast } from "react-hot-toast";
import { IconButton, PillButton } from "@/shared/components/ui/buttons";
import Avatar from "@/shared/components/ui/Avatar";

const LearnerSection = ({
  learners,
  onAddLearner,
  onRemoveLearner,
  friendsList = [],
  t,
}) => {
  const tc = t.billing.checkoutClass;
  const [emailInput, setEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState(new Set());
  const [isAddingFriends, setIsAddingFriends] = useState(false);
  const dropdownRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // IDs already in the learner list
  const learnerIds = useMemo(
    () => new Set(learners.map((l) => String(l.id))),
    [learners]
  );

  // Filter friends by keyword (min 3 chars), exclude already added learners
  const suggestedFriends = useMemo(() => {
    const keyword = emailInput.trim().toLowerCase();
    if (keyword.length < 3) return [];
    return (friendsList || []).filter((friend) => {
      const id = String(friend.accountId || friend.id || "");
      if (learnerIds.has(id)) return false;
      const name = (
        friend.fullName ||
        friend.name ||
        friend.username ||
        ""
      ).toLowerCase();
      const email = (friend.email || "").toLowerCase();
      return name.includes(keyword) || email.includes(keyword);
    });
  }, [emailInput, friendsList, learnerIds]);

  // Show/hide dropdown based on suggestions
  useEffect(() => {
    if (suggestedFriends.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSelectedFriendIds(new Set());
    }
  }, [suggestedFriends.length]);

  const handleEmailAdd = async (e) => {
    e?.preventDefault();
    const email = emailInput.trim();
    if (!email || isLoading) return;
    setIsLoading(true);
    try {
      const res = await onAddLearner(email);
      if (res?.success) {
        setEmailInput("");
        setShowSuggestions(false);
      } else {
        toast.error(res?.message || tc.addLearnerError);
      }
    } catch (error) {
      console.error("Add learner failed:", error);
      toast.error(tc.addLearnerError);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFriend = (friend) => {
    const id = String(friend.accountId || friend.id || "");
    setSelectedFriendIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddSelectedFriends = async () => {
    if (selectedFriendIds.size === 0 || isAddingFriends) return;
    setIsAddingFriends(true);
    const toAdd = suggestedFriends.filter((f) =>
      selectedFriendIds.has(String(f.accountId || f.id || ""))
    );
    let successCount = 0;
    for (const friend of toAdd) {
      const email = friend.email;
      if (!email) continue;
      try {
        const res = await onAddLearner(email);
        if (res?.success) {
          successCount++;
        } else {
          toast.error(
            `${friend.fullName || friend.name || email}: ${res?.message || tc.addLearnerError}`
          );
        }
      } catch {
        toast.error(tc.addLearnerError);
      }
    }
    if (successCount > 0) {
      setEmailInput("");
      setShowSuggestions(false);
      setSelectedFriendIds(new Set());
    }
    setIsAddingFriends(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-faq-card border border-border p-6 space-y-4">
      <h2 className="text-xl font-bold text-[#111827]">{tc.addLearner}</h2>

      {/* Search input with suggestions dropdown */}
      <div className="relative" ref={wrapperRef}>
        <TextInput
          icon={Search}
          containerClassName="w-full"
          placeholder={tc.emailPlaceholder}
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !showSuggestions) handleEmailAdd(e);
          }}
          onFocus={() => {
            if (suggestedFriends.length > 0) setShowSuggestions(true);
          }}
        />

        {/* Friend suggestions dropdown */}
        {showSuggestions && suggestedFriends.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-gray-50/80">
              <Users size={13} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {tc.friendSuggestions || "Gợi ý từ bạn bè"}
              </span>
            </div>

            {/* Friend list */}
            <div className="max-h-56 overflow-y-auto" ref={dropdownRef}>
              {suggestedFriends.map((friend) => {
                const id = String(friend.accountId || friend.id || "");
                const isChecked = selectedFriendIds.has(id);
                return (
                  <div
                    key={id}
                    role="button"
                    tabIndex={0}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-border/50 last:border-0 cursor-pointer select-none"
                    onClick={() => toggleFriend(friend)}
                    onKeyDown={(e) => e.key === "Enter" && toggleFriend(friend)}
                  >
                    {/* Custom checkbox */}
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                        isChecked
                          ? "bg-[#B20000] border-[#B20000]"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {isChecked && (
                        <Check size={11} className="text-white" strokeWidth={3} />
                      )}
                    </div>

                    <Avatar
                      name={friend.fullName || friend.name || friend.username}
                      size="sm"
                      src={friend.avatarImageUrl}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111827] truncate">
                        {friend.fullName || friend.name || friend.username}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {friend.email}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer with count + Add button */}
            <div className="px-4 py-3 border-t border-border bg-gray-50/80 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                {selectedFriendIds.size > 0
                  ? (tc.selectedFriendsCount || "Đã chọn {{count}} người").replace(
                      "{{count}}",
                      selectedFriendIds.size
                    )
                  : tc.selectFriendsHint || "Chọn người bạn muốn thêm"}
              </span>
              <PillButton
                roundedClass="rounded-lg"
                className="!min-w-20 text-sm"
                bgColor="#B20000"
                onClick={handleAddSelectedFriends}
                loading={isAddingFriends}
                loadingText={tc.adding}
                disabled={selectedFriendIds.size === 0 || isAddingFriends}
              >
                <UserPlus size={14} className="mr-1.5" />
                {tc.addSelected || "Thêm"}
              </PillButton>
            </div>
          </div>
        )}
      </div>

      {/* Learner list */}
      <div>
        {learners.map((learner) => (
          <div
            key={learner.id || learner.email}
            className="flex items-center justify-between border-b p-4 border-border last:border-0"
          >
            <div className="flex items-center gap-3">
              <Avatar
                name={learner.name}
                size="md"
                src={learner?.avatarImageUrl}
              />
              <div>
                <p className="text-base font-semibold text-[#111827]">
                  {learner.name}{" "}
                  {learner.isPayer && (
                    <span className="font-normal text-[#6B7280]">
                      {tc.payer}
                    </span>
                  )}
                </p>
                <p className="text-sm text-[#6B7280]">{learner.email}</p>
              </div>
            </div>

            {!learner.isPayer && (
              <IconButton
                size="xs"
                variant="ghost"
                onClick={() => onRemoveLearner(learner.id)}
              >
                <X />
              </IconButton>
            )}
          </div>
        ))}
      </div>

      <p className="font-semibold text-[#111827]">
        {tc.totalLearners} {learners.length}
      </p>
    </div>
  );
};

export default LearnerSection;
