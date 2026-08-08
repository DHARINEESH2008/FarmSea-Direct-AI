import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ExchangeType } from '@prisma/client';

// GET /api/circular — list circular economy listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const exchangeType = searchParams.get('exchangeType');
    const listerId = searchParams.get('listerId');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { isActive: true };

    if (category) {
      where.category = category as never;
    }

    if (exchangeType) {
      where.exchangeType = exchangeType as ExchangeType;
    }

    if (listerId) {
      where.listerId = listerId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const listings = await db.circularListing.findMany({
      where,
      include: {
        exchanges: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Resolve lister names
    const listerIds = [...new Set(listings.map((l) => l.listerId))];
    const listers = await db.user.findMany({
      where: { id: { in: listerIds } },
      select: { id: true, name: true, role: true },
    });
    const listerMap = new Map(listers.map((u) => [u.id, u]));

    const listingsWithLister = listings.map((l) => {
      const lister = listerMap.get(l.listerId);
      return {
        ...l,
        listerName: lister?.name || 'Unknown',
        listerRole: lister?.role || null,
        images: typeof l.images === 'string' ? JSON.parse(l.images) : l.images,
        exchangeCount: l.exchanges.length,
      };
    });

    return NextResponse.json({
      success: true,
      listings: listingsWithLister,
      total: listingsWithLister.length,
    });
  } catch (error) {
    console.error('[CIRCULAR] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch circular listings' }, { status: 500 });
  }
}

// POST /api/circular — create listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      listerId,
      listerType,
      category,
      title,
      description,
      quantity,
      unit,
      exchangeType,
      wantedItem,
      price,
      location,
      latitude,
      longitude,
    } = body;

    if (!listerId || !listerType || !category || !title || !description || !quantity || !unit || !location) {
      return NextResponse.json(
        { error: 'listerId, listerType, category, title, description, quantity, unit, and location are required' },
        { status: 400 }
      );
    }

    const listing = await db.circularListing.create({
      data: {
        listerId,
        listerType,
        category: category as never,
        title,
        description,
        quantity,
        unit,
        exchangeType: (exchangeType as ExchangeType) || ExchangeType.SELL,
        wantedItem: wantedItem || null,
        price: price || null,
        location,
        latitude: latitude || null,
        longitude: longitude || null,
      },
    });

    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (error) {
    console.error('[CIRCULAR] POST Error:', error);
    return NextResponse.json({ error: 'Failed to create circular listing' }, { status: 500 });
  }
}
