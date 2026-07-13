import { Footer } from "@/components/layout/footer";

export default function UpdatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background pt-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[360px] bg-gradient-to-b from-muted/70 to-background" />

      <div className="mx-auto flex max-w-4xl flex-col px-6 pb-24 sm:px-8 lg:px-12">
        {children}
      </div>

      <Footer />
    </div>
  );
}
