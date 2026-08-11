import Image from "next/image";
import Link from "next/link";

const PHOTOS = [
  {
    src: "/images/community/react-community-speaker.png",
    alt: "A React community speaker presenting on stage",
    rotation: "-rotate-[4deg]",
  },
  {
    src: "/images/community/react-community-group.png",
    alt: "React community members gathered at a conference",
    rotation: "rotate-[2deg]",
  },
  {
    src: "/images/community/react-community-workshop.png",
    alt: "React community members collaborating at a workshop",
    rotation: "-rotate-[2deg]",
  },
  {
    src: "/images/community/react-community-stage.png",
    alt: "A speaker sharing ideas at a React event",
    rotation: "rotate-[4deg]",
  },
  {
    src: "/images/community/react-community-meetup.png",
    alt: "Developers connecting at a React community meetup",
    rotation: "-rotate-[3deg]",
  },
];

export function MemberPhotoRail() {
  return (
    <section aria-labelledby="member-photo-rail-heading" className="pb-9 pt-5 sm:pb-12 sm:pt-7">
      <h2 id="member-photo-rail-heading" className="sr-only">
        React Foundation members
      </h2>
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-3">
        <div className="mx-auto flex w-max min-w-full -translate-x-[9%] items-center justify-center gap-2 px-2 sm:translate-x-0 sm:gap-7 sm:px-8">
          {PHOTOS.map((photo, index) => (
            <figure
              key={photo.src}
              className={`relative h-[9.5rem] w-[10rem] shrink-0 overflow-hidden rounded-card border-4 border-background bg-muted shadow-raised sm:h-[12rem] sm:w-[17.5rem] sm:rounded-panel ${photo.rotation} ${
                index === 0 || index === PHOTOS.length - 1 ? "hidden sm:block" : ""
              }`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 192px, 280px"
                className="object-cover"
              />
            </figure>
          ))}
        </div>
      </div>
      <div className="text-center">
        <Link
          href="/become-a-member"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"
        >
          Membership enrollment <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
