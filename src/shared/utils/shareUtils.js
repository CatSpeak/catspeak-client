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
