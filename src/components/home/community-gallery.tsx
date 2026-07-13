import { ReactAtom } from "@/components/ui/react-atom";

/**
 * Hero band of large, alternately-tilted community "moments" — mirrors the Figma's
 * overlapping photo strip. These are neutral placeholder tiles: swap the gradient
 * fill for real event photography (object-cover <Image />) when assets are
 * available; the labels, tilt, and layout are production-ready.
 */
const MOMENTS: { label: string; place: string; tilt: string }[] = [
  { label: "React India", place: "Goa", tilt: "-rotate-6" },
  { label: "React Conf", place: "Las Vegas", tilt: "rotate-6" },
  { label: "React Native EU", place: "Wrocław", tilt: "-rotate-6" },
  { label: "React Prague", place: "Prague", tilt: "rotate-6" },
  { label: "React TLV", place: "Tel Aviv", tilt: "-rotate-6" },
];

export function CommunityGallery() {
  return (
    <section
      aria-label="Moments from the React community"
      className="overflow-hidden"
    >
      <div className="flex items-center justify-center gap-5 sm:gap-8">
        {MOMENTS.map((moment) => (
          <figure
            key={moment.label}
            className={`relative aspect-[3/2] w-64 shrink-0 overflow-hidden rounded-[1.75rem] border border-border/50 bg-muted shadow-[0_14px_24px_0_rgba(0,0,0,0.15)] transition-transform duration-300 hover:rotate-0 sm:w-80 ${moment.tilt}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted to-accent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ReactAtom
                className="h-12 w-12 text-muted-foreground/25"
                strokeWidth={0.8}
              />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/85 via-background/50 to-transparent p-4 text-left">
              <p className="text-sm font-semibold text-foreground">
                {moment.label}
              </p>
              <p className="text-xs text-muted-foreground">{moment.place}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
