const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

export async function autocompleteAddress(text) {
  if (!text?.trim()) return [];

  const url =
    `https://api.geoapify.com/v1/geocode/autocomplete` +
    `?text=${encodeURIComponent(text)}` +
    `&lang=vi` +
    `&limit=5` +
    `&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Geoapify autocomplete request failed");
    }
    const data = await response.json();
    return data.features || [];
  } catch (error) {
    console.error("Autocomplete error:", error);
    return [];
  }
}
