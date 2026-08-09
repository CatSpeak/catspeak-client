import { toast } from "react-hot-toast";

export const getShareUrlWithVersion = (baseurl) => {
  try {
    const urlString = baseurl || window.location.href;
    const url = new URL(urlString, window.location.origin);
    url.searchParams.set("ver", Date.now());
    return url.toString();
  } catch (error) {
    return baseurl || window.location.href;
  }
};

export const getRoomShareUrl = ({ baseUrl, room }) => {
  try {
    const urlString = baseUrl || window.location.href;
    const url = new URL(urlString, window.location.origin);
    if (room?.hasPassword && room?.password) {
      url.searchParams.set("pwd", room.password);
    }
    return getShareUrlWithVersion(url.toString());
  } catch (error) {
    return getShareUrlWithVersion(baseUrl);
  }
};

export const copyRoomLink = async ({ baseUrl, room, successMessage = "Link copied to clipboard!" }) => {
  try {
    const shareUrl = getRoomShareUrl({ baseUrl, room });
    await navigator.clipboard.writeText(shareUrl);
    toast.success(successMessage);
    return true;
  } catch (error) {
    toast.error("Failed to copy link");
    return false;
  }
};




