import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BookingStatus } from '@prisma/client';

// GET /api/bookings?customerId=&sellerId=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const sellerId = searchParams.get('sellerId');

    if (!customerId && !sellerId) {
      return NextResponse.json(
        { error: 'Provide either customerId or sellerId query param' },
        { status: 400 }
      );
    }

    const where: Record<string, string> = {};
    if (customerId) where.customerId = customerId;
    if (sellerId) where.sellerId = sellerId;

    const bookings = await db.booking.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      bookings,
      total: bookings.length,
    });
  } catch (error) {
    console.error('[BOOKINGS] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// POST /api/bookings — create booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      sellerId,
      sellerType,
      category,
      description,
      animalType,
      quantity,
      unit,
      expectedPrice,
      expectedDate,
      notes,
    } = body;

    if (!customerId || !sellerId || !sellerType || !category || !description || !quantity || !unit) {
      return NextResponse.json(
        { error: 'customerId, sellerId, sellerType, category, description, quantity, and unit are required' },
        { status: 400 }
      );
    }

    // Generate booking number
    const count = await db.booking.count();
    const bookingNumber = `FSB-${String(count + 1).padStart(6, '0')}`;

    const booking = await db.booking.create({
      data: {
        bookingNumber,
        customerId,
        sellerId,
        sellerType,
        category: category as never,
        description,
        animalType: animalType || null,
        quantity,
        unit,
        expectedPrice: expectedPrice || null,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        status: BookingStatus.PENDING,
        notes: notes || null,
      },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error('[BOOKINGS] POST Error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
