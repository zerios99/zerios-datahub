import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      location: {
        ...location,
        images: JSON.parse(location.images),
      },
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      name, 
      formalPlaceName,
      city, 
      street,
      side,
      path,
      dir,
      line,
      latitude,
      longitude,
      category, 
      belongsToRoute,
      photoConfidence,
      notes,
      pointType,
      isSponsored, 
      status,
      images
    } = body;

    const updateData: Record<string, string | boolean | number> = {};
    if (name !== undefined) updateData.name = name;
    if (formalPlaceName !== undefined) updateData.formalPlaceName = formalPlaceName;
    if (city !== undefined) updateData.city = city;
    if (street !== undefined) updateData.street = street;
    if (side !== undefined) updateData.side = side;
    if (path !== undefined) updateData.path = path;
    if (dir !== undefined) updateData.dir = dir;
    if (line !== undefined) updateData.line = line;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (category !== undefined) updateData.category = category;
    if (belongsToRoute !== undefined) updateData.belongsToRoute = belongsToRoute;
    if (photoConfidence !== undefined) updateData.photoConfidence = photoConfidence;
    if (notes !== undefined) updateData.notes = notes;
    if (pointType !== undefined) updateData.pointType = pointType;
    if (isSponsored !== undefined) updateData.isSponsored = isSponsored;
    if (status !== undefined) updateData.status = status;
    if (images !== undefined) updateData.images = JSON.stringify(images);

    const location = await prisma.location.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.location.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}
