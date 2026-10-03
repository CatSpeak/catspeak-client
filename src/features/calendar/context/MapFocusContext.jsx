import { createContext, useContext } from "react";

/**
 * MapFocusContext
 *
 * Value shape:
 *   hasMap: boolean                       — true on screens with a map (community calendar)
 *   focusEventOnMap(event): Promise<void> — close the detail popup, scroll to the
 *                                           map, then pin + flyTo the event; opens
 *                                           Google Maps + toast when geocoding fails
 *
 * Default hasMap = false so map-less detail surfaces fall back to Google Maps.
 */
const MapFocusContext = createContext({
  hasMap: false,
  focusEventOnMap: async () => {},
});

export const useMapFocus = () => useContext(MapFocusContext);

export default MapFocusContext;
