import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Image from "next/image";

export function ExecutiveMessage() {
  return (
    <ScrollReveal animation="fade-up">
      <section className="scroll-mt-32 rounded-panel border border-border bg-surface-raised px-7 py-9 shadow-soft sm:px-12 sm:py-12">
        <p className="text-sm font-semibold text-primary">
          A Message from Our Executive Director
        </p>

        <div className="mt-7 space-y-5 text-[0.9375rem] leading-7 text-foreground/82">
          <p>
            You know, every so often, something comes along in software that changes not
            just how we build — but why we build.
          </p>

          <p>React did that.</p>

          <p>
            It gave us more than a way to render UIs. It gave us a new way to think —
            about composition, about state, about expressing ideas. But even more than
            that, it gave us a new way to connect with one another.
          </p>

          <p>
            From the very beginning, React has been about people. About curiosity shared
            in the open. About mentorship that crosses companies, countries, and time
            zones. About a community that believes — deeply — that if we help others
            bring their ideas to life, ours will follow.
          </p>

          <p>
            That belief has powered one of the most influential movements in modern
            software history. React has shaped how the web is built, how mobile is built,
            even how we as developers think about creativity itself. And yet, for all its
            reach and impact, its heart has never changed: it&apos;s still about people
            building together.
          </p>

          <p>That&apos;s why we created the React Foundation.</p>

          <p>
            The Foundation exists to make sure React&apos;s future is independent,
            community-driven, and open — forever. It&apos;s here to protect the culture
            that brought us all this way, and to nurture what comes next: the next
            generation of maintainers, educators, experimenters, and dreamers.
          </p>

          <p>
            We&apos;re doing that by working hand-in-hand with incredible partners —
            Meta, Microsoft, Amazon, Vercel, Expo, Callstack, Software Mansion, Huawei, and
            many
            more — but more importantly, by working with you, the global community of
            developers who make React what it is.
          </p>

          <p>
            <strong className="font-semibold">
              Because this isn&apos;t just about governance. It&apos;s about legacy.
              <br />
              It&apos;s about ensuring that the ideas we build together endure.
            </strong>
          </p>

          <p>
            I&apos;ve had the privilege of leading React at Meta for many years, and now,
            as the Executive Director of the React Foundation, I carry the same North Star
            that&apos;s guided me all along: helping others bring their ideas to life.
          </p>

          <p>
            If React has ever inspired you — to learn, to teach, to build, to share —
            then you are already part of this story. The Foundation is here to help that
            story grow, together.
          </p>

          <p>
            Thank you for everything you&apos;ve built so far — and for everything
            you&apos;re about to.
          </p>

          <p>
            <strong className="font-semibold">Let&apos;s make the next chapter one that lasts for generations.</strong>
          </p>
        </div>

        <div className="mt-9 flex items-center gap-3 border-t border-border pt-7">
          <Image
            src="/seth-webster-headshot.jpeg"
            alt=""
            aria-hidden
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-foreground">Seth Webster</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Executive Director, React Foundation
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs italic text-muted-foreground">
          (emdashes are mine)
        </p>
      </section>
    </ScrollReveal>
  );
}
