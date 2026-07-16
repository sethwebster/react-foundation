import type { Metadata } from "next";
import Link from "next/link";

import { AddCommunityForm } from "@/components/communities/AddCommunityForm";
import {
  PageIntro,
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";

export const metadata: Metadata = {
  title: "Add Your Community",
  description: "Submit a React community for the public directory.",
};

export default function AddCommunityPage() {
  return (
    <PublicPageShell>
      <main>
        <Section className="pt-12 sm:pt-16" measure="standard">
          <Link
            href="/communities"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            <span aria-hidden>←</span> Back to communities
          </Link>
        </Section>
        <Section className="pt-10" measure="standard">
          <PageIntro
            align="left"
            eyebrow="Community directory"
            title="Add your community"
            description="Submit a meetup, conference, or study group for review before it appears in the public directory."
          />
          <Surface className="mt-10 p-6 sm:p-8">
            <AddCommunityForm fullPage />
          </Surface>
        </Section>
      </main>
    </PublicPageShell>
  );
}
