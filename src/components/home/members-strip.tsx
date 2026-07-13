import Image from "next/image";
import Link from "next/link";

/**
 * Founding-member logos rendered as a restrained "trusted by" strip on a light
 * surface: grayscale by default, full color on hover. Only logos with dark/colored
 * source art are included — callstack and software-mansion ship white-only SVGs
 * (built for dark backgrounds) and need light-variant assets before they can join.
 */
const MEMBERS: { name: string; src: string; width: number }[] = [
  { name: "Meta", src: "/assets/founding-members/meta.svg", width: 92 },
  { name: "Microsoft", src: "/assets/founding-members/microsoft.svg", width: 130 },
  { name: "Huawei", src: "/assets/founding-members/huawei.svg", width: 92 },
  { name: "Amazon", src: "/assets/founding-members/amazon.svg", width: 90 },
  { name: "Expo", src: "/assets/founding-members/expo.svg", width: 88 },
  { name: "Vercel", src: "/assets/founding-members/vercel.svg", width: 92 },
];

export function MembersStrip() {
  return (
    <section className="flex flex-col items-center gap-8">
      <Link
        href="/about"
        className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        Meet our members →
      </Link>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
        {MEMBERS.map((member) => (
          <div
            key={member.name}
            className="relative h-7"
            style={{ width: member.width }}
          >
            <Image
              src={member.src}
              alt={`${member.name} logo`}
              fill
              sizes="130px"
              unoptimized
              className="object-contain opacity-60 grayscale brightness-0 transition duration-300 hover:opacity-100 dark:opacity-70 dark:invert dark:hover:opacity-100"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
