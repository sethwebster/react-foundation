"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type * as Leaflet from "leaflet";

import type { Community } from "@/types/community";

const MapContainer = dynamic(
  () => import("react-leaflet").then((module) => module.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((module) => module.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((module) => module.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import("react-leaflet").then((module) => module.Popup),
  { ssr: false },
);

export function CommunityMap({ communities }: { communities: Community[] }) {
  const [leaflet, setLeaflet] = useState<typeof Leaflet | null>(null);

  useEffect(() => {
    let active = true;

    import("leaflet").then((module) => {
      if (active) setLeaflet(module.default);
    });

    return () => {
      active = false;
    };
  }, []);

  const visibleCommunities = useMemo(
    () =>
      communities.filter(
        (
          community,
        ): community is Community & {
          coordinates: NonNullable<Community["coordinates"]>;
        } => Boolean(community.coordinates),
      ),
    [communities],
  );

  if (!leaflet) {
    return (
      <div className="flex h-[28rem] items-center justify-center bg-map-water/35 sm:h-[34rem]">
        <p className="text-sm text-muted-foreground">Loading community map…</p>
      </div>
    );
  }

  return (
    <div className="community-map relative h-[28rem] w-full overflow-hidden bg-map-water/45 sm:h-[34rem]">
      <div className="absolute right-4 top-4 z-[500] rounded-xl border border-border bg-background/92 px-3.5 py-3 shadow-card backdrop-blur">
        <p className="mb-2.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          CoIS Tier
        </p>
        <div className="space-y-1.5">
          <LegendDot color="#22c7e6" label="Platinum" />
          <LegendDot color="#f5bd23" label="Gold" />
          <LegendDot color="#aab0b7" label="Silver" />
          <LegendDot color="#ee8741" label="Bronze" />
        </div>
      </div>

      <MapContainer
        center={[18, 3]}
        zoom={1}
        minZoom={1}
        maxZoom={8}
        scrollWheelZoom={false}
        worldCopyJump
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />

        {visibleCommunities.map((community) => (
          <Marker
            key={community.id}
            position={[community.coordinates.lat, community.coordinates.lng]}
            icon={leaflet.divIcon({
              className: "foundation-map-marker",
              html: `<span style="background:${getMarkerColor(
                community.cois_tier,
                community.status,
              )}"></span>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7],
              popupAnchor: [0, -10],
            })}
            title={community.name}
          >
            <Popup minWidth={240} maxWidth={280}>
              <div className="p-4">
                <p className="text-base font-semibold text-foreground">
                  {community.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {community.city}
                  {community.region ? `, ${community.region}` : ""},{" "}
                  {community.country}
                </p>
                <p className="mt-3 line-clamp-3 text-xs leading-5 text-muted-foreground">
                  {community.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    {community.member_count.toLocaleString()} members
                  </span>
                  <Link
                    href={`/communities/${community.slug}`}
                    className="text-xs font-semibold text-primary"
                  >
                    View →
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function getMarkerColor(tier?: string, status?: string) {
  if (status === "inactive" || status === "paused") return "#89929f";
  if (tier === "platinum") return "#22c7e6";
  if (tier === "gold") return "#f5bd23";
  if (tier === "silver") return "#aab0b7";
  if (tier === "bronze") return "#ee8741";
  return "#087ea4";
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-2 w-2 rounded-full ring-2 ring-background"
        style={{ backgroundColor: color }}
      />
      <span className="text-[0.6875rem] text-foreground">{label}</span>
    </div>
  );
}
