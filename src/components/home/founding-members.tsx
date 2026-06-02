import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

type ImageMember = {
  name: string;
  src: string;
  filter?: string;
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

const WHITE_FILTER = "brightness(0) invert(1)";

const FOUNDING_MEMBERS: Member[] = [
  {
    name: "Meta",
    src: "/assets/founding-members/meta.svg",
    filter: WHITE_FILTER,
    maxWidth: 90,
  },
  {
    name: "Amazon Developer",
    src: "/assets/founding-members/amazon.svg",
    filter: WHITE_FILTER,
    maxWidth: 89,
  },
  {
    name: "Microsoft",
    src: "/assets/founding-members/microsoft.svg",
    filter: WHITE_FILTER,
    maxWidth: 132,
    height: 58,
  },
  {
    name: "Huawei",
    src: "/assets/founding-members/huawei.svg",
    filter: WHITE_FILTER,
    maxWidth: 90,
  },
  {
    name: "Software Mansion",
    src: "/assets/founding-members/software-mansion.svg",
    maxWidth: 120,
  },
  {
    name: "Expo",
    src: "/assets/founding-members/expo.svg",
    filter: WHITE_FILTER,
    maxWidth: 90,
  },
  {
    name: "Callstack",
    src: "/assets/founding-members/callstack.svg",
    maxWidth: 120,
  },
  {
    name: "Vercel",
    src: "/assets/founding-members/vercel.svg",
    filter: WHITE_FILTER,
    maxWidth: 90,
  },
];

export function FoundingMembers() {
  return (
    <ScrollReveal animation="fade-up">
      <section className="scroll-mt-32 space-y-8 rounded-3xl border border-border/10 bg-gradient-to-br from-cyan-500/10 via-yellow-400/10 to-orange-500/10 p-12">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Founding Members
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-foreground/70">
            We&apos;re grateful to our founding members who believe in
            sustaining the React ecosystem and supporting open source
            maintainers.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/10 p-8">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-800/60 to-slate-900/80" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 20%, rgba(15, 23, 42, 0.6) 70%, rgba(15, 23, 42, 0.9) 100%)",
            }}
          />

          {/* Logo grid */}
          <div className="relative grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 items-center">
            {FOUNDING_MEMBERS.map((member) => (
              <div
                key={member.name}
                className="flex items-center justify-center"
              >
                {isTextMember(member) ? (
                  <span
                    className={`font-mono font-semibold text-white/90 ${member.textSize ?? "text-xl"}`}
                  >
                    {member.text}
                  </span>
                ) : (
                  <div
                    className="relative w-full"
                    style={{
                      maxWidth: member.maxWidth ?? 160,
                      height: member.height ?? 40,
                    }}
                  >
                    <Image
                      src={member.src}
                      alt={`${member.name} logo`}
                      fill
                      sizes="160px"
                      className="object-contain"
                      unoptimized
                      style={{ filter: member.filter }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border/10 pt-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-5 rounded-2xl border border-border/10 bg-card/70 p-6 text-center shadow-sm sm:flex-row sm:text-left">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                Become a member
              </h3>
              <p className="text-sm text-foreground/70">
                Help fund React maintainers, education, and ecosystem support.
              </p>
            </div>
            <ButtonLink
              href="/become-a-member"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Become a member
            </ButtonLink>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
