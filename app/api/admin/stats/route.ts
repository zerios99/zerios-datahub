import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const [
      totalUsers,
      totalLocations,
      pendingLocations,
      approvedLocations,
      rejectedLocations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.location.count(),
      prisma.location.count({ where: { status: 'PENDING' } }),
      prisma.location.count({ where: { status: 'APPROVED' } }),
      prisma.location.count({ where: { status: 'REJECTED' } }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalLocations,
      pendingLocations,
      approvedLocations,
      rejectedLocations,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
