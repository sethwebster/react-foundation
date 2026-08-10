import Image from "next/image";

type ImageMember = {
  name: string;
  src: string;
  darkSrc: string;
  lightClassName?: string;
  /** Normalized max-width to balance visual weight across logos */
  maxWidth?: number;
  /** Override container height (px). Defaults to 40 (h-10). */
  height?: number;
};

type TextMember = {
  name: string;
  text: string;
  /** Font size class to balance visual weight with image logos */
  textSize?: string;
};

type Member = ImageMember | TextMember;

function isTextMember(m: Member): m is TextMember {
  return "text" in m;
}

const FOUNDING_MEMBERS: Member[] = [
  {
    name: "Meta",
    src: "/assets/founding-members/meta.svg",
    darkSrc: "/assets/founding-members/meta-dark.svg",
    maxWidth: 90,
  },
  {
    name: "Amazon Developer",
    src: "/assets/founding-members/amazon.svg",
    darkSrc: "/assets/founding-members/amazon-dark.svg",
    maxWidth: 89,
  },
  {
    name: "Microsoft",
    src: "/assets/founding-members/microsoft.svg",
    darkSrc: "/assets/founding-members/microsoft-dark.svg",
    maxWidth: 132,
    height: 58,
  },
  {
    name: "Huawei",
    src: "/assets/founding-members/huawei.svg",
    darkSrc: "/assets/founding-members/huawei-dark.svg",
    maxWidth: 90,
  },
  {
    name: "Software Mansion",
    src: "/assets/founding-members/software-mansion.svg",
    darkSrc: "/assets/founding-members/software-mansion.svg",
    maxWidth: 120,
  },
  {
    name: "Expo",
    src: "/assets/founding-members/expo.svg",
    darkSrc: "/assets/founding-members/expo-dark.svg",
    maxWidth: 90,
  },
  {
    name: "Callstack",
    src: "/assets/founding-members/callstack.svg",
    darkSrc: "/assets/founding-members/callstack.svg",
    lightClassName: "brightness-0",
    maxWidth: 120,
  },
  {
    name: "Vercel",
    src: "/assets/founding-members/vercel.svg",
    darkSrc: "/assets/founding-members/vercel-dark.svg",
    maxWidth: 90,
  },
];

export function FoundingMembers() {
  return (
    <section className="scroll-mt-32 py-4">
      <p className="hidden text-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">
        Founding members
      </p>
      <div className="grid grid-cols-3 items-center gap-6 sm:hidden">
        {[FOUNDING_MEMBERS[0], FOUNDING_MEMBERS[3], FOUNDING_MEMBERS[2]].map(
          (member) => (
            <MemberLogo key={member.name} member={member} compact />
          ),
        )}
      </div>
      <div className="mt-9 hidden grid-cols-4 items-center gap-x-8 gap-y-10 sm:grid">
        {FOUNDING_MEMBERS.map((member) => (
          <MemberLogo key={member.name} member={member} />
        ))}
      </div>
    </section>
  );
}

function MemberLogo({ member, compact = false }: { member: Member; compact?: boolean }) {
  return (
    <div className="flex min-h-10 items-center justify-center opacity-75 transition hover:opacity-100">
      {isTextMember(member) ? (
        <span
          className={`font-mono font-semibold text-foreground ${
            member.textSize ?? "text-xl"
          }`}
        >
          {member.text}
        </span>
      ) : (
        <div
          className="relative w-full"
          style={{
            maxWidth: compact ? Math.min(member.maxWidth ?? 110, 100) : member.maxWidth ?? 160,
            height: compact ? 36 : member.height ?? 40,
          }}
        >
          <Image
            src={member.src}
            alt={`${member.name} logo`}
            fill
            sizes={compact ? "100px" : "160px"}
            className={`object-contain dark:hidden ${member.lightClassName ?? ""}`}
            unoptimized
          />
          <Image
            src={member.darkSrc}
            alt={`${member.name} logo`}
            fill
            sizes={compact ? "100px" : "160px"}
            className="hidden object-contain dark:block"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
