import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, city, latitude, longitude, category, isSponsored, images } = body;

    // Validate required fields
    if (!name || !city || latitude === undefined || longitude === undefined || !category) {
      return NextResponse.json(
        { error: 'name, city, latitude, longitude, and category are required' },
        { status: 400 }
      );
    }

    // Create location in database
    const location = await prisma.location.create({
      data: {
        name,
        city,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        category,
        isSponsored: isSponsored || false,
        images: JSON.stringify(images || []),
        userId: session.userId,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      location: {
        ...location,
        images: JSON.parse(location.images),
      },
    });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      locations: locations.map((loc) => ({
        ...loc,
        images: JSON.parse(loc.images),
      })),
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}
