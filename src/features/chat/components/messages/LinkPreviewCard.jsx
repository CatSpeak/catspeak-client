import React, { useState } from "react"
import { Globe, ExternalLink } from "lucide-react"
import ListItem from "@/shared/components/ui/ListItem"

/**
 * LinkPreviewCard — General link preview card component styled identically to MediaAttachment document file card.
 *
 * @param {object} urlDetails - Parsed URL metadata object
 * @param {boolean} hasCaption - Whether text caption exists below card
 */
const LinkPreviewCard = ({ urlDetails, hasCaption = false }) => {
  const [faviconFailed, setFaviconFailed] = useState(false)

  if (!urlDetails || !urlDetails.href) return null

  const { href, domain, faviconUrl, pathSnippet } = urlDetails

  const handleClick = (e) => {
    e.stopPropagation()
  }

  const roundedClass = hasCaption
    ? "rounded-t-2xl rounded-b-none"
    : "rounded-2xl"

  const leftContent =
    !faviconFailed && faviconUrl ? (
      <img
        src={faviconUrl}
        alt={domain}
        onError={() => setFaviconFailed(true)}
        className="w-6 h-6 object-contain"
      />
    ) : (
      <Globe className="text-[#606060]" />
    )

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onTouchStart={handleClick}
      className="block no-underline w-full cursor-pointer"
    >
      <ListItem
        lines={2}
        className={`bg-[#F3F3F3] ${roundedClass} overflow-hidden text-left`}
        leftContent={leftContent}
      >
        <p className="font-semibold truncate m-0 capitalize">{domain}</p>
        <p className="text-sm text-[#606060] truncate m-0">
          {pathSnippet || href}
        </p>
      </ListItem>
    </a>
  )
}

export default React.memo(LinkPreviewCard)
