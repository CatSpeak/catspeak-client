const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

export async function geocodeAddress(address) {
  if (!address?.trim()) return null;

  const url =
    `https://api.geoapify.com/v1/geocode/search` +
    `?text=${encodeURIComponent(address)}` +
    `&lang=vi` +
    `&limit=1` +
    `&apiKey=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Geoapify request failed");
  }

  const data = await response.json();

  console.log("Geoapify response:", data);

  if (!data.features?.length) {
    return null;
  }

  const feature = data.features[0];

  return {
    lat: feature.properties.lat,
    lng: feature.properties.lon,
  };
}


