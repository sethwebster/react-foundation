import { PublicPageShell } from "@/components/public-site/layout";

export default function UpdatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicPageShell>{children}</PublicPageShell>;
}
