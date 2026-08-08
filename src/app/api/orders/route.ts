import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

// GET /api/orders?customerId=&sellerId=
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

    const orders = await db.order.findMany({
      where,
      include: {
        items: true,
        payments: true,
        deliveries: true,
        customer: {
          select: { id: true, name: true, phone: true, avatar: true },
        },
        reviews: {
          select: { id: true, rating: true, comment: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      orders,
      total: orders.length,
    });
  } catch (error) {
    console.error('[ORDERS] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders — create order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, items, deliveryAddress, deliveryLat, deliveryLng, notes, paymentMethod } = body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'customerId and items array are required' },
        { status: 400 }
      );
    }

    if (!deliveryAddress) {
      return NextResponse.json(
        { error: 'deliveryAddress is required' },
        { status: 400 }
      );
    }

    // Validate products and calculate totals
    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const orderItems: Array<{
      productId: string;
      productName: string;
      price: number;
      quantity: number;
      unit: string;
      subtotal: number;
    }> = [];

    let subtotal = 0;
    let sellerId = '';
    let sellerType = '';

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }
      if (product.quantityAvailable < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.quantityAvailable}` },
          { status: 400 }
        );
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        unit: product.unit,
        subtotal: itemSubtotal,
      });

      if (!sellerId) {
        sellerId = product.sellerId;
        sellerType = product.sellerType;
      }
    }

    const deliveryFee = subtotal >= 500 ? 0 : 30;
    const totalAmount = subtotal + deliveryFee;

    // Generate order number
    const count = await db.order.count();
    const orderNumber = `FSD-${String(count + 1).padStart(6, '0')}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        customerId,
        sellerId,
        sellerType,
        status: OrderStatus.PENDING,
        subtotal,
        deliveryFee,
        totalAmount,
        deliveryAddress,
        deliveryLat: deliveryLat || null,
        deliveryLng: deliveryLng || null,
        notes: notes || null,
        estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2h from now
        items: {
          create: orderItems,
        },
        payments: {
          create: {
            amount: totalAmount,
            method: (paymentMethod as PaymentMethod) || PaymentMethod.COD,
            status: (paymentMethod === 'COD' ? PaymentStatus.PENDING : PaymentStatus.COMPLETED) as PaymentStatus,
            sellerPayout: subtotal * 0.9,
            platformFee: subtotal * 0.05,
            deliveryFee,
          },
        },
      },
      include: {
        items: true,
        payments: true,
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    // Update product stock
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { quantityAvailable: { decrement: item.quantity } },
      });
    }

    // Update customer profile totals
    await db.customerProfile.updateMany({
      where: { userId: customerId },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: totalAmount },
      },
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('[ORDERS] POST Error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
