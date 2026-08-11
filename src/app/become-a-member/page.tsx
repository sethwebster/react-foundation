import type { Metadata } from "next";

import {
  PageIntro,
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";

const enrollmentUrl =
  "https://enrollment.lfx.linuxfoundation.org/?project=react-foundation";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "React Foundation membership information and Linux Foundation enrollment.",
};

const supportAreas = [
  "Maintainer and project support",
  "Shared ecosystem infrastructure",
  "Community and education programs",
  "Foundation governance and operations",
];

export default function BecomeMemberPage() {
  return (
    <PublicPageShell>
      <main>
        <Section className="pt-16 sm:pt-24">
          <PageIntro
            eyebrow="Organizations"
            title="Membership"
            description="Organizations can support independent stewardship and shared work across the React ecosystem."
            actions={
              <ButtonLink href={enrollmentUrl} size="lg">
                Open enrollment
              </ButtonLink>
            }
          />
        </Section>

        <Section className="pt-12 sm:pt-16" measure="standard">
          <Surface className="grid gap-8 p-7 sm:p-10 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold text-primary">Enrollment</p>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">
                Membership is handled by the Linux Foundation
              </h2>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              The external enrollment form opens with the React Foundation selected.
              It is the authoritative place for current membership terms, levels, and
              organization details.
            </p>
          </Surface>
        </Section>

        <Section className="py-20 sm:py-24" measure="standard">
          <div className="grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-semibold text-primary">What support enables</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-foreground">
                Capacity for work no single project should carry alone.
              </h2>
            </div>
            <ul className="divide-y divide-border border-y border-border">
              {supportAreas.map((area) => (
                <li key={area} className="py-5 text-base text-foreground">
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </main>
    </PublicPageShell>
  );
}
