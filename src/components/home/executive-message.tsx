import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Image from "next/image";

export function ExecutiveMessage() {
  return (
    <ScrollReveal animation="fade-up">
      <section className="scroll-mt-32 space-y-8 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-12">
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white/20 bg-slate-900 shadow-2xl">
              <Image
                src="/seth-webster-headshot.jpeg"
                alt="Seth Webster, Executive Director"
                width={128}
                height={128}
                className="object-cover"
                priority
              />
            </div>
          </div>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            A Message from Our Executive Director
          </h2>
        </div>

        <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-white/80">
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
            Meta, Microsoft, Amazon, Vercel, Expo, Callstack, Software Mansion, and many
            more — but more importantly, by working with you, the global community of
            developers who make React what it is.
          </p>

          <p className="text-lg font-medium text-white">
            Because this isn&apos;t just about governance. It&apos;s about legacy.
            <br />
            It&apos;s about ensuring that the ideas we build together endure.
          </p>

          <p>
            I&apos;ve had the privilege of leading React at Meta for  many years, and now,
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

          <p className="text-lg font-medium text-white">
            Let&apos;s make the next chapter one that lasts for generations.
          </p>
        </div>

        <div className="border-t border-white/10 pt-8 text-center">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-white">Seth Webster</p>
            <p className="text-sm text-white/60">Executive Director, React Foundation</p>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
