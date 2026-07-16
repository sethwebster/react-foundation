import type { Metadata } from "next";

import {
  PageIntro,
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Store Preview",
  description: "Status of the React Foundation store.",
};

export default function StorePage() {
  return (
    <PublicPageShell>
      <main>
        <Section className="pt-16 sm:pt-24">
          <PageIntro
            eyebrow="Store"
            title="The foundation store is not open yet"
            description="Checkout is not currently available. Product and collection routes remain visible as a preview while the commerce experience is prepared."
            actions={
              <>
                <ButtonLink href="/store/collections" variant="secondary">
                  Preview collections
                </ButtonLink>
                <ButtonLink href="/" variant="tertiary">
                  Back to home
                </ButtonLink>
              </>
            }
          />
        </Section>

        <Section className="pt-12" measure="standard">
          <Surface className="p-7 text-center sm:p-10">
            <h2 className="text-xl font-semibold text-foreground">
              No orders or waitlist registrations are being accepted
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Availability, pricing, fulfillment, and any relationship between store
              revenue and foundation programs will be published before checkout opens.
            </p>
          </Surface>
        </Section>
      </main>
    </PublicPageShell>
  );
}
