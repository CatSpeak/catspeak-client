import Avatar from "@/shared/components/ui/Avatar"
import { PillButton } from "@/shared/components/ui/buttons"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"

/**
 * MemberProfileView — displays single member profile details within info panel.
 */
const MemberProfileView = ({ member }) => {
  if (!member) return null

  return (
    <div className="flex flex-col items-center p-4">
      <Avatar
        size={80}
        name={member.username}
        src={member.avatarImageUrl}
        className={
          getParticipantTheme(
            member.accountId || member.username || "",
          ).avatarClass
        }
      />

      <h2 className="mt-3 font-semibold text-center">{member.username}</h2>

      <p className="mt-4 text-sm text-[#606060] text-center">
        Level: {member.level || "Student"}
      </p>

      <div className="w-full mt-6">
        <PillButton
          onClick={() => window.open(`/profile/${member.accountId}`, "_blank")}
          variant="primary"
          className="w-full"
        >
          View Profile
        </PillButton>
      </div>
    </div>
  )
}

export default MemberProfileView
