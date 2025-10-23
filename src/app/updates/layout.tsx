import { Footer } from "@/components/layout/footer";

export default function UpdatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pt-24 text-muted-foreground">
      <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[24rem] w-[60rem] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-30" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col px-6 pb-24 sm:px-8 lg:px-12">
        {children}
      </div>

      <Footer />
    </div>
  );
}
