import { RFDS } from "@/components/rfds";
import { ReactLogo3D } from "@/components/ui/react-logo-3d";

export default function NotFound() {
  return (
    <main className="relative h-screen overflow-hidden">
      <BackgroundGlow />

      {/* Full screen 3D React Logo */}
      <div className="fixed inset-0 z-0">
        <ReactLogo3D />
      </div>

      {/* Typography and Navigation - Overlay on top, positioned below header */}
      <div className="fixed z-10 flex items-center justify-center px-6 text-center" style={{ bottom: '6rem', left: '0', right: '0' }}>
        <div className="max-w-2xl space-y-8">
          {/* Main message */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            This page drifted off the{" "}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              React Fiber
            </span>
          </h1>

          {/* Navigation buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <RFDS.ButtonLink
              href="/"
              variant="primary"
              size="lg"
              className="min-w-[200px]"
            >
              Return to Earth
            </RFDS.ButtonLink>
            <RFDS.ButtonLink
              href="/collections"
              variant="glass"
              size="lg"
              className="min-w-[200px]"
            >
              Explore Collections
            </RFDS.ButtonLink>
          </div>
        </div>
      </div>
    </main>
  );
}

function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,_rgba(76,29,149,0.25),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,_rgba(14,116,144,0.2),_transparent_45%)]" />
      <div className="absolute inset-x-1/2 top-20 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-sky-500/40 blur-3xl sm:h-[34rem] sm:w-[34rem]" />
      <div className="absolute left-[12%] top-[55%] h-56 w-56 -translate-y-1/2 rounded-full bg-indigo-500/35 blur-3xl" />
      <div className="absolute right-[10%] top-[62%] h-64 w-64 -translate-y-1/2 rounded-full bg-purple-500/25 blur-[110px]" />
    </div>
  );
}

