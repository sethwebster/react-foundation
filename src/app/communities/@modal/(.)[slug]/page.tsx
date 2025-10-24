/**
 * Community Modal (Intercepting Route)
 * Shows community details in a modal overlay when navigating from /communities
 */

import { getCommunityBySlug } from '@/data/communities';
import { CommunityModal } from '@/components/communities/CommunityModal';
import { notFound } from 'next/navigation';

interface ModalPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CommunityModalPage({ params }: ModalPageProps) {
  const { slug } = await params;
  const community = getCommunityBySlug(slug);

  if (!community) {
    notFound();
  }

  return <CommunityModal community={community} />;
}
