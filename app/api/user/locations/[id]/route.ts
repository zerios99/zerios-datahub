import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      formalPlaceName,
      city,
      street,
      side,
      latitude,
      longitude,
      category,
      belongsToRoute,
      photoConfidence,
      notes,
      pointType,
      isSponsored,
      images,
    } = body;

    // Verify the location belongs to the user
    const existingLocation = await prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    if (existingLocation.userId !== session.userId) {
      return NextResponse.json(
        { error: "Not authorized to update this location" },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: Record<string, string | number | boolean> = {};
    if (name !== undefined) updateData.name = name;
    if (formalPlaceName !== undefined)
      updateData.formalPlaceName = formalPlaceName;
    if (city !== undefined) updateData.city = city;
    if (street !== undefined) updateData.street = street;
    if (side !== undefined) updateData.side = side;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (category !== undefined) updateData.category = category;
    if (belongsToRoute !== undefined)
      updateData.belongsToRoute = belongsToRoute;
    if (photoConfidence !== undefined)
      updateData.photoConfidence = photoConfidence;
    if (notes !== undefined) updateData.notes = notes;
    if (pointType !== undefined) updateData.pointType = pointType;
    if (isSponsored !== undefined) updateData.isSponsored = isSponsored;
    // Reset status to PENDING when user updates their location
    updateData.status = "PENDING";

    const location = await prisma.location.update({
      where: { id },
      data: {
        ...updateData,
        ...(images !== undefined && {
          images: {
            deleteMany: {},
            create: (images as string[]).map((url: string) => ({ url })),
          },
        }),
      },
      include: {
        images: {
          select: { url: true },
        },
      },
    });

    return NextResponse.json({
      location: {
        ...location,
        images: location.images.map((img) => img.url),
      },
    });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the location belongs to the user
    const existingLocation = await prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    if (existingLocation.userId !== session.userId) {
      return NextResponse.json(
        { error: "Not authorized to delete this location" },
        { status: 403 }
      );
    }

    // Delete the location
    await prisma.location.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  }
}
