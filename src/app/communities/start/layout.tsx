import { Footer } from "@/components/layout/footer";

export default function CommunityGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Removed background gradient as it's handled by GuideHero component */}

      <div className="prose prose-lg mx-auto max-w-6xl px-6 pb-24 sm:px-8 lg:px-12">
        {children}
      </div>

      <Footer />
    </div>
  );
}
