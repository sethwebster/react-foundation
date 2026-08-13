"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type * as Leaflet from "leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((module) => module.MapContainer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((module) => module.Marker),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((module) => module.TileLayer),
  { ssr: false },
);

const centralLondon: [number, number] = [51.5074, -0.1278];

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributeFilter: ["class", "data-theme"],
    attributes: true,
  });
  return () => observer.disconnect();
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function LondonMap() {
  const [leaflet, setLeaflet] = useState<typeof Leaflet | null>(null);
  const effectiveTheme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => "light",
  );

  useEffect(() => {
    let active = true;

    import("leaflet").then((module) => {
      if (active) setLeaflet(module.default);
    });

    return () => {
      active = false;
    };
  }, []);

  const markerIcon = useMemo(
    () =>
      leaflet?.divIcon({
        className: "summit-map-marker",
        html: "<span aria-hidden=\"true\"></span>",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    [leaflet],
  );

  const tileUrl =
    effectiveTheme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-muted/30">
      <div className="summit-map h-64 w-full bg-muted">
        {leaflet && markerIcon ? (
          <MapContainer
            center={centralLondon}
            zoom={11}
            minZoom={9}
            maxZoom={16}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              key={tileUrl}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url={tileUrl}
            />
            <Marker
              position={centralLondon}
              icon={markerIcon}
              title="Central London"
              keyboard={false}
            />
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading London map…</p>
          </div>
        )}
      </div>
      <figcaption className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
        Central London · Exact venue to be confirmed
      </figcaption>
    </figure>
  );
}
