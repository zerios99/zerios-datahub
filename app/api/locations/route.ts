import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { validateLocationInput } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

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
      images,
    } = body;

    // Validate required fields
    const validationErrors = validateLocationInput(body);
    if (validationErrors) {
      return NextResponse.json(
        { error: "Validation failed", errors: validationErrors },
        { status: 400 },
      );
    }

    // Create location in database with images
    const location = await prisma.location.create({
      data: {
        name,
        formalPlaceName: formalPlaceName || null,
        city,
        street: street || null,
        side: side || null,
        path: path || null,
        dir: dir || null,
        line: line || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        category,
        belongsToRoute: belongsToRoute || null,
        photoConfidence: parseInt(photoConfidence) || 100,
        notes: notes || null,
        pointType: pointType || "NEW",
        isSponsored: isSponsored || false,
        userId: session.userId,
        status: "PENDING",
        images: {
          create: (images || []).map((url: string) => ({
            url,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({
      success: true,
      location: {
        ...location,
        images: location.images.map((img) => img.url),
      },
    });
  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      include: {
        images: {
          select: { url: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      locations: locations.map((loc) => ({
        ...loc,
        images: loc.images.map((img) => img.url),
      })),
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 },
    );
  }
}
