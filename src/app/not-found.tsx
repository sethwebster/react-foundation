import {
  PageIntro,
  PublicPageShell,
  Section,
} from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PublicPageShell>
      <main>
        <Section className="py-20 sm:py-28">
          <PageIntro
            eyebrow="404"
            title="Page not found"
            description="The address may be incorrect, or the page may have moved."
            actions={
              <>
                <ButtonLink href="/">Go home</ButtonLink>
                <ButtonLink href="/updates" variant="secondary">
                  Read updates
                </ButtonLink>
              </>
            }
          />
        </Section>
      </main>
    </PublicPageShell>
  );
}
