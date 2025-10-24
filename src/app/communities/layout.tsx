/**
 * Communities Layout
 * Supports parallel routes for modal overlays
 */

export default function CommunitiesLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
