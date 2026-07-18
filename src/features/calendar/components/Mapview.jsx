import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapControl from "./MapControl";
import { geocodeAddress } from "@/shared/utils/geocode";

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_POS = [10.8385, 106.6764];

// Cache geocode theo địa chỉ
const geocodeCache = {};

function MapFlyTo({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [center, map]);

  return null;
}

export default function MapView({ dayEvents = [], selectedEvent = null }) {
  const [markers, setMarkers] = useState([]);
  const [activeCenter, setActiveCenter] = useState(DEFAULT_POS);
  const [flyTrigger, setFlyTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadMarkers() {
      const result = [];

      for (const ev of dayEvents) {
        // Kiểm tra cancelled ngay đầu mỗi vòng lặp
        if (cancelled) break;

        if (ev.isOnline) continue;

        const parts = [];
        const baseLocation = ev.location || ev.address;
        if (baseLocation && baseLocation.trim()) parts.push(baseLocation.trim());
        if (ev.cityName && ev.cityName.trim()) parts.push(ev.cityName.trim());
        if (ev.countryName && ev.countryName.trim()) parts.push(ev.countryName.trim());
        
        const address = parts.join(", ");
        console.log("Address:", address);
        if (!address.trim()) continue;

        const cacheKey = address.toLowerCase().trim();

        let coords = geocodeCache[cacheKey];

        if (coords === undefined) {
          try {
            console.log("Geocoding:", address);
            coords = await geocodeAddress(address);

            console.log("Geocode result:", coords);

            geocodeCache[cacheKey] = coords ?? null;
          } catch (err) {
            console.error("Geocode failed:", err);
            geocodeCache[cacheKey] = null;
            coords = null;
          }
        }

        if (cancelled) break;

        if (coords) {
          // Check for exact coordinate overlaps to offset markers slightly
          const overlapCount = result.filter(
            (m) => m.lat === coords.lat && m.lng === coords.lng
          ).length;
          
          let lat = coords.lat;
          let lng = coords.lng;
          
          if (overlapCount > 0) {
            // Add a tiny offset (~5-10 meters) so markers don't perfectly overlap
            const offsetLat = (Math.random() - 0.5) * 0.00015;
            const offsetLng = (Math.random() - 0.5) * 0.00015;
            lat += offsetLat;
            lng += offsetLng;
          }

          result.push({
            id: ev.id,
            title: ev.title,
            address,
            lat,
            lng,
            originalLat: coords.lat,
            originalLng: coords.lng,
          });
        }
      }

      if (!cancelled) {
        setMarkers(result);
      }
    }

    if (dayEvents.length) {
      loadMarkers();
    } else {
      setMarkers([]);
    }

    return () => {
      cancelled = true;
    };
  }, [dayEvents]);

  useEffect(() => {
    if (!selectedEvent) {
      return;
    }

    const selectedId = selectedEvent.id;

    const marker = markers.find((m) => String(m.id) === String(selectedId));

    if (marker) {
      setActiveCenter([marker.lat, marker.lng]);
      setFlyTrigger((prev) => prev + 1);
    }
  }, [selectedEvent, markers]);

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden">
      <MapContainer
        center={activeCenter}
        zoom={15}
        zoomControl={false}
        scrollWheelZoom
        className="w-full h-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]}>
            <Popup>
              <div className="min-w-[220px]">
                <div className="font-semibold">{marker.title}</div>

                <div className="text-sm text-gray-600 mt-1">
                  {marker.address}
                </div>
              </div>
            </Popup>
          </Marker>
        ))} */}

        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]}>
            <Popup>
              <div className="min-w-[220px]">
                <div className="font-semibold">{marker.title}</div>

                <div className="text-sm text-gray-600 mt-1">
                  {marker.address}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapFlyTo center={activeCenter} key={flyTrigger} />
        <MapControl />
      </MapContainer>
    </div>
  );
}
