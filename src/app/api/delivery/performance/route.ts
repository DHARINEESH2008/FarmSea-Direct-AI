import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/delivery/performance?id=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id query param is required' },
        { status: 400 }
      );
    }

    const records = await db.deliveryPerformance.findMany({
      where: { deliveryPersonId: id },
      orderBy: { month: 'desc' },
    });

    const latestRecord = records[0] || null;

    const avgMetrics = records.length > 0
      ? {
          avgOrdersCompleted: Math.round(records.reduce((s, r) => s + r.ordersCompleted, 0) / records.length),
          avgOrdersCancelled: Math.round(records.reduce((s, r) => s + r.ordersCancelled, 0) / records.length),
          avgDeliveryTime: Math.round((records.reduce((s, r) => s + (r.avgDeliveryTimeMin || 0), 0) / records.length) * 10) / 10,
          avgRating: Math.round((records.reduce((s, r) => s + (r.avgRating || 0), 0) / records.length) * 10) / 10,
          avgPunctuality: Math.round((records.reduce((s, r) => s + (r.punctualityScore || 0), 0) / records.length) * 10) / 10,
          totalDistanceKm: Math.round(records.reduce((s, r) => s + r.totalDistanceKm, 0) * 10) / 10,
          totalIncentiveEarned: Math.round(records.reduce((s, r) => s + r.incentiveEarned, 0) * 100) / 100,
        }
      : null;

    return NextResponse.json({
      success: true,
      performanceRecords: records,
      latestRecord,
      avgMetrics,
      totalMonths: records.length,
    });
  } catch (error) {
    console.error('[DELIVERY/PERFORMANCE] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
  }
}
