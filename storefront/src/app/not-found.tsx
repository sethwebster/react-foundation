import Image from "next/image";

import { RFDS } from "@/components/rfds";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-slate-950 pt-32 text-slate-100">
      <BackgroundGlow />

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pb-24 text-center sm:px-8 lg:px-12">
        <Mascot />

        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.6em] text-sky-200/70">
          404
        </p>
        <h1 className="mb-10 bg-gradient-to-br from-sky-200 via-indigo-200 to-purple-300 bg-clip-text text-4xl font-semibold text-transparent sm:text-5xl">
          This page drifted off the React fiber.
        </h1>

        <div className="mt-28 flex flex-wrap justify-center gap-4">
          <RFDS.ButtonLink href="/" size="lg">
            Return to the storefront
          </RFDS.ButtonLink>
          <RFDS.ButtonLink href="/collections" size="lg" variant="secondary">
            Explore collections
          </RFDS.ButtonLink>
          <RFDS.ButtonLink href="/#drops" size="lg" variant="ghost">
            View drops
          </RFDS.ButtonLink>
        </div>
      </div>
    </main>
  );
}

function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,_rgba(76,29,149,0.25),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,_rgba(14,116,144,0.2),_transparent_45%)]" />
      <div className="absolute inset-x-1/2 top-20 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-sky-500/40 blur-3xl sm:h-[34rem] sm:w-[34rem]" />
      <div className="absolute left-[12%] top-[55%] h-56 w-56 -translate-y-1/2 rounded-full bg-indigo-500/35 blur-3xl" />
      <div className="absolute right-[10%] top-[62%] h-64 w-64 -translate-y-1/2 rounded-full bg-purple-500/25 blur-[110px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-950/90 to-slate-950" />
    </div>
  );
}

function Mascot() {
  return (
    <div className="relative mb-14 flex items-center justify-center" style={{ perspective: '1000px' }}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400/35 via-blue-500/20 to-purple-500/35 blur-3xl" />

      <div className="relative flex items-center justify-center">
        <Image
          src="/react-logo.svg"
          alt="React reactor mascot"
          width={320}
          height={320}
          className="drop-shadow-[0_0_80px_rgba(56,189,248,0.8)]"
          style={{
            animation: "coin-flip 2s ease-in-out infinite",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
          priority
        />
      </div>
    </div>
  );
}
