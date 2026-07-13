import { ReactAtom } from "@/components/ui/react-atom";

/**
 * Decorative band of community "moments". These are neutral placeholder tiles —
 * swap the gradient fill for real event photography (object-cover <Image />) when
 * assets are available; the labels and layout are production-ready.
 */
const MOMENTS: { label: string; place: string; tilt: string }[] = [
  { label: "React India", place: "Goa", tilt: "-rotate-6 translate-y-4" },
  { label: "React Conf", place: "Las Vegas", tilt: "rotate-3 -translate-y-2" },
  { label: "React Native EU", place: "Wrocław", tilt: "-rotate-2 translate-y-1" },
  { label: "React Prague", place: "Prague", tilt: "rotate-6 -translate-y-3" },
  { label: "React TLV", place: "Tel Aviv", tilt: "-rotate-3 translate-y-3" },
];

export function CommunityGallery() {
  return (
    <section aria-label="Moments from the React community" className="overflow-hidden">
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {MOMENTS.map((moment) => (
          <figure
            key={moment.label}
            className={`relative aspect-[4/5] w-40 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-sm transition-transform duration-300 hover:rotate-0 hover:translate-y-0 sm:w-48 ${moment.tilt}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted to-accent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ReactAtom
                className="h-10 w-10 text-muted-foreground/25"
                strokeWidth={0.8}
              />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/85 via-background/50 to-transparent p-3 text-left">
              <p className="text-xs font-semibold text-foreground">{moment.label}</p>
              <p className="text-[11px] text-muted-foreground">{moment.place}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
