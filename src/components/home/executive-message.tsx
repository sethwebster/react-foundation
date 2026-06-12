import Image from "next/image";

import { Panel, PanelEyebrow } from "@/components/panels/panel";

export function ExecutiveMessage() {
  return (
    <Panel tone="paper" labelledBy="executive-message-title">
      <PanelEyebrow id="executive-message-title">A message from our executive director</PanelEyebrow>

      <div className="mt-6 h-24 w-24 overflow-hidden rounded-full">
        <Image
          src="/seth-webster-headshot.jpeg"
          alt="Seth Webster, Executive Director"
          width={96}
          height={96}
          className="h-full w-full object-cover"
          priority
        />
      </div>

      <p className="mt-8 max-w-[44rem] text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.35] tracking-[-0.01em] text-[#16181D]">
        You know, every so often, something comes along in software that changes not
        just how we build — but why we build.
      </p>

      <div className="mt-8 max-w-[44rem] space-y-5 text-[15px] leading-[1.7] text-[#5E687E]">
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

        <p>
          <strong className="font-semibold text-[#16181D]">
            Because this isn&apos;t just about governance. It&apos;s about legacy.
            <br />
            It&apos;s about ensuring that the ideas we build together endure.
          </strong>
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

        <p>
          <strong className="font-semibold text-[#16181D]">Let&apos;s make the next chapter one that lasts for generations.</strong>
        </p>
      </div>

      <div className="mt-10 max-w-[44rem] border-t border-[color:var(--panel-rule)] pt-6">
        <p className="text-[17px] font-semibold text-[#16181D]">Seth Webster</p>
        <p className="mt-1 text-[13px] text-[#5E687E]">Executive Director, React Foundation</p>
      </div>
    </Panel>
  );
}
