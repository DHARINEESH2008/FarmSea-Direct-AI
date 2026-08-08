import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DeliveryStatus } from '@prisma/client';

// GET /api/delivery?deliveryPersonId=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deliveryPersonId = searchParams.get('deliveryPersonId');

    if (!deliveryPersonId) {
      return NextResponse.json(
        { error: 'deliveryPersonId query param is required' },
        { status: 400 }
      );
    }

    const assignments = await db.deliveryAssignment.findMany({
      where: { deliveryPersonId },
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            items: true,
          },
        },
        deliveryPerson: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      total: assignments.length,
      assigned: assignments.filter((a) => a.status === 'ASSIGNED').length,
      pickedUp: assignments.filter((a) => a.status === 'PICKED_UP').length,
      inTransit: assignments.filter((a) => a.status === 'IN_TRANSIT').length,
      delivered: assignments.filter((a) => a.status === 'DELIVERED').length,
      failed: assignments.filter((a) => a.status === 'FAILED').length,
      cancelled: assignments.filter((a) => a.status === 'CANCELLED').length,
    };

    return NextResponse.json({ success: true, assignments, stats });
  } catch (error) {
    console.error('[DELIVERY] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery data' }, { status: 500 });
  }
}

// PATCH /api/delivery — update delivery status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, status, actualTimeMin, failedReason, customerRating } = body;

    if (!assignmentId || !status) {
      return NextResponse.json(
        { error: 'assignmentId and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = Object.values(DeliveryStatus);
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status };

    if (status === 'PICKED_UP') {
      updateData.pickedUpAt = new Date();
    }

    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
      if (actualTimeMin) updateData.actualTimeMin = actualTimeMin;
      if (customerRating) updateData.customerRating = customerRating;
    }

    if (status === 'FAILED') {
      updateData.failedReason = failedReason || 'Not specified';
    }

    const assignment = await db.deliveryAssignment.update({
      where: { id: assignmentId },
      data: updateData,
      include: {
        order: true,
        deliveryPerson: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    // If delivered, update order status
    if (status === 'DELIVERED') {
      await db.order.update({
        where: { id: assignment.orderId },
        data: {
          status: 'DELIVERED',
          actualDelivery: new Date(),
        },
      });

      await db.deliveryProfile.update({
        where: { id: assignment.deliveryPersonId },
        data: {
          totalDeliveries: { increment: 1 },
        },
      });
    }

    return NextResponse.json({ success: true, assignment });
  } catch (error) {
    console.error('[DELIVERY] PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update delivery' }, { status: 500 });
  }
}
