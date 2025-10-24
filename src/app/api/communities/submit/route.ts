/**
 * Community Submission API
 * POST /api/communities/submit - Submit a new community for review
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const required = ['name', 'address', 'city', 'country', 'description', 'organizer_name', 'organizer_email'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create submission record
    const submission = {
      id: `submission-${Date.now()}`,
      name: body.name,
      address: body.address,
      city: body.city,
      country: body.country,
      description: body.description,
      meetup_url: body.meetup_url,
      website: body.website,
      member_count: body.member_count || 0,
      organizer_name: body.organizer_name,
      organizer_email: body.organizer_email,
      submitted_by: session.user.email,
      verification_status: 'pending',
      geocoded: false,
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('📝 New community submission:', submission);

    // TODO: Store in Redis pending queue: pending_communities:{id}
    // TODO: Geocode address to get coordinates
    // TODO: Send email notification to admins
    // TODO: Add to admin review queue

    return NextResponse.json({
      success: true,
      message: 'Community submitted successfully. We will review and add it soon!',
    });

  } catch (error: any) {
    console.error('❌ Community submission failed:', error);
    return NextResponse.json(
      { success: false, error: 'Submission failed' },
      { status: 500 }
    );
  }
}
